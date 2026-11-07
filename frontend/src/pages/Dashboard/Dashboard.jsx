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
import {
  isThreeDaySplit,
  getTodaySchedule,
} from "../../utils/splitSchedule.js";

function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userProfile = useSelector((state) => state.user.profile);
  const demoMode = useSelector((state) => state.auth?.demoMode);

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
      if (demoMode) {
        // High-fidelity fallback metrics for demo / preview exploration
        setCompletedSessionsCount(4);
        setWeeklyTarget(6);
        setActivityList([
          {
            id: "demo-1",
            date: "Today",
            session: "Back & Biceps Hypertrophy",
            type: "Strength",
            duration: "52 min",
            volume: "9,840 kg",
            rpe: "8.5",
            dotColor: "#dc2626",
          },
          {
            id: "demo-2",
            date: "Yesterday",
            session: "Chest & Triceps Power",
            type: "Strength",
            duration: "48 min",
            volume: "8,920 kg",
            rpe: "8.0",
            dotColor: "#dc2626",
          },
          {
            id: "demo-3",
            date: "Nov 4, 2026",
            session: "Legs & Core Overload",
            type: "Strength",
            duration: "60 min",
            volume: "12,450 kg",
            rpe: "9.0",
            dotColor: "#dc2626",
          },
        ]);
        setActiveGoals([
          {
            _id: "demo-g1",
            title: "Bench Press",
            type: "strength",
            targetValue: 100,
            currentValue: 92.5,
            unit: "kg",
            deadline: "2026-12-31",
          },
          {
            _id: "demo-g2",
            title: "Weekly Consistency",
            type: "sessions",
            targetValue: 6,
            currentValue: 4,
            unit: "sessions",
            deadline: "2026-11-30",
          },
        ]);
        setWeeklyActivity([
          { day: "Mon", count: 1, done: true },
          { day: "Tue", count: 1, done: true },
          { day: "Wed", count: 0, done: false },
          { day: "Thu", count: 1, done: true },
          { day: "Fri", count: 1, done: true },
          { day: "Sat", count: 0, done: false },
          { day: "Sun", count: 0, done: false },
        ]);
      } else if (
        err?.status === 503 ||
        err?.status === 500 ||
        err?.message?.toLowerCase().includes("database") ||
        err?.message?.toLowerCase().includes("failed to fetch") ||
        err?.message?.toLowerCase().includes("network")
      ) {
        setDbOffline(true);
      }
    } finally {
      setLoading(false);
    }
  }, [demoMode, dispatch]);

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
        type: "success",
        isDemo: false,
      });
    };
    window.addEventListener("fittrack:workout-logged", handleWorkoutLogged);
    return () => window.removeEventListener("fittrack:workout-logged", handleWorkoutLogged);
  }, [loadDashboard]);



  // Calculated Readiness Score based on real training history
  const readiness = useMemo(() => {
    if (completedSessionsCount === 0) {
      return {
        score: 100,
        headline: "Fully Rested.",
        desc: "No training fatigue accumulated this week. Ready to attack your next session with maximal intensity.",
      };
    }
    if (completedSessionsCount >= weeklyTarget) {
      return {
        score: 82,
        headline: "Target Reached.",
        desc: "High volume week completed. Focus on hydration, quality sleep, and light active recovery.",
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

  const userSplit = dashboardUser?.workoutSplit || userProfile?.workoutSplit || "Push / Pull / Legs";
  const userFuturePlan = dashboardUser?.futureWorkoutPlan || userProfile?.futureWorkoutPlan;
  const userNextDay = dashboardUser?.nextWorkoutDay || userProfile?.nextWorkoutDay;
  const fitnessLevel = dashboardUser?.fitnessLevel || userProfile?.fitnessLevel || "Intermediate";

  // Auto-schedule logic for 3-day splits (Mon / Wed / Fri training + Sunday mandatory rest)
  const todaySchedule = useMemo(() => {
    if (isThreeDaySplit(userSplit)) {
      return getTodaySchedule(userSplit);
    }
    const isSun = new Date().getDay() === 0;
    if (isSun) {
      return {
        dayName: "Sunday",
        isSunday: true,
        isRest: true,
        session: "Sunday Rest & Recovery",
        category: "Recovery",
        nextTraining: {
          dayName: "Monday",
          session: userFuturePlan || "Monday Workout",
          category: "Strength",
        },
      };
    }
    return null;
  }, [userSplit, userFuturePlan]);

  // Next Session details based on user's split and planned future workout
  const nextSession = useMemo(() => {
    // If today is a 3-day split training day, prioritize today's auto-scheduled workout
    if (todaySchedule && !todaySchedule.isRest) {
      const duration = dashboardUser?.workoutDuration || userProfile?.workoutDuration || "45 min";
      const equipment = dashboardUser?.equipment || userProfile?.equipment || "Commercial Gym";
      return {
        title: todaySchedule.session,
        split: userSplit,
        dayTarget: "Today",
        category: todaySchedule.category || "Strength",
        duration,
        equipment,
        description: `Auto-scheduled for ${todaySchedule.dayName} under your ${userSplit}. Progressive overload focus.`,
        isAutoScheduled: true,
        isRest: false,
      };
    }

    // If today is an auto-scheduled rest day (e.g. Sunday or off-day under a 3-day split)
    if (todaySchedule && todaySchedule.isRest) {
      const nextTraining = todaySchedule.nextTraining;
      return {
        title: todaySchedule.session,
        split: userSplit,
        dayTarget: todaySchedule.isSunday ? "Sunday" : todaySchedule.dayName,
        category: todaySchedule.isSunday ? "Rest & Recovery" : "Active Recovery",
        duration: "Rest Day",
        equipment: "None Required",
        description: nextTraining
          ? `Auto-assigned rest day. Next training: ${nextTraining.dayName} • ${nextTraining.session}. Focus on hydration and sleep.`
          : `Dedicated rest day. Focus on hydration, mobility, and central nervous system replenishment.`,
        isAutoScheduled: true,
        isRest: true,
        isSunday: Boolean(todaySchedule.isSunday),
        nextTraining,
      };
    }

    if (!userFuturePlan || !userFuturePlan.trim()) {
      return null;
    }

    const duration = dashboardUser?.workoutDuration || userProfile?.workoutDuration || "45 min";
    const equipment = dashboardUser?.equipment || userProfile?.equipment || "Commercial Gym";

    const planLower = userFuturePlan.toLowerCase();
    let category = "Strength";
    if (planLower.includes("chest") || planLower.includes("pec")) category = "Chest";
    else if (planLower.includes("leg") || planLower.includes("quad") || planLower.includes("hamstring") || planLower.includes("squat")) category = "Legs";
    else if (planLower.includes("back") || planLower.includes("lat") || planLower.includes("pull")) category = "Back";
    else if (planLower.includes("bicep") || planLower.includes("arm") || planLower.includes("tricep")) category = "Arms";
    else if (planLower.includes("shoulder") || planLower.includes("delt")) category = "Shoulders";
    else if (planLower.includes("cardio") || planLower.includes("hiit") || planLower.includes("conditioning")) category = "Cardio";
    else if (planLower.includes("hypertrophy")) category = "Hypertrophy";

    return {
      title: userFuturePlan,
      split: userSplit,
      dayTarget: userNextDay || "Next Session",
      category,
      duration,
      equipment,
      description: `Targeted session under your ${userSplit} split. Focus on progressive overload and form.`,
      isAutoScheduled: false,
      isRest: false,
    };
  }, [todaySchedule, userFuturePlan, userSplit, userNextDay, dashboardUser, userProfile]);

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
      {loading && !dashboardUser && !userProfile && !dbOffline && (
        <div
          role="status"
          className={cx([styles, sharedStyles], "card-panel")}
          style={{
            padding: "16px 20px",
            textAlign: "center",
            color: "var(--text-muted)",
            fontSize: "0.88rem",
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
            borderRadius: "14px",
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
            aria-label="Retry connection to database cluster"
            style={{
              background: "#dc2626",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
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

      {/* SECTION 1: ATHLETE STATUS STRIP */}
      <section className={styles["athlete-status-bar"]}>
        <div className={styles["status-badge-item"]}>
          <span className={styles["status-badge-label"]}>Athlete Level</span>
          <strong className={styles["status-badge-val"]}>{fitnessLevel} Athlete</strong>
        </div>
        <div className={cx([styles, sharedStyles], "status-badge-item", styles["status-split-item"])}>
          <span className={styles["status-badge-label"]}>Active Split</span>
          <strong
            className={cx([styles, sharedStyles], "status-badge-val", styles["status-split-val"])}
          >
            {userSplit}
          </strong>
        </div>
        <div className={styles["status-badge-item"]}>
          <span className={styles["status-badge-label"]}>Weekly Target</span>
          <strong className={styles["status-badge-val"]}>{weeklyTarget} Sessions / Wk</strong>
        </div>
        <div className={styles["status-badge-item"]}>
          <span className={styles["status-badge-label"]}>Readiness Index</span>
          <strong
            className={cx(
              [styles, sharedStyles],
              "status-badge-val",
              readiness.score >= 85 ? styles["status-val-green"] : styles["status-val-amber"]
            )}
          >
            {readiness.score}/100 • {readiness.headline}
          </strong>
        </div>
      </section>

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

      {/* SECTION 2: FEATURED FOCUS: TODAY'S TRAINING / RECOVERY */}
      <section className={styles["featured-session-card"]}>
        {nextSession ? (
          <>
            <div className={styles["session-main-col"]}>
              <div className={styles["session-header-badge-row"]}>
                <span className={styles["session-badge-primary"]}>
                  {nextSession.isSunday
                    ? "SUNDAY RECOVERY"
                    : nextSession.isRest
                    ? "SCHEDULED REST DAY"
                    : nextSession.dayTarget?.toLowerCase() === "today"
                    ? "TODAY'S SCHEDULED SESSION"
                    : `${nextSession.dayTarget.toUpperCase()} SESSION`}
                </span>
                <span className={styles["session-badge-secondary"]}>
                  {nextSession.split}
                </span>
              </div>

              <h2 className={styles["session-headline-title"]}>
                {nextSession.title}
              </h2>

              <p className={styles["session-headline-desc"]}>
                {nextSession.description}
              </p>

              <div className={styles["session-specs-strip"]}>
                <span className={styles["session-spec-pill"]}>
                  <span aria-hidden="true">🎯</span> {nextSession.category}
                </span>
                <span className={styles["session-spec-pill"]}>
                  <span aria-hidden="true">⏱️</span> {nextSession.duration}
                </span>
                <span className={styles["session-spec-pill"]}>
                  <span aria-hidden="true">⚙️</span> {nextSession.equipment}
                </span>
              </div>
            </div>

            <div className={styles["session-action-col"]}>
              <button
                type="button"
                className={styles["start-workout-btn"]}
                aria-label={nextSession.isRest ? "Log recovery session" : "Start today's scheduled workout"}
                onClick={() => window.dispatchEvent(new CustomEvent("fittrack:open-log"))}
              >
                {nextSession.isRest ? "▶ LOG RECOVERY" : "▶ START WORKOUT"}
              </button>
              <button
                type="button"
                className={styles["view-details-btn"]}
                aria-label={nextSession.isRest ? "View weekly training schedule" : "View routine guide"}
                onClick={() => (nextSession.isRest ? navigate("/profile") : navigate("/workouts"))}
              >
                {nextSession.isRest ? "View Schedule" : "View Routine Guide"}
              </button>
            </div>
          </>
        ) : (
          <div className={styles["empty-state-box"]} style={{ width: "100%", margin: 0 }}>
            <div className={styles["empty-icon"]}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <h3 className={styles["empty-headline"]}>No upcoming session scheduled</h3>
            <p className={styles["empty-desc"]}>
              {userSplit
                ? `Active split: ${userSplit}. Assign today's body focus (Chest, Legs, Back, Arms) in your profile to keep your roadmap clear.`
                : "Choose your workout split and set your target training days in your athlete profile."}
            </p>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
              <Link
                to="/profile"
                className={styles["start-workout-btn"]}
                style={{ padding: "10px 22px", textDecoration: "none" }}
              >
                + Plan Next Session
              </Link>
              <Link
                to="/workouts"
                className={styles["view-details-btn"]}
                style={{ padding: "10px 20px", textDecoration: "none" }}
              >
                Browse Routine Library
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* SECTION 3: PERFORMANCE DIAGNOSTICS & WEEKLY CONSISTENCY (2 SPACIOUS COLUMNS) */}
      <div className={styles["two-col-grid"]}>
        {/* Card A: RECOVERY & READINESS */}
        <section className={styles["card"]}>
          <div className={styles["card-header"]}>
            <span className={styles["card-tag"]}>RECOVERY &amp; READINESS</span>
            <button
              type="button"
              className={styles["card-link-btn"]}
              aria-label="Learn more about recovery and readiness score"
              onClick={() =>
                setNotice({
                  isOpen: true,
                  title: "Training Readiness",
                  message: readiness.desc,
                  type: "info",
                  isDemo: false,
                })
              }
            >
              Learn more &rarr;
            </button>
          </div>

          <div className={styles["recovery-gauge-split"]}>
            {/* SVG Progress Arc Ring */}
            <div className={styles["gauge-ring-wrap"]}>
              <svg
                width="124"
                height="124"
                viewBox="0 0 120 120"
                className={styles["gauge-svg"]}
                role="img"
                aria-label={`Readiness score: ${readiness.score} out of 100`}
              >
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

          {/* 3 Recovery Sub-Metrics */}
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

        {/* Card B: WEEKLY TRAINING HABIT */}
        <section className={styles["card"]}>
          <div className={styles["card-header"]}>
            <span className={styles["card-tag"]}>WEEKLY TRAINING HABIT</span>
            <Link to="/workouts" className={styles["card-link"]} aria-label="View training split and workout routines">
              View Plan &rarr;
            </Link>
          </div>

          <div className={styles["weekly-title-wrap"]}>
            <h2 className={styles["weekly-count-headline"]}>
              {completedSessionsCount} OF {weeklyTarget} SESSIONS
            </h2>
            <p className={styles["weekly-subtext"]}>
              {completedSessionsCount === 0
                ? "No sessions recorded yet this week. Start strong today!"
                : completedSessionsCount >= weeklyTarget
                ? "Weekly training target reached! Outstanding consistency."
                : `On track: ${weeklyTarget - completedSessionsCount} session${weeklyTarget - completedSessionsCount === 1 ? "" : "s"} remaining to hit your target.`}
            </p>
          </div>

          {/* Bar Chart Visualization with actual user days */}
          <div
            className={styles["chart-container"]}
            role="region"
            aria-label="Weekly training sessions bar chart"
          >
            <div className={styles["chart-y-axis"]} aria-hidden="true">
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
                  <div
                    key={b.dayName}
                    className={styles["bar-col"]}
                    role="graphics-symbol"
                    aria-label={`${b.dayName}: ${b.barType}`}
                  >
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
      </div>

      {/* SECTION 4: RECENT ACTIVITY & ACTIVE GOALS (SPACIOUS 2 COLUMNS) */}
      <div className={styles["activity-goals-grid"]}>
        {/* Card C: RECENT ACTIVITY */}
        <section className={styles["card"]}>
          <div className={styles["card-header"]}>
            <span className={styles["card-tag"]}>RECENT TRAINING LOGS</span>
            <Link to="/logs" className={styles["card-link"]} aria-label="View all past training logs">
              View All Logs &rarr;
            </Link>
          </div>

          {activityList.length > 0 ? (
            <div className={styles["table-container"]}>
              <table className={styles["activity-table"]}>
                <caption className={styles["sr-only"]}>
                  Recent athletic training sessions log
                </caption>
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
                    <tr
                      key={row.id}
                      style={{ cursor: "pointer" }}
                      onClick={() => navigate("/logs")}
                      title="View in Workout Logs"
                    >
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
              <h3 className={styles["empty-headline"]}>No workouts logged yet</h3>
              <p className={styles["empty-desc"]}>
                Start building your training log. Every recorded session updates your volume, readiness, and consistency metrics.
              </p>
              <button
                type="button"
                className={styles["quick-log-btn"]}
                aria-label="Log your first workout session"
                style={{ padding: "10px 22px", alignSelf: "center" }}
                onClick={() => window.dispatchEvent(new CustomEvent("fittrack:open-log"))}
              >
                + Log First Workout
              </button>
            </div>
          )}
        </section>

        {/* Card D: ACTIVE GOALS */}
        <section className={styles["card"]}>
          <div className={styles["card-header"]}>
            <span className={styles["card-tag"]}>ACTIVE MILESTONES</span>
            <Link to="/goals" className={styles["card-link"]} aria-label="Manage active goals and benchmarks">
              Manage Goals &rarr;
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
              <h3 className={styles["empty-headline"]}>No active targets</h3>
              <p className={styles["empty-desc"]}>
                Set personal strength benchmarks, session targets, or bodyweight goals to keep your progress visible.
              </p>
              <Link
                to="/goals"
                className={styles["browse-routines-btn"]}
                aria-label="Set your first training goal"
                style={{ padding: "10px 22px", alignSelf: "center" }}
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
        type={notice.type}
        isDemo={notice.isDemo ?? false}
        onClose={() => setNotice({ isOpen: false, title: "", message: "", isDemo: false })}
      />
    </div>
  );
}

export default Dashboard;
