import styles from "./ActiveWorkout.module.css";
import sharedStyles from "../../Shared.module.css";
import { cx } from "../../utils/classNames.js";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../../services/api.js";
import { getWorkoutById } from "../../services/workoutService.js";
import {
  loadFromStorage,
  saveToStorage,
  STORAGE_KEYS,
} from "../../utils/storage.js";

function ActiveWorkout() {
  const { workoutId } = useParams();
  return <ActiveWorkoutSession key={workoutId} workoutId={workoutId} />;
}

function ActiveWorkoutSession({ workoutId }) {
  const navigate = useNavigate();
  const workout = useMemo(() => getWorkoutById(workoutId), [workoutId]);
  const demoMode = useSelector((state) => state.auth.demoMode);
  const { autoSaveWorkouts, restTimer } = useSelector(
    (state) => state.user.preferences
  );
  const savedProgress = loadFromStorage(STORAGE_KEYS.workoutProgress, {});

  const [secondsLeft, setSecondsLeft] = useState(() =>
    workout ? workout.duration * 60 : 0
  );
  const [completedSets, setCompletedSets] = useState(() =>
    autoSaveWorkouts ? savedProgress[workoutId] || {} : {}
  );
  const [isPaused, setIsPaused] = useState(false);
  const [restSecondsLeft, setRestSecondsLeft] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    if (!workout || isPaused || secondsLeft <= 0) return;

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [workout, isPaused, secondsLeft]);

  useEffect(() => {
    if (!isResting || restSecondsLeft <= 0) return;

    const timer = window.setInterval(() => {
      setRestSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isResting, restSecondsLeft]);

  if (!workout) {
    return (
      <div className={cx([styles, sharedStyles], "page-block")}>
        <p className={cx([styles, sharedStyles], "eyebrow accent")}>
          Workout unavailable
        </p>
        <h2>That session could not be loaded.</h2>
        <Link
          className={cx([styles, sharedStyles], "primary-button")}
          to="/workouts"
        >
          Return to library
        </Link>
      </div>
    );
  }

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const totalExerciseCount = workout.exercisesList.length;
  const completedCount = Object.values(completedSets).filter(Boolean).length;

  const toggleSetComplete = (exerciseName) => {
    const nextCompletedSets = {
      ...completedSets,
      [exerciseName]: !completedSets[exerciseName],
    };

    setCompletedSets(nextCompletedSets);

    if (autoSaveWorkouts) {
      const progress = loadFromStorage(STORAGE_KEYS.workoutProgress, {});
      saveToStorage(STORAGE_KEYS.workoutProgress, {
        ...progress,
        [workoutId]: nextCompletedSets,
      });
    }
  };

  const resetWorkout = () => {
    setSecondsLeft(workout.duration * 60);
    setCompletedSets({});
    setIsPaused(false);
    setRestSecondsLeft(0);
    setIsResting(false);

    if (autoSaveWorkouts) {
      const progress = loadFromStorage(STORAGE_KEYS.workoutProgress, {});
      delete progress[workoutId];
      saveToStorage(STORAGE_KEYS.workoutProgress, progress);
    }
  };

  const startRestTimer = () => {
    setRestSecondsLeft(Number(restTimer || 90));
    setIsResting(true);
  };

  const finishWorkout = async () => {
    if (isSaving) return;
    if (demoMode) {
      setSaveMessage("Demo Overview Mode: Workouts are not saved in live demo preview.");
      return;
    }
    setIsSaving(true);
    setSaveMessage("");
    const exercises = workout.exercisesList.map((exercise) => ({
      exerciseId: exercise.id || exercise.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name: exercise.name,
      sets: Array.from({ length: Number.parseInt(exercise.sets, 10) || 1 }, (_, index) => ({
        setNumber: index + 1,
        reps: Number.parseInt(exercise.reps, 10) || 0,
        weight: 0,
        completed: Boolean(completedSets[exercise.name]),
      })),
    }));
    try {
      await apiRequest("/workouts", {
        method: "POST",
        body: JSON.stringify({
          planId: workout.id,
          name: workout.name,
          startedAt: new Date(Date.now() - Math.max(0, workout.duration * 60 - secondsLeft) * 1000).toISOString(),
          completedAt: new Date().toISOString(),
          durationMinutes: Math.max(1, Math.round((workout.duration * 60 - secondsLeft) / 60)),
          exercises,
          notes: "Completed in FitTrack live studio session.",
        }),
      });
      const progress = loadFromStorage(STORAGE_KEYS.workoutProgress, {});
      delete progress[workoutId];
      saveToStorage(STORAGE_KEYS.workoutProgress, progress);
      setSaveMessage("Session successfully logged to your athlete history!");

      // Broadcast event so dashboard & logs update
      window.dispatchEvent(
        new CustomEvent("fittrack:workout-logged", { detail: { name: workout.name } })
      );

      window.setTimeout(() => navigate("/logs"), 700);
    } catch (error) {
      setSaveMessage(`${error.message} Check connection and try again.`);
    } finally {
      setIsSaving(false);
    }
  };

  const progressPercentage = Math.min(
    100,
    Math.round((completedCount / totalExerciseCount) * 100)
  );

  return (
    <div className={styles["active-workout-page"]}>
      {/* SECTION 1: STUDIO HEADER */}
      <section className={styles["studio-header"]}>
        <div>
          <p className={cx([sharedStyles], "eyebrow accent")} style={{ margin: 0 }}>
            LIVE WORKOUT STUDIO • {workout.category?.toUpperCase() || "STRENGTH"}
          </p>
          <h1>{workout.name}</h1>
        </div>

        <Link className={styles["exit-btn"]} to="/workouts">
          ← Exit Session
        </Link>
      </section>

      {/* SECTION 2: STUDIO 2-COLUMN VIEW */}
      <div className={styles["studio-grid"]}>
        {/* Left Column: Timer & Controls */}
        <div className={styles["left-panel-col"]}>
          {/* Main Countdown Timer */}
          <section className={styles["timer-card"]}>
            <div className={styles["timer-ring"]}>
              <div className={styles["timer-content"]}>
                <span className={styles["timer-label"]}>Time Remaining</span>
                <strong className={styles["timer-digits"]}>
                  {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                </strong>
              </div>
            </div>

            <div className={styles["timer-actions"]}>
              <button
                type="button"
                className={`${styles["timer-btn"]} ${styles["pause-btn"]}`}
                onClick={() => setIsPaused((value) => !value)}
              >
                {isPaused ? "▶ Resume" : "⏸ Pause"}
              </button>
              <button
                type="button"
                className={`${styles["timer-btn"]} ${styles["reset-btn"]}`}
                onClick={resetWorkout}
              >
                ↺ Reset
              </button>
            </div>

            {/* Rest Timer Strip */}
            <div className={styles["rest-timer-box"]}>
              <span className={styles["rest-time-label"]}>
                Rest Interval:{" "}
                <strong>
                  {String(Math.floor(restSecondsLeft / 60)).padStart(2, "0")}:
                  {String(restSecondsLeft % 60).padStart(2, "0")}
                </strong>
              </span>
              <button
                type="button"
                className={styles["rest-btn"]}
                onClick={startRestTimer}
              >
                {isResting ? "Restart Rest" : `Start ${restTimer || 90}s Rest`}
              </button>
            </div>
          </section>

          {/* Session Progress Card */}
          <section className={styles["progress-card"]}>
            <div className={styles["progress-header"]}>
              <h3>Session Progress</h3>
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--accent-red)" }}>
                {completedCount} / {totalExerciseCount} Complete
              </span>
            </div>

            <div
              className={styles["progress-track"]}
              role="progressbar"
              aria-label="Exercise completion"
              aria-valuemin="0"
              aria-valuemax={totalExerciseCount}
              aria-valuenow={completedCount}
            >
              <div
                className={styles["progress-fill"]}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            {saveMessage && (
              <p
                role="status"
                style={{
                  fontSize: "0.85rem",
                  color: "var(--accent-red)",
                  margin: "6px 0 0",
                  fontWeight: 600,
                }}
              >
                {saveMessage}
              </p>
            )}

            <button
              type="button"
              className={styles["finish-workout-btn"]}
              onClick={finishWorkout}
              disabled={isSaving}
              style={{ marginTop: 8 }}
            >
              {isSaving ? "Saving Session…" : "✓ Finish & Save Workout"}
            </button>
          </section>
        </div>

        {/* Right Column: Interactive Checklist */}
        <section className={styles["checklist-card"]}>
          <div className={styles["checklist-header"]}>
            <h3>Movement Execution Checklist</h3>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              Tap item to mark completed
            </span>
          </div>

          <div className={styles["exercise-list"]}>
            {workout.exercisesList.map((exercise) => {
              const isChecked = Boolean(completedSets[exercise.name]);

              return (
                <div
                  key={exercise.name}
                  className={`${styles["exercise-item"]} ${isChecked ? styles["done"] : ""}`}
                  onClick={() => toggleSetComplete(exercise.name)}
                >
                  <div className={styles["item-left"]}>
                    <div className={styles["check-circle"]}>
                      ✓
                    </div>
                    <span className={styles["exercise-name"]}>{exercise.name}</span>
                  </div>

                  <span className={styles["sets-pill"]}>
                    {exercise.sets} × {exercise.reps}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

export default ActiveWorkout;
