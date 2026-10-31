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
    (state) => state.user.preferences,
  );
  const savedProgress = loadFromStorage(STORAGE_KEYS.workoutProgress, {});

  const [secondsLeft, setSecondsLeft] = useState(() =>
    workout ? workout.duration * 60 : 0,
  );
  const [completedSets, setCompletedSets] = useState(() =>
    autoSaveWorkouts ? savedProgress[workoutId] || {} : {},
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
    setRestSecondsLeft(Number(restTimer));
    setIsResting(true);
  };

  const finishWorkout = async () => {
    if (isSaving) return;
    if (demoMode) {
      setSaveMessage("Demo Overview Mode: Workouts are not saved in live demo preview. Sign up for a personal account to track your sessions!");
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
          durationSeconds: Math.max(0, workout.duration * 60 - secondsLeft),
          exercises,
          notes: "Completed in FitTrack workout session.",
        }),
      });
      const progress = loadFromStorage(STORAGE_KEYS.workoutProgress, {});
      delete progress[workoutId];
      saveToStorage(STORAGE_KEYS.workoutProgress, progress);
      setSaveMessage("Workout saved to your account.");
      window.setTimeout(() => navigate("/progress"), 700);
    } catch (error) {
      setSaveMessage(`${error.message} Make sure the FitTrack API is running and you are signed in.`);
    } finally {
      setIsSaving(false);
    }
  };

  const progressPercentage = Math.min(
    100,
    Math.round((completedCount / totalExerciseCount) * 100),
  );

  return (
    <div className={cx([styles, sharedStyles], "active-workout-page")}>
      <section
        className={cx([styles, sharedStyles], "page-header-block card-panel")}
      >
        <div>
          <p className={cx([styles, sharedStyles], "eyebrow accent")}>
            Active workout
          </p>
          <h2>{workout.name}</h2>
        </div>
        <Link
          className={cx([styles, sharedStyles], "secondary-button")}
          to="/workouts"
        >
          Exit session
        </Link>
      </section>

      <section className={cx([styles, sharedStyles], "active-workout-grid")}>
        <div className={cx([styles, sharedStyles], "card-panel timer-panel")}>
          <div className={cx([styles, sharedStyles], "timer-ring")}>
            <div className={cx([styles, sharedStyles], "timer-content")}>
              <span>Time remaining</span>
              <strong>
                {String(minutes).padStart(2, "0")}:
                {String(seconds).padStart(2, "0")}
              </strong>
            </div>
          </div>

          <div className={cx([styles, sharedStyles], "timer-actions")}>
            <button
              type="button"
              className={cx([styles, sharedStyles], "primary-button")}
              onClick={() => setIsPaused((value) => !value)}
            >
              {isPaused ? "Resume" : "Pause"}
            </button>
            <button
              type="button"
              className={cx([styles, sharedStyles], "secondary-button")}
              onClick={resetWorkout}
            >
              Reset
            </button>
          </div>
          <div className={cx([styles, sharedStyles], "rest-timer")}>
            <span>
              Rest timer:{" "}
              {String(Math.floor(restSecondsLeft / 60)).padStart(2, "0")}:
              {String(restSecondsLeft % 60).padStart(2, "0")}
            </span>
            <button
              type="button"
              className={cx([styles, sharedStyles], "secondary-button")}
              onClick={startRestTimer}
            >
              {isResting ? "Restart rest" : `Start ${restTimer}s rest`}
            </button>
          </div>
        </div>

        <div
          className={cx([styles, sharedStyles], "card-panel progress-panel")}
        >
          <h3>Session progress</h3>
          <div
            className={cx([styles, sharedStyles], "progress-bar")}
            role="progressbar"
            aria-label="Exercise completion"
            aria-valuemin="0"
            aria-valuemax={totalExerciseCount}
            aria-valuenow={completedCount}
            aria-valuetext={`${completedCount} of ${totalExerciseCount} exercises completed`}
          >
            <span style={{ width: `${progressPercentage}%` }} />
          </div>
          <p>
            {completedCount}/{totalExerciseCount} exercises completed
          </p>
        </div>
      </section>

      <section className={cx([styles, sharedStyles], "card-panel workout-checklist")}>
        {saveMessage && <p role="status" aria-live="polite">{saveMessage}</p>}
        <button type="button" className={cx([styles, sharedStyles], "primary-button")} onClick={finishWorkout} disabled={isSaving}>
          {isSaving ? "Saving workout…" : "Finish & save workout"}
        </button>
      </section>

      <section
        className={cx([styles, sharedStyles], "card-panel workout-checklist")}
      >
        <h3>Exercise checklist</h3>
        <div className={cx([styles, sharedStyles], "exercise-checklist")}>
          {workout.exercisesList.map((exercise) => {
            const isChecked = Boolean(completedSets[exercise.name]);

            return (
              <button
                key={exercise.name}
                type="button"
                className={cx(
                  [styles, sharedStyles],
                  `check-item ${isChecked ? "done" : ""}`,
                )}
                onClick={() => toggleSetComplete(exercise.name)}
              >
                <span>{exercise.name}</span>
                <strong>
                  {exercise.sets} x {exercise.reps}
                </strong>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default ActiveWorkout;
