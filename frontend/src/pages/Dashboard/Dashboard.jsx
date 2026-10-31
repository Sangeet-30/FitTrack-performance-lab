import { useEffect, useState, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import styles from "./Dashboard.module.css";
import sharedStyles from "../../Shared.module.css";
import { cx } from "../../utils/classNames.js";
import NoticeModal from "../../components/NoticeModal/NoticeModal.jsx";
import {
  fetchDashboardData,
} from "../../services/dashboardService.js";
import { setProfile } from "../../features/user/userSlice.js";

function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userProfile = useSelector((state) => state.user.profile);

  // Real dashboard metrics
  const [activityList, setActivityList] = useState([]);
  const [activeGoals, setActiveGoals] = useState([]);
  const [weeklyActivity, setWeeklyActivity] = useState([]);
  const [completedSessionsCount, setCompletedSessionsCount] = useState(0);
  const [weeklyTarget, setWeeklyTarget] = useState(4);
  const [profileStatus, setProfileStatus] = useState(null);
  const [dashboardUser, setDashboardUser] = useState(null);

  const [notice, setNotice] = useState({ isOpen: false, title: "", message: "" });

  const [dbOffline, setDbOffline] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch live dashboard metrics gracefully from database
  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchDashboardData();
      setDbOffline(false);
      if (res) {
        if (res.user) {
          setDashboardUser(res.user);
          if (res.user.trainingDays) {
            setWeeklyTarget(res.user.trainingDays);
          }
          dispatch(setProfile(res.user));
        }

        if (res.profileStatus) {
          setProfileStatus(res.profileStatus);
        }

        if (res.stats) {
          setCompletedSessionsCount(res.stats.weeklyWorkoutsCount || 0);
          if (res.stats.weeklyGoalTarget) {
            setWeeklyTarget(res.stats.weeklyGoalTarget);
          }
        }

        if (Array.isArray(res.weeklyActivity)) {
          setWeeklyActivity(res.weeklyActivity);
        }

        if (Array.isArray(res.recentWorkouts)) {
          const mapped = res.recentWorkouts.map((w) => ({
            id: w._id || String(Math.random()),
            date: w.completedAt
              ? new Date(w.completedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "Today",
            session: w.name || "Workout Session",
            type: w.category || "Strength",
            duration: `${w.durationMinutes || 45} min`,
            volume: w.totalVolume ? `${w.totalVolume.toLocaleString()} kg` : "—",
            rpe: w.perceivedEffort ? `${w.perceivedEffort}` : "—",
            dotColor: w.category === "Cardio" ? "#f59e0b" : "#dc2626",
          }));
          setActivityList(mapped);
        }

        if (Array.isArray(res.activeGoals)) {
          setActiveGoals(res.activeGoals);
        }
      }
    } catch (err) {
      if (err?.status === 503 || err?.message?.toLowerCase().includes("database")) {
        setDbOffline(true);
      }
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Listen for global workout-logged event so metrics refresh automatically
  useEffect(() => {
    const handleWorkoutLogged = (event) => {
      loadDashboard();
      const sessionName = event?.detail?.name || "Session";
      setNotice({
        isOpen: true,
        title: "Session Logged",
        message: `Awesome job! "${sessionName}" has been recorded to your training history.`,
      });
    };
    window.addEventListener("fittrack:workout-logged", handleWorkoutLogged);
    return () => window.removeEventListener("fittrack:workout-logged", handleWorkoutLogged);
  }, [loadDashboard]);

  // Today badge string: "TODAY • TUE, APR 22"
  const todayBadge = useMemo(() => {
    try {
      const d = new Date();
      const str = d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }).toUpperCase();
      return `TODAY • ${str}`;
    } catch {
      return "TODAY";
    }
  }, []);

  // Calculated Readiness Score based on real training history
  const readiness = useMemo(() => {
    if (completedSessionsCount === 0) {
      return {
        score: 100,
        headline: "Fully Rested.",
        desc: "No training fatigue accumulated this week. Ready to attack your next session.",
      };
    }
    if (completedSessionsCount >= weeklyTarget) {
      return {
        score: 82,
        headline: "Target Reached.",
        desc: "High volume week completed. Focus on hydration, quality sleep, and light recovery.",
      };
    }
    return {
      score: 90,
      headline: "Good to go.",
      desc: "Training load is well balanced. Central nervous system is primed for high performance.",
    };
  }, [completedSessionsCount, weeklyTarget]);

  // Readiness SVG strokeDashoffset calculation (circle perimeter = 314.16)
  const readinessOffset = useMemo(() => {
    const fraction = (100 - readiness.score) / 100;
    return (314.16 * fraction).toFixed(1);
  }, [readiness.score]);

  // Next Session details based on user's real primary goal and preferences
  const nextSession = useMemo(() => {
    const goal = dashboardUser?.goal || userProfile?.goal || "Improve Fitness";
    const duration = dashboardUser?.workoutDuration || userProfile?.workoutDuration || "45 min";
    const equipment = dashboardUser?.equipment || userProfile?.equipment || "Standard Gym";

    return {
      title: `${goal} Session`,
      category: goal.includes("Endurance") || goal.includes("Fat") ? "Conditioning" : "Strength",
      duration,
      equipment,
      description: `Tailored program designed for progressive overload and ${goal.toLowerCase()}.`,
    };
  }, [dashboardUser, userProfile]);


  // Build standard 7-day Mon - Sun array from weeklyActivity
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const displayWeekBars = useMemo(() => {
    const today = new Date();
    const currentDayIdx = (today.getDay() + 6) % 7; // Monday = 0

    return daysOfWeek.map((dayName, idx) => {
      const match = weeklyActivity.find((w) => w.day === dayName);
      const isDone = Boolean(match?.done || (match?.count && match.count > 0));
      const isToday = idx === currentDayIdx;
      const isPast = idx < currentDayIdx;
      const isFuture = idx > currentDayIdx;

      let heightPercent = 0;
      let barType = "empty";

      if (isDone) {
        heightPercent = Math.min(60 + (match?.count || 1) * 20, 100);
        barType = "completed";
      } else if (isToday) {
        heightPercent = 85;
        barType = "today-target";
      } else if (isFuture) {
        heightPercent = 25;
        barType = "planned";
      } else if (isPast) {
        heightPercent = 0;
        barType = "empty";
      }

      return {
        dayName,
        heightPercent,
        barType,
        isDone,
      };
    });
  }, [weeklyActivity]);

  return (
    <div className={styles["dashboard-container"]}>
      {/* Loading state indicator */}
      {loading && !dashboardUser && !dbOffline && (
        <div
          role="status"
          className={cx([styles, sharedStyles], "card-panel")}
          style={{
            padding: "16px 20px",
            textAlign: "center",
            color: "var(--text-muted)",
            fontSize: "0.88rem",
            marginBottom: "16px",
          }}
        >
          Loading your athletic metrics...
        </div>
      )}

      {/* Database Offline Alert Banner */}
      {dbOffline && (
        <div
          role="alert"
          className={cx([styles, sharedStyles], "card-panel")}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            background: "rgba(220, 38, 38, 0.08)",
            border: "1px solid rgba(220, 38, 38, 0.28)",
            color: "var(--text-main)",
            padding: "14px 20px",
            borderRadius: "12px",
            marginBottom: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: "1.25rem" }}>⚠️</span>
            <div>
              <strong style={{ display: "block", fontSize: "0.92rem", marginBottom: 2 }}>
                Database temporarily unavailable
              </strong>
              <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--text-muted)" }}>
                FitTrack cannot reach the database cluster. Please verify your connection or try again shortly.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={loadDashboard}
            style={{
              background: "#dc2626",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              padding: "8px 16px",
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Profile Incomplete Banner (if < 100%) */}
      {profileStatus && !profileStatus.isComplete && (
        <div className={styles["profile-banner"]}>
          <div className={styles["profile-banner-left"]}>
            <div className={styles["banner-tag-row"]}>
              <span className={styles["banner-badge"]}>Profile Setup Incomplete • {profileStatus.percent}%</span>
            </div>
            <p className={styles["banner-text"]}>
              Add your age, height, and bodyweight to calculate accurate caloric burn and volume targets.
            </p>
          </div>
          <Link to="/profile" className={styles["banner-cta"]}>
            Complete Profile &rarr;
          </Link>
        </div>
      )}

      {/* Row 1: 3 Cards */}
      <div className={styles["top-cards-row"]}>
        {/* Card 1: WEEKLY TRAINING */}
        <section className={styles["card"]}>
          <div className={styles["card-header"]}>
            <span className={styles["card-tag"]}>WEEKLY TRAINING</span>
            <Link to="/workouts" className={styles["card-link"]}>
              View Plan &rarr;
            </Link>
          </div>

          <div className={styles["weekly-title-wrap"]}>
            <h2 className={styles["weekly-count-headline"]}>
              {completedSessionsCount} OF {weeklyTarget} SESSIONS
            </h2>
            <p className={styles["weekly-subtext"]}>
              {completedSessionsCount === 0
                ? "No sessions completed yet this week. Ready to train?"
                : completedSessionsCount >= weeklyTarget
                ? "Weekly training target achieved! Outstanding consistency."
                : `You're on track. ${weeklyTarget - completedSessionsCount} session${weeklyTarget - completedSessionsCount === 1 ? "" : "s"} left this week.`}
            </p>
          </div>

          {/* Bar Chart Visualization with actual user days */}
          <div className={styles["chart-container"]}>
            <div className={styles["chart-y-axis"]}>
              <span>2</span>
              <span>1</span>
              <span>0</span>
            </div>

            <div className={styles["chart-grid-area"]}>
              <div className={styles["grid-line"]} style={{ top: "0%" }} />
              <div className={styles["grid-line"]} style={{ top: "50%" }} />
              <div className={styles["grid-line"]} style={{ top: "100%" }} />

              <div className={styles["bars-wrapper"]}>
                {displayWeekBars.map((b) => (
                  <div key={b.dayName} className={styles["bar-col"]}>
                    <div className={styles["bar-track"]}>
                      {b.barType === "completed" && (
                        <div
                          className={styles["bar-fill-completed"]}
                          style={{ height: `${b.heightPercent}%` }}
                        />
                      )}
                      {b.barType === "today-target" && (
                        <div
                          className={styles["bar-fill-target"]}
                          style={{ height: `${b.heightPercent}%` }}
                        />
                      )}
                      {b.barType === "planned" && (
                        <div
                          className={styles["bar-fill-planned"]}
                          style={{ height: `${b.heightPercent}%` }}
                        />
                      )}
                    </div>
                    <span className={styles["bar-label"]}>{b.dayName}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chart Legend */}
          <div className={styles["chart-legend"]}>
            <span className={styles["legend-item"]}>
              <span className={styles["legend-dot-red"]} /> Completed
            </span>
            <span className={styles["legend-item"]}>
              <span className={styles["legend-dashed-box"]} /> Today Target
            </span>
            <span className={styles["legend-item"]}>
              <span className={styles["legend-dot-grey"]} /> Planned
            </span>
          </div>
        </section>

        {/* Card 2: RECOVERY & READINESS */}
        <section className={styles["card"]}>
          <div className={styles["card-header"]}>
            <span className={styles["card-tag"]}>RECOVERY &amp; READINESS</span>
            <button
              type="button"
              className={styles["card-link-btn"]}
              onClick={() =>
                setNotice({
                  isOpen: true,
                  title: "Training Readiness",
                  message: readiness.desc,
                })
              }
            >
              Learn more &rarr;
            </button>
          </div>

          <div className={styles["recovery-gauge-split"]}>
            {/* SVG Progress Arc Ring */}
            <div className={styles["gauge-ring-wrap"]}>
              <svg width="124" height="124" viewBox="0 0 120 120" className={styles["gauge-svg"]}>
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  className={styles["gauge-bg-circle"]}
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  className={styles["gauge-val-circle"]}
                  strokeDasharray="314.16"
                  strokeDashoffset={readinessOffset}
                />
              </svg>
              <div className={styles["gauge-center-text"]}>
                <span className={styles["gauge-number"]}>{readiness.score}</span>
                <span className={styles["gauge-scale"]}>/100</span>
              </div>
            </div>

            {/* Recovery State description */}
            <div className={styles["recovery-desc"]}>
              <h3 className={styles["recovery-headline"]}>{readiness.headline}</h3>
              <p className={styles["recovery-body"]}>{readiness.desc}</p>
            </div>
          </div>

          {/* 3 Recovery Sub-Metrics (Real status, not fake numbers!) */}
          <div className={styles["recovery-metrics-row"]}>
            <div className={styles["sub-metric-box"]}>
              <span className={styles["sub-metric-name"]}>SLEEP</span>
              <strong className={styles["sub-metric-val"]}>—</strong>
              <span className={styles["sub-metric-note"]}>Connect wearable</span>
            </div>

            <div className={styles["sub-metric-box"]}>
              <span className={styles["sub-metric-name"]}>HRV</span>
              <strong className={styles["sub-metric-val"]}>—</strong>
              <span className={styles["sub-metric-note"]}>Connect wearable</span>
            </div>

            <div className={styles["sub-metric-box"]}>
              <span className={styles["sub-metric-name"]}>RESTING HR</span>
              <strong className={styles["sub-metric-val"]}>—</strong>
              <span className={styles["sub-metric-note"]}>Not tracked</span>
            </div>
          </div>
        </section>

        {/* Card 3: NEXT SESSION */}
        <section className={styles["card"]}>
          <div className={styles["card-header"]}>
            <span className={styles["card-tag"]}>NEXT SESSION</span>
            <Link to="/workouts" className={styles["card-link"]}>
              View All &rarr;
            </Link>
          </div>

          <div className={styles["next-session-content"]}>
            <span className={styles["session-badge"]}>{todayBadge}</span>
            <h3 className={styles["session-title"]}>{nextSession.title}</h3>

            <div className={styles["session-specs-list"]}>
              <div className={styles["spec-item"]}>
                <span className={styles["spec-icon"]}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="m6.5 6.5 11 11" />
                    <path d="m21 21-1-1a2 2 0 0 0-2.8 0l-1.4 1.4a2 2 0 0 1-2.8 0L9.7 19.1a2 2 0 0 1 0-2.8l1.4-1.4a2 2 0 0 0 0-2.8L10 11" />
                    <path d="m3 3 1 1a2 2 0 0 0 2.8 0l1.4-1.4a2 2 0 0 1 2.8 0l4.3 4.3a2 2 0 0 1 0 2.8l-1.4 1.4a2 2 0 0 0 0 2.8l1.1 1.1" />
                  </svg>
                </span>
                <span>{nextSession.category}</span>
              </div>

              <div className={styles["spec-item"]}>
                <span className={styles["spec-icon"]}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </span>
                <span>{nextSession.duration}</span>
              </div>

              <div className={styles["spec-item"]}>
                <span className={styles["spec-icon"]}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <line x1="8" y1="6" x2="21" y2="6" />
                    <line x1="8" y1="12" x2="21" y2="12" />
                    <line x1="8" y1="18" x2="21" y2="18" />
                    <line x1="3" y1="6" x2="3.01" y2="6" />
                    <line x1="3" y1="12" x2="3.01" y2="12" />
                    <line x1="3" y1="18" x2="3.01" y2="18" />
                  </svg>
                </span>
                <span>{nextSession.equipment}</span>
              </div>

              <div className={styles["spec-item"]}>
                <span className={styles["spec-icon"]}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M18 20V10" />
                    <path d="M12 20V4" />
                    <path d="M6 20v-6" />
                  </svg>
                </span>
                <span>{nextSession.description}</span>
              </div>
            </div>

            <div className={styles["session-actions"]}>
              <button
                type="button"
                className={styles["start-workout-btn"]}
                onClick={() => window.dispatchEvent(new CustomEvent("fittrack:open-log"))}
              >
                ▶ START WORKOUT
              </button>
              <button
                type="button"
                className={styles["view-details-btn"]}
                onClick={() => navigate("/workouts")}
              >
                VIEW DETAILS
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Row 2: 2 Cards (Recent Activity + Goals) */}
      <div className={styles["bottom-cards-row"]}>
        {/* Card 4: RECENT ACTIVITY */}
        <section className={styles["card"]}>
          <div className={styles["card-header"]}>
            <span className={styles["card-tag"]}>RECENT ACTIVITY</span>
            <Link to="/workouts" className={styles["card-link"]}>
              View All &rarr;
            </Link>
          </div>

          {activityList.length > 0 ? (
            <div className={styles["table-container"]}>
              <table className={styles["activity-table"]}>
                <thead>
                  <tr>
                    <th>DATE</th>
                    <th>SESSION</th>
                    <th>TYPE</th>
                    <th>DURATION</th>
                    <th>VOLUME</th>
                    <th>RPE</th>
                    <th aria-label="Action" />
                  </tr>
                </thead>
                <tbody>
                  {activityList.map((row) => (
                    <tr key={row.id}>
                      <td className={styles["date-cell"]}>{row.date}</td>
                      <td className={styles["session-cell"]}>
                        <span
                          className={styles["activity-dot"]}
                          style={{ backgroundColor: row.dotColor }}
                        />
                        <strong>{row.session}</strong>
                      </td>
                      <td className={styles["type-cell"]}>{row.type}</td>
                      <td className={styles["duration-cell"]}>{row.duration}</td>
                      <td className={styles["volume-cell"]}>{row.volume}</td>
                      <td className={styles["rpe-cell"]}>{row.rpe}</td>
                      <td className={styles["chevron-cell"]}>&rsaquo;</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={styles["empty-state-box"]}>
              <div className={styles["empty-icon"]}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m6.5 6.5 11 11" />
                  <path d="m21 21-1-1a2 2 0 0 0-2.8 0l-1.4 1.4a2 2 0 0 1-2.8 0L9.7 19.1a2 2 0 0 1 0-2.8l1.4-1.4a2 2 0 0 0 0-2.8L10 11" />
                  <path d="m3 3 1 1a2 2 0 0 0 2.8 0l1.4-1.4a2 2 0 0 1 2.8 0l4.3 4.3a2 2 0 0 1 0 2.8l-1.4 1.4a2 2 0 0 0 0 2.8l1.1 1.1" />
                </svg>
              </div>
              <h4 className={styles["empty-headline"]}>No workouts logged yet</h4>
              <p className={styles["empty-desc"]}>
                Start building your training log. Every recorded session updates your volume, readiness, and consistency metrics.
              </p>
              <button
                type="button"
                className={styles["start-workout-btn"]}
                style={{ width: "auto", padding: "10px 24px", alignSelf: "center" }}
                onClick={() => window.dispatchEvent(new CustomEvent("fittrack:open-log"))}
              >
                + Log First Workout
              </button>
            </div>
          )}
        </section>

        {/* Card 5: GOALS */}
        <section className={styles["card"]}>
          <div className={styles["card-header"]}>
            <span className={styles["card-tag"]}>GOALS</span>
            <Link to="/goals" className={styles["card-link"]}>
              Manage &rarr;
            </Link>
          </div>

          {activeGoals.length > 0 ? (
            <div className={styles["goals-list"]}>
              {activeGoals.map((g) => (
                <div key={g._id || g.id} className={styles["goal-item"]}>
                  <div className={styles["goal-icon-box"]}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="12" r="6" />
                      <circle cx="12" cy="12" r="2" />
                    </svg>
                  </div>
                  <div className={styles["goal-details"]}>
                    <div className={styles["goal-title-row"]}>
                      <strong className={styles["goal-name"]}>{g.title}</strong>
                    </div>
                    <span className={styles["goal-sub"]}>
                      {g.currentValue} / {g.targetValue} {g.unit || "kg"}
                    </span>
                    <div className={styles["goal-progress-wrap"]}>
                      <div className={styles["goal-track"]}>
                        <div
                          className={styles["goal-bar"]}
                          style={{ width: `${Math.min(g.progressPercent || 0, 100)}%` }}
                        />
                      </div>
                      <span className={styles["goal-percent"]}>
                        {Math.min(g.progressPercent || 0, 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles["empty-state-box"]}>
              <div className={styles["empty-icon"]}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="6" />
                  <circle cx="12" cy="12" r="2" />
                </svg>
              </div>
              <h4 className={styles["empty-headline"]}>No active targets</h4>
              <p className={styles["empty-desc"]}>
                Set personal strength benchmarks, session targets, or bodyweight goals to keep your progress visible.
              </p>
              <Link
                to="/goals"
                className={styles["view-details-btn"]}
                style={{ width: "auto", padding: "10px 22px", textDecoration: "none", alignSelf: "center" }}
              >
                + Set Your First Goal
              </Link>
            </div>
          )}
        </section>
      </div>

      {/* Notice Modal */}
      <NoticeModal
        isOpen={notice.isOpen}
        title={notice.title}
        message={notice.message}
        onClose={() => setNotice({ isOpen: false, title: "", message: "" })}
      />
    </div>
  );
}

export default Dashboard;
