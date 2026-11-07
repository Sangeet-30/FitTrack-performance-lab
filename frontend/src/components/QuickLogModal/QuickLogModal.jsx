import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import styles from "./QuickLogModal.module.css";
import { logQuickWorkout } from "../../services/dashboardService.js";

const initialForm = {
  name: "Upper Body Strength",
  category: "Strength",
  durationMinutes: 60,
  exerciseName: "Bench Press",
  weight: 85,
  sets: 4,
  reps: 8,
  perceivedEffort: 8,
  notes: "",
};

export default function QuickLogModal({ isOpen, onClose, onSuccess }) {
  const demoMode = useSelector((state) => state.auth?.demoMode);
  const [logForm, setLogForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Reset or close on Escape key
  useEffect(() => {
    if (!isOpen) {
      setError("");
      return;
    }

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (demoMode) {
      setError("Demo Mode is active. Workout logging is read-only in demo mode. Create a free personal account to log and track your real sessions!");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const weightNum = Number(logForm.weight) || 0;
      const setsNum = Number(logForm.sets) || 1;
      const repsNum = Number(logForm.reps) || 1;
      const calculatedVolume = weightNum * setsNum * repsNum;

      const exercisesPayload = logForm.exerciseName.trim()
        ? [
            {
              name: logForm.exerciseName.trim(),
              totalSets: setsNum,
              reps: repsNum,
              weight: weightNum,
            },
          ]
        : [];

      await logQuickWorkout({
        name: logForm.name.trim() || "Strength Training",
        category: logForm.category,
        durationMinutes: Number(logForm.durationMinutes) || 45,
        totalVolume: calculatedVolume,
        perceivedEffort: Number(logForm.perceivedEffort) || 7,
        notes: logForm.notes ? logForm.notes.trim() : "",
        exercises: exercisesPayload,
      });

      // Broadcast globally so any mounted page (Dashboard, Workouts) refreshes its data
      window.dispatchEvent(new CustomEvent("fittrack:workout-logged", {
        detail: { name: logForm.name, category: logForm.category },
      }));

      if (typeof onSuccess === "function") {
        onSuccess(logForm.name);
      }

      onClose();
    } catch (err) {
      setError(err?.message || "Failed to log workout session. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles["modal-backdrop"]} onClick={onClose}>
      <div className={styles["modal-dialog"]} onClick={(e) => e.stopPropagation()}>
        <div className={styles["modal-header"]}>
          <div>
            <h3 className={styles["modal-title"]}>Log Workout Session</h3>
            <p className={styles["modal-sub"]}>
              Record your completed training session to update your volume, streak, and metrics.
            </p>
          </div>
          <button
            type="button"
            className={styles["modal-close"]}
            onClick={onClose}
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        {error && (
          <div className={styles["modal-error"]} role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles["modal-form"]}>
          <div className={styles["form-group"]}>
            <label htmlFor="ql-name">Session Name</label>
            <input
              id="ql-name"
              type="text"
              required
              value={logForm.name}
              onChange={(e) => setLogForm({ ...logForm, name: e.target.value })}
              placeholder="e.g. Upper Body Strength"
            />
          </div>

          <div className={styles["form-row-2"]}>
            <div className={styles["form-group"]}>
              <label htmlFor="ql-category">Category</label>
              <select
                id="ql-category"
                value={logForm.category}
                onChange={(e) => setLogForm({ ...logForm, category: e.target.value })}
              >
                <option value="Strength">Strength</option>
                <option value="Hypertrophy">Hypertrophy</option>
                <option value="Cardio">Cardio</option>
                <option value="Conditioning">Conditioning</option>
                <option value="Mobility">Mobility</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className={styles["form-group"]}>
              <label htmlFor="ql-duration">Duration (Minutes)</label>
              <input
                id="ql-duration"
                type="number"
                min="5"
                max="300"
                value={logForm.durationMinutes}
                onChange={(e) => setLogForm({ ...logForm, durationMinutes: e.target.value })}
              />
            </div>
          </div>

          <div className={styles["form-group"]}>
            <label htmlFor="ql-exercise">Main Exercise</label>
            <input
              id="ql-exercise"
              type="text"
              value={logForm.exerciseName}
              onChange={(e) => setLogForm({ ...logForm, exerciseName: e.target.value })}
              placeholder="e.g. Barbell Bench Press"
            />
          </div>

          <div className={styles["form-row-3"]}>
            <div className={styles["form-group"]}>
              <label htmlFor="ql-weight">Weight (kg)</label>
              <input
                id="ql-weight"
                type="number"
                min="0"
                step="0.5"
                value={logForm.weight}
                onChange={(e) => setLogForm({ ...logForm, weight: e.target.value })}
              />
            </div>
            <div className={styles["form-group"]}>
              <label htmlFor="ql-sets">Sets</label>
              <input
                id="ql-sets"
                type="number"
                min="1"
                max="20"
                value={logForm.sets}
                onChange={(e) => setLogForm({ ...logForm, sets: e.target.value })}
              />
            </div>
            <div className={styles["form-group"]}>
              <label htmlFor="ql-reps">Reps</label>
              <input
                id="ql-reps"
                type="number"
                min="1"
                max="100"
                value={logForm.reps}
                onChange={(e) => setLogForm({ ...logForm, reps: e.target.value })}
              />
            </div>
          </div>

          <div className={styles["form-group"]}>
            <label htmlFor="ql-notes">Notes &amp; Observations</label>
            <textarea
              id="ql-notes"
              rows="2"
              value={logForm.notes}
              onChange={(e) => setLogForm({ ...logForm, notes: e.target.value })}
              placeholder="How did the session feel? Any PRs?"
            />
          </div>

          <div className={styles["modal-actions"]}>
            <button
              type="button"
              className={styles["modal-cancel-btn"]}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={styles["modal-submit-btn"]}
            >
              {isSubmitting ? "Saving Session..." : "Save Session"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
