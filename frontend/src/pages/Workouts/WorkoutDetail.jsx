import styles from "./WorkoutDetail.module.css";
import sharedStyles from "../../Shared.module.css";
import { cx } from "../../utils/classNames.js";
import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { getWorkoutById } from "../../services/workoutService.js";

function WorkoutDetail() {
  const { workoutId } = useParams();
  const workout = useMemo(() => getWorkoutById(workoutId), [workoutId]);

  const totalSets = useMemo(() => {
    if (!workout?.exercisesList) return 0;
    return workout.exercisesList.reduce(
      (acc, item) => acc + (Number(item.sets) || 0),
      0,
    );
  }, [workout?.exercisesList]);

  const equipmentList = useMemo(() => {
    if (!workout?.equipment) return [];
    return workout.equipment
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }, [workout?.equipment]);

  if (!workout) {
    return (
      <div className={cx([styles, sharedStyles], "page-block")}>
        <div style={{ marginBottom: 16 }}>
          <Link to="/workouts" className={styles["back-link"]}>
            ← Back to Workout Library
          </Link>
        </div>
        <p className={cx([styles, sharedStyles], "eyebrow accent")}>
          Workout not found
        </p>
        <h2>We could not find that workout.</h2>
        <Link
          className={cx([styles, sharedStyles], "primary-button")}
          to="/workouts"
        >
          Browse All Workouts
        </Link>
      </div>
    );
  }

  const handleQuickLog = () => {
    window.dispatchEvent(
      new CustomEvent("fittrack:open-log", {
        detail: {
          name: workout.name,
          category: workout.category,
        },
      }),
    );
  };

  return (
    <div className={cx([styles, sharedStyles], "workout-detail-page")}>
      {/* Top Back Navigation Bar */}
      <div className={styles["top-nav-bar"]}>
        <Link to="/workouts" className={styles["back-link"]}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span>Back to Library</span>
        </Link>
        <span className={styles["nav-breadcrumb"]}>
          <span>Workouts</span>
          <span className={styles["breadcrumb-sep"]}>/</span>
          <span>{workout.category}</span>
          <span className={styles["breadcrumb-sep"]}>/</span>
          <strong className={styles["breadcrumb-current"]}>{workout.name}</strong>
        </span>
      </div>

      {/* Hero Header Section */}
      <section className={styles["hero-card"]}>
        <div className={styles["hero-main-content"]}>
          <div className={styles["hero-left"]}>
            <div className={styles["badge-row"]}>
              <span className={styles["category-badge"]}>{workout.category}</span>
              <span className={styles["difficulty-badge"]}>
                <span className={styles["difficulty-dot"]} />
                {workout.difficulty}
              </span>
              <span className={styles["lab-tag"]}>Athletic Lab Routine</span>
            </div>

            <h1 className={styles["workout-title"]}>{workout.name}</h1>
            <p className={styles["workout-desc"]}>{workout.description}</p>
          </div>

          <div className={styles["hero-actions"]}>
            <Link
              to={`/workouts/${workout.id}/active`}
              className={styles["start-btn"]}
            >
              <span>▶ START WORKOUT</span>
            </Link>
            <button
              type="button"
              onClick={handleQuickLog}
              className={styles["log-btn"]}
            >
              <span>+ LOG SESSION</span>
            </button>
          </div>
        </div>

        {/* 4-Stat Strip */}
        <div className={styles["stats-strip"]}>
          <div className={styles["stat-box"]}>
            <span className={styles["stat-label"]}>ESTIMATED TIME</span>
            <div className={styles["stat-value-row"]}>
              <strong className={styles["stat-number"]}>{workout.duration}</strong>
              <span className={styles["stat-unit"]}>min</span>
            </div>
            <span className={styles["stat-sub"]}>Target completion</span>
          </div>

          <div className={styles["stat-box"]}>
            <span className={styles["stat-label"]}>TOTAL MOVEMENTS</span>
            <div className={styles["stat-value-row"]}>
              <strong className={styles["stat-number"]}>
                {workout.exercisesList.length}
              </strong>
              <span className={styles["stat-unit"]}>exercises</span>
            </div>
            <span className={styles["stat-sub"]}>Curated lifts</span>
          </div>

          <div className={styles["stat-box"]}>
            <span className={styles["stat-label"]}>VOLUME TARGET</span>
            <div className={styles["stat-value-row"]}>
              <strong className={styles["stat-number"]}>{totalSets}</strong>
              <span className={styles["stat-unit"]}>working sets</span>
            </div>
            <span className={styles["stat-sub"]}>Routine total volume</span>
          </div>

          <div className={styles["stat-box"]}>
            <span className={styles["stat-label"]}>TRAINING FOCUS</span>
            <div className={styles["stat-value-row"]}>
              <strong className={styles["stat-text"]}>{workout.category}</strong>
            </div>
            <span className={styles["stat-sub"]}>Hypertrophy &amp; Power</span>
          </div>
        </div>
      </section>

      {/* Main Two-Column Layout */}
      <div className={styles["content-grid"]}>
        {/* Left Column: Intelligence, Muscle Anatomy & Equipment */}
        <div className={styles["left-column"]}>
          {/* Target Muscles */}
          <div className={styles["panel-card"]}>
            <div className={styles["panel-header"]}>
              <span className={styles["panel-tag"]}>ANATOMICAL TARGETS</span>
              <h3 className={styles["panel-title"]}>Target Muscle Groups</h3>
            </div>
            <div className={styles["muscle-chips-grid"]}>
              {workout.muscleGroups.map((group, idx) => (
                <div key={group} className={styles["muscle-chip"]}>
                  <div className={styles["muscle-chip-icon"]}>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div className={styles["muscle-chip-text"]}>
                    <strong className={styles["muscle-name"]}>{group}</strong>
                    <span className={styles["muscle-role"]}>
                      {idx === 0 ? "Primary Driver" : "Secondary / Synergist"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Required Equipment */}
          <div className={styles["panel-card"]}>
            <div className={styles["panel-header"]}>
              <span className={styles["panel-tag"]}>FACILITY REQUIREMENTS</span>
              <h3 className={styles["panel-title"]}>Equipment Needed</h3>
            </div>
            <div className={styles["equipment-chips-wrap"]}>
              {equipmentList.map((item) => (
                <span key={item} className={styles["equipment-pill"]}>
                  <span className={styles["equipment-dot"]} />
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Lab Training Strategy & Coaching Tips */}
          <div className={styles["panel-card"]}>
            <div className={styles["panel-header"]}>
              <span className={styles["panel-tag"]}>COACHING PROTOCOL</span>
              <h3 className={styles["panel-title"]}>Execution Strategy</h3>
            </div>
            <ul className={styles["coaching-tips-list"]}>
              <li className={styles["tip-item"]}>
                <span className={styles["tip-bullet"]}>01</span>
                <div>
                  <strong>Warm-Up &amp; Acclimation:</strong>
                  <p>Perform 2 progressive warm-up sets on the first movement prior to loading working weight.</p>
                </div>
              </li>
              <li className={styles["tip-item"]}>
                <span className={styles["tip-bullet"]}>02</span>
                <div>
                  <strong>Rest &amp; Recovery Intervals:</strong>
                  <p>Rest 90–120 seconds between heavy compound sets, and 60–75 seconds for isolation work.</p>
                </div>
              </li>
              <li className={styles["tip-item"]}>
                <span className={styles["tip-bullet"]}>03</span>
                <div>
                  <strong>Progressive Overload:</strong>
                  <p>Aim to add 1 rep or 1.25–2.5 kg once top rep bracket is reached with strict technique.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Complete Session Structure & Exercises */}
        <div className={styles["right-column"]}>
          <div className={styles["panel-card"]}>
            <div className={styles["panel-header-split"]}>
              <div>
                <span className={styles["panel-tag"]}>EXERCISE PROTOCOL</span>
                <h3 className={styles["panel-title"]}>Session Structure</h3>
              </div>
              <span className={styles["count-pill"]}>
                {workout.exercisesList.length} Exercises • {totalSets} Sets
              </span>
            </div>

            <div className={styles["exercise-cards-stack"]}>
              {workout.exercisesList.map((exercise, index) => (
                <div key={exercise.name} className={styles["exercise-row-card"]}>
                  <div className={styles["exercise-index-box"]}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                  </div>

                  <div className={styles["exercise-info"]}>
                    <h4 className={styles["exercise-name"]}>{exercise.name}</h4>
                    <div className={styles["exercise-meta-tags"]}>
                      <span className={styles["exercise-meta-tag"]}>
                        {index === 0 ? "Anchor Lift" : "Hypertrophy Movement"}
                      </span>
                      <span className={styles["exercise-meta-dot"]}>•</span>
                      <span className={styles["exercise-rep-bracket"]}>
                        Target RPE 8–9
                      </span>
                    </div>
                  </div>

                  <div className={styles["exercise-sets-reps-badge"]}>
                    <span className={styles["sets-num"]}>{exercise.sets}</span>
                    <span className={styles["sets-x"]}>×</span>
                    <span className={styles["reps-num"]}>{exercise.reps}</span>
                    <span className={styles["reps-label"]}>REPS</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Routine Footer CTA */}
            <div className={styles["routine-footer-cta"]}>
              <div className={styles["routine-footer-text"]}>
                <strong>Ready to attack this workout?</strong>
                <span>Real-time set timers, plate calculators, and automatic log recording.</span>
              </div>
              <Link
                to={`/workouts/${workout.id}/active`}
                className={styles["footer-start-btn"]}
              >
                Start Session →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkoutDetail;
