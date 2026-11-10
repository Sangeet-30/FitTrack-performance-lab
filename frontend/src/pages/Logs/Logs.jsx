import { useEffect, useState, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import styles from "./Logs.module.css";
import sharedStyles from "../../Shared.module.css";
import { cx } from "../../utils/classNames.js";
import NoticeModal from "../../components/NoticeModal/NoticeModal.jsx";
import {
  fetchUserWorkouts,
  updateWorkout,
  deleteWorkout,
} from "../../services/workoutService.js";
import { workouts as catalogWorkouts } from "../../data/workouts.js";

const CATEGORIES = [
  "All",
  "Strength",
  "Hypertrophy",
  "Cardio",
  "Conditioning",
  "Mobility",
  "Other",
];

const CATEGORY_COLORS = {
  Strength: "#dc2626",
  Hypertrophy: "#8b5cf6",
  Cardio: "#f59e0b",
  Conditioning: "#3b82f6",
  Mobility: "#10b981",
  Other: "#64748b",
};

const DEMO_LOGS = [
  {
    _id: "demo-log-1",
    name: "Heavy Upper Power & Push",
    category: "Strength",
    difficulty: "Advanced",
    durationMinutes: 65,
    totalVolume: 12450,
    perceivedEffort: 8,
    caloriesBurned: 480,
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    notes: "Bench felt explosive. Hit 110 kg for 3 sets of 5.",
  },
  {
    _id: "demo-log-2",
    name: "Lower Posterior Chain & Squats",
    category: "Hypertrophy",
    difficulty: "Intermediate",
    durationMinutes: 55,
    totalVolume: 15200,
    perceivedEffort: 9,
    caloriesBurned: 520,
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    notes: "Deep squat tempo was 3-1-0. Great quad activation.",
  },
  {
    _id: "demo-log-3",
    name: "Zone 2 Engine Conditioning",
    category: "Cardio",
    difficulty: "Intermediate",
    durationMinutes: 45,
    totalVolume: 0,
    perceivedEffort: 6,
    caloriesBurned: 420,
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 52).toISOString(),
    notes: "Maintained steady 138-142 bpm heart rate on rowing erg.",
  },
];

const calculateEstimatedCalories = (duration, category, effort) => {
  const d = Number(duration) || 45;
  const r = Number(effort) || 7;
  let baseRate = 7.5;
  if (category === "Cardio") baseRate = 10;
  else if (category === "Conditioning") baseRate = 9;
  else if (category === "Hypertrophy" || category === "Strength") baseRate = 7.5;
  else if (category === "Mobility") baseRate = 4;
  else baseRate = 6.5;
  return Math.round(d * baseRate * (0.7 + (r / 10) * 0.6));
};

function Logs() {
  const demoMode = useSelector((state) => state.auth?.demoMode);
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("date-desc");

  // Edit Modal State
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    category: "Strength",
    difficulty: "Intermediate",
    durationMinutes: 45,
    totalVolume: 0,
    perceivedEffort: 7,
    caloriesBurned: 0,
    completedAt: "",
    notes: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [selectedWorkoutDetails, setSelectedWorkoutDetails] = useState(null);
  const [deleteConfirmWorkout, setDeleteConfirmWorkout] = useState(null);

  // Notification Modal
  const [notice, setNotice] = useState({
    isOpen: false,
    title: "",
    message: "",
    eyebrow: "",
    type: "info",
  });

  // Load user workouts from API
  const loadWorkouts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchUserWorkouts({ limit: 100 });
      if (res?.items && Array.isArray(res.items)) {
        if (res.items.length === 0 && demoMode) {
          setWorkouts(DEMO_LOGS);
        } else {
          setWorkouts(res.items);
        }
      } else if (demoMode) {
        setWorkouts(DEMO_LOGS);
      }
    } catch {
      if (demoMode) {
        setWorkouts(DEMO_LOGS);
      }
    } finally {
      setLoading(false);
    }
  }, [demoMode]);

  useEffect(() => {
    loadWorkouts();
  }, [loadWorkouts]);

  // Listen for global workout-logged event so logs auto-refresh
  useEffect(() => {
    const handleSync = () => {
      loadWorkouts();
    };
    window.addEventListener("fittrack:workout-logged", handleSync);
    return () => window.removeEventListener("fittrack:workout-logged", handleSync);
  }, [loadWorkouts]);

  // Filtered & Sorted Workouts
  const filteredWorkouts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return workouts
      .filter((w) => {
        const matchesCategory =
          selectedCategory === "All" || w.category === selectedCategory;
        const matchesQuery =
          !q ||
          w.name?.toLowerCase().includes(q) ||
          w.notes?.toLowerCase().includes(q) ||
          w.category?.toLowerCase().includes(q);
        return matchesCategory && matchesQuery;
      })
      .sort((a, b) => {
        const dateA = new Date(a.completedAt || a.createdAt || 0).getTime();
        const dateB = new Date(b.completedAt || b.createdAt || 0).getTime();

        if (sortBy === "date-desc") return dateB - dateA;
        if (sortBy === "date-asc") return dateA - dateB;
        if (sortBy === "volume-desc") return (b.totalVolume || 0) - (a.totalVolume || 0);
        if (sortBy === "duration-desc")
          return (b.durationMinutes || 0) - (a.durationMinutes || 0);
        if (sortBy === "rpe-desc")
          return (b.perceivedEffort || 0) - (a.perceivedEffort || 0);
        return 0;
      });
  }, [workouts, searchQuery, selectedCategory, sortBy]);

  // Aggregate Stats
  const stats = useMemo(() => {
    const totalSessions = workouts.length;
    const totalVolumeKg = workouts.reduce(
      (sum, w) => sum + (Number(w.totalVolume) || 0),
      0
    );
    const totalMinutes = workouts.reduce(
      (sum, w) => sum + (Number(w.durationMinutes) || 0),
      0
    );
    const totalHours = (totalMinutes / 60).toFixed(1);
    const rpeSessions = workouts.filter((w) => w.perceivedEffort);
    const avgRpe =
      rpeSessions.length > 0
        ? (
            rpeSessions.reduce((sum, w) => sum + Number(w.perceivedEffort), 0) /
            rpeSessions.length
          ).toFixed(1)
        : "—";

    return {
      totalSessions,
      totalVolumeKg,
      totalHours,
      avgRpe,
    };
  }, [workouts]);

  // Open Edit Modal
  const handleOpenEdit = (workout) => {
    setEditingWorkout(workout);
    const d = workout.completedAt ? new Date(workout.completedAt) : new Date();
    const formattedDate = d.toISOString().split("T")[0];
    const duration = workout.durationMinutes ?? 45;
    const category = workout.category || "Strength";
    const effort = workout.perceivedEffort ?? 7;
    const cals =
      workout.caloriesBurned && workout.caloriesBurned > 0
        ? workout.caloriesBurned
        : calculateEstimatedCalories(duration, category, effort);

    setEditForm({
      name: workout.name || "",
      category,
      difficulty: workout.difficulty || "Intermediate",
      durationMinutes: duration,
      totalVolume: workout.totalVolume ?? 0,
      perceivedEffort: effort,
      caloriesBurned: cals,
      completedAt: formattedDate,
      notes: workout.notes || "",
    });
  };

  // Close Edit Modal
  const handleCloseEdit = () => {
    setEditingWorkout(null);
  };

  // Reactive field update: automatically adjusts calories live when duration, category, or effort changes
  const updateEditFormField = (field, value) => {
    setEditForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "durationMinutes" || field === "category" || field === "perceivedEffort") {
        const rawDuration = field === "durationMinutes" ? value : prev.durationMinutes;
        const d = Number(rawDuration);
        const c = field === "category" ? value : prev.category;
        const r = Number(field === "perceivedEffort" ? value : prev.perceivedEffort) || 7;
        if (d > 0) {
          next.caloriesBurned = calculateEstimatedCalories(d, c, r);
        } else if (rawDuration === "") {
          next.caloriesBurned = "";
        }
      }
      return next;
    });
  };

  // Submit Edit Form
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim()) return;

    const todayStr = new Date().toISOString().slice(0, 10);
    if (editForm.completedAt && editForm.completedAt > todayStr) {
      setNotice({
        isOpen: true,
        title: "Invalid Completion Date",
        message: "Workout completion date cannot be in the future. Please select today or a previous date.",
        eyebrow: "Validation",
        type: "info",
      });
      return;
    }

    setIsSaving(true);
    try {
      const parsedDuration = Number(editForm.durationMinutes) || 45;
      const parsedEffort = Number(editForm.perceivedEffort) || 7;
      let calculatedCalories = Number(editForm.caloriesBurned) || 0;
      if (!calculatedCalories) {
        calculatedCalories = calculateEstimatedCalories(parsedDuration, editForm.category, parsedEffort);
      }

      const payload = {
        name: editForm.name.trim(),
        category: editForm.category,
        difficulty: editForm.difficulty,
        durationMinutes: parsedDuration,
        totalVolume: Number(editForm.totalVolume) || 0,
        perceivedEffort: parsedEffort,
        caloriesBurned: calculatedCalories,
        completedAt: editForm.completedAt
          ? new Date(editForm.completedAt).toISOString()
          : new Date().toISOString(),
        notes: editForm.notes || "",
      };

      if (demoMode) {
        // Update in demo local state
        setWorkouts((prev) =>
          prev.map((w) =>
            w._id === editingWorkout._id ? { ...w, ...payload } : w
          )
        );
        handleCloseEdit();
        setNotice({
          isOpen: true,
          title: "Session Updated",
          message: `"${payload.name}" updated successfully in demo preview.`,
          eyebrow: "Session Log",
          type: "success",
        });
        return;
      }

      const res = await updateWorkout(editingWorkout._id, payload);
      const updatedItem = res?.item || { ...editingWorkout, ...payload };

      setWorkouts((prev) =>
        prev.map((w) => (w._id === editingWorkout._id ? updatedItem : w))
      );

      handleCloseEdit();

      setNotice({
        isOpen: true,
        title: "Session Updated",
        message: `"${payload.name}" has been updated in your training history.`,
        eyebrow: "Session Log",
        type: "success",
      });

      // Broadcast event so dashboard metrics reflect update
      window.dispatchEvent(
        new CustomEvent("fittrack:workout-logged", { detail: updatedItem })
      );
    } catch (err) {
      setNotice({
        isOpen: true,
        title: "Update Failed",
        message: err.message || "Could not update the workout session.",
        eyebrow: "Error",
        type: "info",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Workout Trigger
  const handleDeleteWorkout = (workout) => {
    setDeleteConfirmWorkout(workout);
  };

  const handleConfirmDeleteWorkout = async () => {
    if (!deleteConfirmWorkout) return;
    const workout = deleteConfirmWorkout;
    setDeleteConfirmWorkout(null);

    try {
      if (demoMode) {
        setWorkouts((prev) => prev.filter((w) => w._id !== workout._id));
        setNotice({
          isOpen: true,
          title: "Session Deleted",
          message: `"${workout.name}" was removed from the demo training log.`,
          eyebrow: "Session Log",
          type: "info",
        });
        return;
      }

      await deleteWorkout(workout._id);
      setWorkouts((prev) => prev.filter((w) => w._id !== workout._id));

      setNotice({
        isOpen: true,
        title: "Session Deleted",
        message: `"${workout.name}" has been removed from your training history.`,
        eyebrow: "Session Log",
        type: "info",
      });

      window.dispatchEvent(new CustomEvent("fittrack:workout-logged"));
    } catch (err) {
      setNotice({
        isOpen: true,
        title: "Delete Failed",
        message: err.message || "Failed to delete the session.",
        eyebrow: "Error",
        type: "info",
      });
    }
  };

  return (
    <div className={cx([styles["logs-page"], sharedStyles["logs-page"]])}>
      {/* Page Header */}
      <section className={cx([sharedStyles], "page-header-block card-panel")}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, width: "100%" }}>
          <div>
            <p className={cx([sharedStyles], "eyebrow accent")}>
              Session History &amp; Records
            </p>
            <h2>Workout Logs</h2>
            <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: "0.92rem" }}>
              Comprehensive log of all completed training sessions. Filter, review, or edit details anytime.
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button
              type="button"
              className={cx([sharedStyles], "secondary-button")}
              onClick={loadWorkouts}
              title="Refresh log entries"
            >
              ↻ Refresh
            </button>
            <button
              type="button"
              className={cx([sharedStyles], "primary-button")}
              onClick={() => window.dispatchEvent(new CustomEvent("fittrack:open-log"))}
            >
              + Log Session
            </button>
          </div>
        </div>
      </section>

      {/* Aggregate Stats Bar */}
      <section className={styles["stats-grid"]}>
        <div className={styles["stat-item"]}>
          <span className={styles["stat-label"]}>Total Sessions</span>
          <span className={styles["stat-val"]}>{stats.totalSessions}</span>
          <span className={styles["stat-sub"]}>Recorded workouts</span>
        </div>
        <div className={styles["stat-item"]}>
          <span className={styles["stat-label"]}>Total Volume</span>
          <span className={styles["stat-val"]}>
            {stats.totalVolumeKg ? stats.totalVolumeKg.toLocaleString() : 0} <small style={{ fontSize: "0.9rem" }}>kg</small>
          </span>
          <span className={styles["stat-sub"]}>Cumulative load lifted</span>
        </div>
        <div className={styles["stat-item"]}>
          <span className={styles["stat-label"]}>Time Trained</span>
          <span className={styles["stat-val"]}>
            {stats.totalHours} <small style={{ fontSize: "0.9rem" }}>hrs</small>
          </span>
          <span className={styles["stat-sub"]}>Total active duration</span>
        </div>
        <div className={styles["stat-item"]}>
          <span className={styles["stat-label"]}>Average RPE</span>
          <span className={styles["stat-val"]}>
            {stats.avgRpe} <small style={{ fontSize: "0.9rem" }}>/ 10</small>
          </span>
          <span className={styles["stat-sub"]}>Mean perceived effort</span>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className={cx([sharedStyles], "card-panel")}>
        <div className={styles["filter-toolbar"]}>
          <div className={styles["search-input-wrap"]}>
            <svg
              className={styles["search-icon"]}
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              className={styles["search-input"]}
              placeholder="Search by session name, category, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search logs"
            />
          </div>

          <div className={styles["filters-group"]}>
            <select
              className={styles["filter-select"]}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Category filter"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "All" ? "All Categories" : cat}
                </option>
              ))}
            </select>

            <select
              className={styles["filter-select"]}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort by"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="volume-desc">Highest Volume</option>
              <option value="duration-desc">Longest Duration</option>
              <option value="rpe-desc">Highest RPE</option>
            </select>
          </div>
        </div>

        {/* Workout Table or Empty State */}
        {loading ? (
          <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)" }}>
            Loading workout logs...
          </div>
        ) : filteredWorkouts.length > 0 ? (
          <div className={styles["table-wrapper"]}>
            <table className={styles["logs-table"]}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Session</th>
                  <th>Category</th>
                  <th>Difficulty</th>
                  <th>Duration</th>
                  <th>Volume</th>
                  <th>RPE</th>
                  <th>Calories</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWorkouts.map((w) => {
                  const dateStr = w.completedAt || w.createdAt;
                  const formattedDate = dateStr
                    ? new Date(dateStr).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—";

                  const dotColor =
                    CATEGORY_COLORS[w.category] || CATEGORY_COLORS.Other;

                  return (
                    <tr
                      key={w._id}
                      className={styles["clickable-row"]}
                      onClick={() => setSelectedWorkoutDetails(w)}
                      title="Click to view full workout movements and details"
                    >
                      <td style={{ whiteSpace: "nowrap", color: "var(--text-muted)", fontSize: "0.84rem" }}>
                        {formattedDate}
                      </td>
                      <td>
                        <div className={styles["session-name-cell"]}>
                          <span
                            className={styles["category-dot"]}
                            style={{ backgroundColor: dotColor }}
                          />
                          <div>
                            <div className={styles["session-title"]}>{w.name}</div>
                            {w.notes && (
                              <div
                                className={styles["session-notes-snippet"]}
                                title={w.notes}
                              >
                                {w.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className={styles["badge-tag"]}
                          style={{
                            backgroundColor: `${dotColor}18`,
                            color: dotColor,
                            border: `1px solid ${dotColor}35`,
                          }}
                        >
                          {w.category || "Strength"}
                        </span>
                      </td>
                      <td style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                        {w.difficulty || "Intermediate"}
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {w.durationMinutes ? `${w.durationMinutes} min` : "—"}
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {w.totalVolume ? `${w.totalVolume.toLocaleString()} kg` : "—"}
                      </td>
                      <td>
                        {w.perceivedEffort ? (
                          <span style={{ fontWeight: 700, color: w.perceivedEffort >= 8 ? "var(--accent-red)" : "inherit" }}>
                            {w.perceivedEffort} / 10
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td style={{ color: "var(--text-muted)" }}>
                        {w.caloriesBurned ? `${w.caloriesBurned} kcal` : "—"}
                      </td>
                      <td>
                        <div className={styles["actions-cell"]} onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            className={styles["action-btn-edit"]}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEdit(w);
                            }}
                            title="Edit this workout session"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            type="button"
                            className={styles["action-btn-del"]}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteWorkout(w);
                            }}
                            title="Delete this workout log"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles["empty-state"]}>
            <div className={styles["empty-icon"]}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <h4 className={styles["empty-title"]}>No workout sessions found</h4>
            <p className={styles["empty-desc"]}>
              {searchQuery || selectedCategory !== "All"
                ? "No logged workouts match the current search filter. Try resetting your filters."
                : "Record your first training session to unlock complete performance tracking and progressive overload logs."}
            </p>
            <button
              type="button"
              className={cx([sharedStyles], "primary-button")}
              style={{ marginTop: 8 }}
              onClick={() => window.dispatchEvent(new CustomEvent("fittrack:open-log"))}
            >
              + Log New Workout
            </button>
          </div>
        )}
      </section>

      {/* Edit Workout Modal */}
      {editingWorkout && (
        <div
          className={styles["edit-modal-backdrop"]}
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-modal-title"
        >
          <div
            className={styles["edit-modal-card"]}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles["modal-header"]}>
              <h3 id="edit-modal-title">Edit Workout Session</h3>
              <button
                type="button"
                className={styles["close-btn"]}
                onClick={handleCloseEdit}
                aria-label="Close edit modal"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className={styles["edit-form"]}>
              <div className={styles["form-group"]}>
                <label htmlFor="edit-name">Session Name *</label>
                <input
                  id="edit-name"
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  placeholder="e.g. Upper Body Hypertrophy"
                />
              </div>

              <div className={styles["form-row"]}>
                <div className={styles["form-group"]}>
                  <label htmlFor="edit-category">Category</label>
                  <select
                    id="edit-category"
                    value={editForm.category}
                    onChange={(e) =>
                      updateEditFormField("category", e.target.value)
                    }
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
                  <label htmlFor="edit-difficulty">Difficulty</label>
                  <select
                    id="edit-difficulty"
                    value={editForm.difficulty}
                    onChange={(e) =>
                      setEditForm({ ...editForm, difficulty: e.target.value })
                    }
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className={styles["form-row"]}>
                <div className={styles["form-group"]}>
                  <label htmlFor="edit-duration">Duration (minutes)</label>
                  <input
                    id="edit-duration"
                    type="number"
                    min="1"
                    max="600"
                    value={editForm.durationMinutes}
                    onChange={(e) =>
                      updateEditFormField("durationMinutes", e.target.value)
                    }
                  />
                </div>

                <div className={styles["form-group"]}>
                  <label htmlFor="edit-volume">Total Volume (kg)</label>
                  <input
                    id="edit-volume"
                    type="number"
                    min="0"
                    step="1"
                    value={editForm.totalVolume}
                    onChange={(e) =>
                      setEditForm({ ...editForm, totalVolume: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className={styles["form-row"]}>
                <div className={styles["form-group"]}>
                  <label htmlFor="edit-date">Completion Date</label>
                  <input
                    id="edit-date"
                    type="date"
                    value={editForm.completedAt}
                    max={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => {
                      const todayStr = new Date().toISOString().slice(0, 10);
                      if (e.target.value > todayStr) {
                        setEditForm({ ...editForm, completedAt: todayStr });
                      } else {
                        setEditForm({ ...editForm, completedAt: e.target.value });
                      }
                    }}
                  />
                </div>

                <div className={styles["form-group"]}>
                  <label htmlFor="edit-calories">Calories Burned (kcal)</label>
                  <input
                    id="edit-calories"
                    type="number"
                    min="0"
                    value={editForm.caloriesBurned}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        caloriesBurned: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className={styles["form-group"]}>
                <label htmlFor="edit-rpe">
                  Perceived Effort (RPE 1-10)
                </label>
                <div className={styles["rpe-slider-wrap"]}>
                  <input
                    id="edit-rpe"
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={editForm.perceivedEffort}
                    onChange={(e) =>
                      updateEditFormField("perceivedEffort", Number(e.target.value))
                    }
                  />
                  <span className={styles["rpe-value-badge"]}>
                    {editForm.perceivedEffort} / 10
                  </span>
                </div>
              </div>

              <div className={styles["form-group"]}>
                <label htmlFor="edit-notes">Training Notes</label>
                <textarea
                  id="edit-notes"
                  rows={3}
                  value={editForm.notes}
                  onChange={(e) =>
                    setEditForm({ ...editForm, notes: e.target.value })
                  }
                  placeholder="Record PRs, form feedback, rep ranges, tempo..."
                />
              </div>

              <div className={styles["modal-actions"]}>
                <button
                  type="button"
                  className={cx([sharedStyles], "secondary-button")}
                  onClick={handleCloseEdit}
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={cx([sharedStyles], "primary-button")}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Workout Session Details Modal */}
      {selectedWorkoutDetails && (
        <div
          className={styles["edit-modal-backdrop"]}
          role="dialog"
          aria-modal="true"
          aria-labelledby="details-modal-title"
        >
          <div
            className={styles["details-modal-card"]}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles["modal-header"]}>
              <div>
                <span
                  className={styles["badge-tag"]}
                  style={{
                    backgroundColor: `${CATEGORY_COLORS[selectedWorkoutDetails.category] || "#ef4444"}18`,
                    color: CATEGORY_COLORS[selectedWorkoutDetails.category] || "var(--accent-red)",
                    border: `1px solid ${CATEGORY_COLORS[selectedWorkoutDetails.category] || "#ef4444"}35`,
                    marginBottom: 6,
                    display: "inline-block",
                  }}
                >
                  {selectedWorkoutDetails.category || "Strength"}
                </span>
                <h3 id="details-modal-title" style={{ margin: "4px 0 0" }}>
                  {selectedWorkoutDetails.name}
                </h3>
                <small style={{ color: "var(--text-muted)" }}>
                  Completed {new Date(selectedWorkoutDetails.completedAt || selectedWorkoutDetails.createdAt).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </small>
              </div>
              <button
                type="button"
                className={styles["close-btn"]}
                onClick={() => setSelectedWorkoutDetails(null)}
                aria-label="Close details"
              >
                &times;
              </button>
            </div>

            <div className={styles["details-stats-grid"]}>
              <div className={styles["details-stat-box"]}>
                <span className={styles["details-stat-label"]}>Duration</span>
                <span className={styles["details-stat-val"]}>
                  {selectedWorkoutDetails.durationMinutes ? `${selectedWorkoutDetails.durationMinutes} min` : "—"}
                </span>
              </div>
              <div className={styles["details-stat-box"]}>
                <span className={styles["details-stat-label"]}>Volume</span>
                <span className={styles["details-stat-val"]}>
                  {selectedWorkoutDetails.totalVolume ? `${selectedWorkoutDetails.totalVolume.toLocaleString()} kg` : "—"}
                </span>
              </div>
              <div className={styles["details-stat-box"]}>
                <span className={styles["details-stat-label"]}>Calories</span>
                <span className={styles["details-stat-val"]}>
                  {selectedWorkoutDetails.caloriesBurned ? `${selectedWorkoutDetails.caloriesBurned} kcal` : "—"}
                </span>
              </div>
              <div className={styles["details-stat-box"]}>
                <span className={styles["details-stat-label"]}>Effort (RPE)</span>
                <span className={styles["details-stat-val"]}>
                  {selectedWorkoutDetails.perceivedEffort ? `${selectedWorkoutDetails.perceivedEffort} / 10` : "—"}
                </span>
              </div>
            </div>

            <div>
              <h4 style={{ margin: "16px 0 8px", fontSize: "0.95rem", fontWeight: 700, color: "var(--text-main)" }}>
                Workout Exercises &amp; Movements
              </h4>
              {(() => {
                const exercises = selectedWorkoutDetails.exercises || [];
                if (exercises.length > 0) {
                  return (
                    <div className={styles["exercises-breakdown-list"]}>
                      {exercises.map((ex, i) => (
                        <div key={i} className={styles["exercise-breakdown-item"]}>
                          <div>
                            <span className={styles["exercise-name-strong"]}>{ex.name}</span>
                            {ex.notes && <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{ex.notes}</div>}
                          </div>
                          <span className={styles["exercise-specs-badge"]}>
                            {ex.totalSets || ex.sets || 1} sets &times; {ex.reps || 1} reps {ex.weight ? `@ ${ex.weight} kg` : ""}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                }

                // Check if name matches catalog routine
                const matchedCatalog = catalogWorkouts.find(
                  (cw) => cw.title.toLowerCase() === (selectedWorkoutDetails.name || "").toLowerCase()
                );

                if (matchedCatalog && matchedCatalog.exercises) {
                  return (
                    <div>
                      <p style={{ margin: "0 0 8px", fontSize: "0.82rem", color: "var(--text-muted)" }}>
                        Standard catalog routine protocol ({matchedCatalog.focus || matchedCatalog.category}):
                      </p>
                      <div className={styles["exercises-breakdown-list"]}>
                        {matchedCatalog.exercises.map((ex, i) => (
                          <div key={i} className={styles["exercise-breakdown-item"]}>
                            <div>
                              <span className={styles["exercise-name-strong"]}>{ex.name}</span>
                              {ex.notes && <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{ex.notes}</div>}
                            </div>
                            <span className={styles["exercise-specs-badge"]}>
                              {ex.sets} sets &times; {ex.reps} reps
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                return (
                  <div style={{ padding: "14px", background: "var(--bg-card-subtle)", borderRadius: 10, color: "var(--text-muted)", fontSize: "0.86rem" }}>
                    No individual movement breakdown was logged for this session. Use the Active Workout timer or detailed log form to capture exercise sets and reps.
                  </div>
                );
              })()}
            </div>

            {selectedWorkoutDetails.notes && (
              <div style={{ marginTop: 16 }}>
                <h4 style={{ margin: "0 0 6px", fontSize: "0.82rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                  Session Notes
                </h4>
                <p style={{ margin: 0, padding: 12, background: "var(--bg-card-subtle)", borderRadius: 8, fontSize: "0.88rem", color: "var(--text-main)", fontStyle: "italic" }}>
                  "{selectedWorkoutDetails.notes}"
                </p>
              </div>
            )}

            <div className={styles["modal-actions"]}>
              <button
                type="button"
                className={cx([sharedStyles], "secondary-button")}
                onClick={() => setSelectedWorkoutDetails(null)}
              >
                Close
              </button>
              <button
                type="button"
                className={cx([sharedStyles], "primary-button")}
                onClick={() => {
                  const w = selectedWorkoutDetails;
                  setSelectedWorkoutDetails(null);
                  handleOpenEdit(w);
                }}
              >
                Edit Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <NoticeModal
        isOpen={Boolean(deleteConfirmWorkout)}
        type="danger"
        title="Delete Workout Session"
        message={`Delete "${deleteConfirmWorkout?.name}" from your training logs? This action cannot be undone.`}
        confirmText="Delete Session"
        cancelText="Cancel"
        onConfirm={handleConfirmDeleteWorkout}
        onClose={() => setDeleteConfirmWorkout(null)}
      />

      {/* Notice Dialog */}
      <NoticeModal
        isOpen={notice.isOpen}
        title={notice.title}
        message={notice.message}
        eyebrow={notice.eyebrow}
        type={notice.type}
        onClose={() => setNotice({ ...notice, isOpen: false })}
      />
    </div>
  );
}

export default Logs;

