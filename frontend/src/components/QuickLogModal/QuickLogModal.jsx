import { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import styles from "./QuickLogModal.module.css";
import { logQuickWorkout } from "../../services/dashboardService.js";
import { SPLIT_SCHEDULES, getTodaySchedule } from "../../utils/splitSchedule.js";

const initialForm = {
  completedAt: new Date().toISOString().slice(0, 10),
  name: "",
  category: "Strength",
  durationMinutes: "",
  exerciseName: "",
  weight: "",
  sets: "",
  reps: "",
  perceivedEffort: "",
  caloriesBurned: "",
  notes: "",
};

function calculateEstimatedCalories({ durationMinutes, category, perceivedEffort }) {
  const duration = Number(durationMinutes) || 45;
  const rpe = Number(perceivedEffort) || 7;
  let baseRate = 7.5; // kcal per minute
  if (category === "Cardio") baseRate = 10;
  else if (category === "Conditioning") baseRate = 9;
  else if (category === "Hypertrophy" || category === "Strength") baseRate = 7.5;
  else if (category === "Mobility") baseRate = 4;
  else baseRate = 6.5;

  const rpeFactor = 0.7 + (rpe / 10) * 0.6;
  return Math.round(duration * baseRate * rpeFactor);
}

export default function QuickLogModal({ isOpen, onClose, onSuccess, initialData }) {
  const demoMode = useSelector((state) => state.auth?.demoMode);
  const authUser = useSelector((state) => state.auth?.user);
  const userProfile = useSelector((state) => state.user?.profile);
  const [logForm, setLogForm] = useState(initialForm);
  const [selectedPlanRoutine, setSelectedPlanRoutine] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Only routines from the user's active training split
  const activeSplitRoutines = useMemo(() => {
    const split =
      userProfile?.workoutSplit ||
      authUser?.workoutSplit ||
      "Back & Biceps / Chest & Triceps / Legs & Shoulders";

    const routinesMap = new Map();

    if (split) {
      if (SPLIT_SCHEDULES[split]) {
        const scheduleObj = SPLIT_SCHEDULES[split].schedule;
        Object.entries(scheduleObj).forEach(([, item]) => {
          if (!item.isRest && item.session) {
            if (!routinesMap.has(item.session)) {
              routinesMap.set(item.session, {
                session: item.session,
                category: item.category,
              });
            }
          }
        });
      } else {
        // Strip outer labels like "Bro Split (Chest, Back...)"
        const cleaned = split.replace(/^[^()]*\(([^)]+)\)$/, "$1");
        const parts = cleaned.split(/[/|,•]/).map((p) => p.trim()).filter(Boolean);
        parts.forEach((p) => {
          let cat = "Strength";
          const lower = p.toLowerCase();
          if (lower.includes("chest")) cat = "Chest";
          else if (lower.includes("back") || lower.includes("pull")) cat = "Back";
          else if (lower.includes("leg") || lower.includes("lower")) cat = "Legs";
          else if (lower.includes("shoulder") || lower.includes("arm")) cat = "Strength";

          let sessionName = p;
          if (
            !sessionName.toLowerCase().includes("day") &&
            !sessionName.toLowerCase().includes("session") &&
            !sessionName.toLowerCase().includes("power") &&
            !sessionName.toLowerCase().includes("density")
          ) {
            sessionName = `${p} Day`;
          }
          routinesMap.set(sessionName, {
            session: sessionName,
            category: cat,
          });
        });
      }
    }

    return Array.from(routinesMap.values());
  }, [userProfile?.workoutSplit, authUser?.workoutSplit]);

  // Reset or initialize on open, auto-filling details about the workout
  useEffect(() => {
    if (!isOpen) {
      setError("");
      setLogForm(initialForm);
      setSelectedPlanRoutine("");
      return;
    }

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Auto-fill details about today's scheduled workout
    const split =
      userProfile?.workoutSplit ||
      authUser?.workoutSplit ||
      "Back & Biceps / Chest & Triceps / Legs & Shoulders";

    const sched = getTodaySchedule(split);
    const targetSession =
      initialData?.name ||
      (sched && !sched.isRest ? sched.session : activeSplitRoutines[0]?.session) ||
      "Strength Training";

    const targetCategory =
      initialData?.category ||
      (sched && !sched.isRest ? sched.category : activeSplitRoutines[0]?.category) ||
      "Strength";

    const targetDuration =
      Number(initialData?.durationMinutes) ||
      Number.parseInt(userProfile?.workoutDuration, 10) ||
      45;

    const targetEffort = 8;
    const autoCals = calculateEstimatedCalories({
      durationMinutes: targetDuration,
      category: targetCategory,
      perceivedEffort: targetEffort,
    });

    setLogForm({
      completedAt: initialData?.completedAt
        ? initialData.completedAt.slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      name: targetSession,
      category: targetCategory,
      durationMinutes: targetDuration,
      exerciseName: "",
      weight: "",
      sets: "",
      reps: "",
      perceivedEffort: targetEffort,
      caloriesBurned: autoCals,
      notes: initialData?.notes || "",
    });
    setSelectedPlanRoutine(targetSession);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, initialData, activeSplitRoutines, userProfile, authUser, onClose]);

  // Reactive field update: automatically recalculates calories whenever duration, category, or effort changes
  const updateFormField = (field, value) => {
    setLogForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "durationMinutes" || field === "category" || field === "perceivedEffort") {
        const rawDuration = field === "durationMinutes" ? value : prev.durationMinutes;
        const d = Number(rawDuration);
        const c = field === "category" ? value : prev.category;
        const r = Number(field === "perceivedEffort" ? value : prev.perceivedEffort) || 7;
        if (d > 0) {
          next.caloriesBurned = calculateEstimatedCalories({
            durationMinutes: d,
            category: c,
            perceivedEffort: r,
          });
        } else if (rawDuration === "") {
          next.caloriesBurned = "";
        }
      }
      return next;
    });
  };

  const handleRoutineSelect = (routineTitle) => {
    setSelectedPlanRoutine(routineTitle);
    if (!routineTitle) return;
    if (routineTitle === "custom") {
      setLogForm((prev) => ({ ...prev, name: "" }));
      return;
    }

    const matchedRoutine = activeSplitRoutines.find((r) => r.session === routineTitle);
    let matchedCat = matchedRoutine?.category || logForm.category;

    if (!matchedRoutine) {
      const lower = routineTitle.toLowerCase();
      if (lower.includes("chest")) matchedCat = "Chest";
      else if (lower.includes("back") || lower.includes("pull")) matchedCat = "Back";
      else if (lower.includes("leg") || lower.includes("quad") || lower.includes("glute")) matchedCat = "Legs";
      else if (
        lower.includes("push") ||
        lower.includes("shoulder") ||
        lower.includes("trap") ||
        lower.includes("arm") ||
        lower.includes("bicep") ||
        lower.includes("tricep")
      )
        matchedCat = "Strength";
      else if (lower.includes("hiit") || lower.includes("cardio") || lower.includes("run") || lower.includes("aerobic"))
        matchedCat = "Cardio";
      else if (lower.includes("hypertrophy")) matchedCat = "Hypertrophy";
      else if (lower.includes("core") || lower.includes("abs") || lower.includes("conditioning"))
        matchedCat = "Conditioning";
      else if (lower.includes("mobility") || lower.includes("stretch") || lower.includes("recovery"))
        matchedCat = "Mobility";
    }

    const duration = Number(logForm.durationMinutes) || 45;
    const effort = Number(logForm.perceivedEffort) || 7;
    const autoCals = calculateEstimatedCalories({
      durationMinutes: duration,
      category: matchedCat,
      perceivedEffort: effort,
    });

    setLogForm((prev) => ({
      ...prev,
      name: routineTitle,
      category: matchedCat,
      durationMinutes: prev.durationMinutes || 45,
      caloriesBurned: autoCals,
    }));
  };

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
      const todayStr = new Date().toISOString().slice(0, 10);
      const chosenDate = logForm.completedAt || todayStr;
      if (chosenDate > todayStr) {
        setError("Workout session date cannot be in the future. Please select today or a previous date.");
        setIsSubmitting(false);
        return;
      }

      const weightNum = Number(logForm.weight) || 0;
      const setsNum = Number(logForm.sets) || 1;
      const repsNum = Number(logForm.reps) || 1;
      const calculatedVolume = weightNum * setsNum * repsNum;
      const parsedDuration = Number(logForm.durationMinutes) || 45;
      const parsedEffort = Number(logForm.perceivedEffort) || 7;

      const finalCalories = logForm.caloriesBurned !== ""
        ? Number(logForm.caloriesBurned) || 0
        : calculateEstimatedCalories({
            durationMinutes: parsedDuration,
            category: logForm.category,
            perceivedEffort: parsedEffort,
          });

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
        durationMinutes: parsedDuration,
        totalVolume: calculatedVolume,
        perceivedEffort: parsedEffort,
        caloriesBurned: finalCalories,
        completedAt: new Date(chosenDate + "T12:00:00").toISOString(),
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
    <div className={styles["modal-backdrop"]}>
      <div className={styles["modal-dialog"]}>
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
            <label htmlFor="ql-plan-select">Routine from Active Split</label>
            <select
              id="ql-plan-select"
              value={selectedPlanRoutine}
              onChange={(e) => handleRoutineSelect(e.target.value)}
            >
              <option value="">-- Choose session from active split --</option>
              {activeSplitRoutines.map((routine) => (
                <option key={routine.session} value={routine.session}>
                  {routine.session}
                </option>
              ))}
              <option value="custom">-- Custom Session (type below) --</option>
            </select>
          </div>

          <div className={styles["form-group"]}>
            <label htmlFor="ql-name">Session Name *</label>
            <input
              id="ql-name"
              type="text"
              required
              list="ql-session-suggestions"
              value={logForm.name}
              onChange={(e) => {
                setLogForm((prev) => ({ ...prev, name: e.target.value }));
                if (selectedPlanRoutine && selectedPlanRoutine !== e.target.value) {
                  setSelectedPlanRoutine("custom");
                }
              }}
              placeholder="e.g. Chest & Triceps Power or custom routine"
            />
            <datalist id="ql-session-suggestions">
              {activeSplitRoutines.map((routine) => (
                <option key={routine.session} value={routine.session} />
              ))}
            </datalist>
          </div>

          <div className={styles["form-group"]}>
            <label htmlFor="ql-date">Session Date</label>
            <input
              id="ql-date"
              type="date"
              max={new Date().toISOString().slice(0, 10)}
              value={logForm.completedAt || new Date().toISOString().slice(0, 10)}
              onChange={(e) => {
                const todayStr = new Date().toISOString().slice(0, 10);
                if (e.target.value > todayStr) {
                  setError("Cannot log workout for a future date. Only previous and current dates are allowed.");
                  setLogForm((prev) => ({ ...prev, completedAt: todayStr }));
                } else {
                  setError("");
                  setLogForm((prev) => ({ ...prev, completedAt: e.target.value }));
                }
              }}
            />
          </div>

          <div className={styles["form-row-2"]}>
            <div className={styles["form-group"]}>
              <label htmlFor="ql-category">Category</label>
              <select
                id="ql-category"
                value={logForm.category}
                onChange={(e) => updateFormField("category", e.target.value)}
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
                onChange={(e) => updateFormField("durationMinutes", e.target.value)}
                placeholder="e.g. 60"
              />
            </div>
          </div>

          <div className={styles["form-row-2"]}>
            <div className={styles["form-group"]}>
              <label htmlFor="ql-effort">Effort (RPE 1-10)</label>
              <input
                id="ql-effort"
                type="number"
                min="1"
                max="10"
                value={logForm.perceivedEffort}
                onChange={(e) => updateFormField("perceivedEffort", e.target.value)}
                placeholder="e.g. 8"
              />
            </div>

            <div className={styles["form-group"]}>
              <label htmlFor="ql-calories">Calories Burned (kcal)</label>
              <input
                id="ql-calories"
                type="number"
                min="0"
                value={logForm.caloriesBurned}
                onChange={(e) => setLogForm((prev) => ({ ...prev, caloriesBurned: e.target.value }))}
                placeholder={
                  logForm.durationMinutes
                    ? `Auto: ~${calculateEstimatedCalories({
                        durationMinutes: logForm.durationMinutes,
                        category: logForm.category,
                        perceivedEffort: logForm.perceivedEffort,
                      })} kcal`
                    : "Auto-adjusted if blank"
                }
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
                placeholder="e.g. 80"
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
                placeholder="e.g. 4"
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
                placeholder="e.g. 8"
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
