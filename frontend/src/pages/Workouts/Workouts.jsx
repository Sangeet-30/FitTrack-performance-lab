import styles from "./Workouts.module.css";
import sharedStyles from "../../Shared.module.css";
import { cx } from "../../utils/classNames.js";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  searchWorkouts,
  saveUserCustomWorkout,
  deleteUserCustomWorkout,
} from "../../services/workoutService.js";
import { workoutCategories } from "../../data/workouts.js";
import NoticeModal from "../../components/NoticeModal/NoticeModal.jsx";

const difficulties = ["All", "Beginner", "Intermediate", "Advanced"];

const initialCustomForm = {
  name: "",
  category: "Strength",
  difficulty: "Intermediate",
  duration: 45,
  equipment: "Dumbbells, Bench",
  muscleGroups: "Chest, Shoulders",
  description: "Targeted resistance training protocol.",
  exercisesList: [
    { name: "Main Exercise 1", sets: 4, reps: 8 },
    { name: "Secondary Exercise 2", sets: 3, reps: 10 },
  ],
};

function Workouts() {
  const user = useSelector((state) => state.auth?.user || state.user?.profile);
  const userId = user?._id || user?.id || "athlete";
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [refreshKey, setRefreshKey] = useState(0);

  // Custom Workout Modal
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [customForm, setCustomForm] = useState(initialCustomForm);
  const [deletingCustomWorkout, setDeletingCustomWorkout] = useState(null);

  const filteredWorkouts = useMemo(
    () => searchWorkouts({ query, category, difficulty, userId }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query, category, difficulty, userId, refreshKey],
  );

  const handleCreateCustom = (e) => {
    e.preventDefault();
    if (!customForm.name.trim()) return;

    const newWorkout = {
      id: `custom-${Date.now()}`,
      name: customForm.name.trim(),
      category: customForm.category,
      difficulty: customForm.difficulty,
      duration: Number(customForm.duration) || 45,
      equipment: customForm.equipment.trim() || "Gym Equipment",
      muscleGroups: customForm.muscleGroups
        .split(",")
        .map((m) => m.trim())
        .filter(Boolean),
      description: customForm.description.trim() || "Custom athlete routine.",
      exercisesList: customForm.exercisesList.filter((ex) => ex.name.trim()),
      isCustom: true,
      createdAt: new Date().toISOString(),
    };

    saveUserCustomWorkout(userId, newWorkout);
    setIsCreatingCustom(false);
    setCustomForm(initialCustomForm);
    setRefreshKey((k) => k + 1);
  };

  const handleDeleteCustom = (workout) => {
    setDeletingCustomWorkout(workout);
  };

  const handleConfirmDeleteCustom = () => {
    if (!deletingCustomWorkout) return;
    deleteUserCustomWorkout(userId, deletingCustomWorkout.id);
    setDeletingCustomWorkout(null);
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className={cx([styles, sharedStyles], "workout-page")}>
      {/* Header Banner */}
      <section className={styles["workouts-hero"]}>
        <div className={styles["hero-text"]}>
          <div className={styles["hero-eyebrow-row"]}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className={styles["hero-tag"]}>ATHLETIC PERFORMANCE LAB</span>
              <span className={styles["hero-count"]}>
                {filteredWorkouts.length} Programs
              </span>
            </div>
            <button
              type="button"
              className={styles["create-custom-btn"]}
              onClick={() => setIsCreatingCustom(true)}
            >
              + Create Custom Workout
            </button>
          </div>
          <h1 className={styles["hero-title"]}>Workouts</h1>
          <p className={styles["hero-subtitle"]}>
            Targeted resistance routines engineered for strength, hypertrophy, and progressive overload.
          </p>
        </div>

        {/* Quick Category Navigation Pills */}
        <div className={styles["category-pills-scroll"]}>
          {workoutCategories.map((cat) => {
            const isActive = category === cat;
            return (
              <button
                key={cat}
                type="button"
                className={`${styles["category-pill"]} ${isActive ? styles["active"] : ""}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </section>

      {/* Filter & Search Bar */}
      <section className={styles["filter-card"]}>
        <div className={styles["filter-grid"]}>
          <div className={styles["search-input-wrap"]}>
            <svg
              className={styles["search-icon"]}
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by routine name, muscle group, or equipment..."
              className={styles["search-field"]}
              aria-label="Search workouts"
            />
            {query && (
              <button
                type="button"
                className={styles["clear-search-btn"]}
                onClick={() => setQuery("")}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <div className={styles["select-filters-row"]}>
            <div className={styles["select-wrap"]}>
              <label htmlFor="workout-category-select" className={styles["select-label"]}>
                Category
              </label>
              <select
                id="workout-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={styles["select-field"]}
                aria-label="Workout category"
              >
                {workoutCategories.map((option) => (
                  <option key={option} value={option}>
                    {option === "All" ? "All Categories" : option}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles["select-wrap"]}>
              <label htmlFor="workout-difficulty-select" className={styles["select-label"]}>
                Difficulty
              </label>
              <select
                id="workout-difficulty-select"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className={styles["select-field"]}
                aria-label="Difficulty filter"
              >
                {difficulties.map((option) => (
                  <option key={option} value={option}>
                    {option === "All" ? "All Levels" : option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Workout Grid */}
      <section className={styles["workout-grid"]}>
        {filteredWorkouts.length > 0 ? (
          filteredWorkouts.map((workout) => {
            const totalSets = workout.exercisesList?.reduce(
              (acc, item) => acc + (Number(item.sets) || 0),
              0,
            );

            return (
              <article key={workout.id} className={styles["workout-card"]}>
                {/* Header Strip */}
                <div className={styles["card-header-strip"]}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div className={styles["category-flag"]}>{workout.category}</div>
                    {workout.isCustom && (
                      <span className={styles["custom-badge"]}>Custom</span>
                    )}
                  </div>
                  <div className={styles["difficulty-tag"]}>
                    <span
                      className={`${styles["diff-dot"]} ${
                        workout.difficulty?.toLowerCase() === "beginner"
                          ? styles["beginner"]
                          : workout.difficulty?.toLowerCase() === "advanced"
                          ? styles["advanced"]
                          : styles["intermediate"]
                      }`}
                    />
                    {workout.difficulty}
                  </div>
                </div>

                {/* Card Body */}
                <div className={styles["workout-body"]}>
                  <h3 className={styles["workout-name"]}>{workout.name}</h3>
                  <p className={styles["workout-desc"]}>{workout.description}</p>

                  {/* Spec Row */}
                  <div className={styles["specs-row"]}>
                    <div className={styles["spec-pill"]}>
                      <span className={styles["spec-icon"]}>⏱️</span>
                      <span>{workout.duration} min</span>
                    </div>
                    <div className={styles["spec-pill"]}>
                      <span className={styles["spec-icon"]}>📋</span>
                      <span>{workout.exercisesList?.length || 0} movements</span>
                    </div>
                    {totalSets > 0 && (
                      <div className={styles["spec-pill"]}>
                        <span className={styles["spec-icon"]}>⚡</span>
                        <span>{totalSets} sets</span>
                      </div>
                    )}
                  </div>

                  {/* Muscle Tags */}
                  <div className={styles["muscle-tags-wrap"]}>
                    {(workout.muscleGroups || []).map((group, idx) => (
                      <span
                        key={group}
                        className={`${styles["muscle-chip"]} ${idx === 0 ? styles["primary-muscle"] : ""}`}
                      >
                        {group}
                      </span>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className={styles["actions-row"]}>
                    <Link
                      to={`/workouts/${workout.id}`}
                      className={styles["view-btn"]}
                    >
                      View Routine →
                    </Link>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      {workout.isCustom && (
                        <button
                          type="button"
                          onClick={() => handleDeleteCustom(workout)}
                          style={{
                            background: "rgba(239, 68, 68, 0.1)",
                            border: "1px solid rgba(239, 68, 68, 0.25)",
                            color: "#ef4444",
                            padding: "8px 10px",
                            borderRadius: "8px",
                            cursor: "pointer",
                            lineHeight: 1,
                          }}
                          title="Delete custom workout"
                        >
                          ✕
                        </button>
                      )}
                      <Link
                        to={`/workouts/${workout.id}/active`}
                        className={styles["start-btn"]}
                      >
                        ▶ Start
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className={styles["empty-state-card"]}>
            <div className={styles["empty-icon"]}>🔍</div>
            <h3 className={styles["empty-title"]}>No workouts match your filters</h3>
            <p className={styles["empty-text"]}>
              Try clearing your search terms or selecting &ldquo;All Categories&rdquo; to explore all curated routines.
            </p>
            <button
              type="button"
              className={styles["reset-btn"]}
              onClick={() => {
                setQuery("");
                setCategory("All");
                setDifficulty("All");
              }}
            >
              Reset All Filters
            </button>
          </div>
        )}
      </section>

      {/* Create Custom Workout Modal */}
      {isCreatingCustom && (
        <div
          className={styles["custom-modal-backdrop"]}
          onClick={() => setIsCreatingCustom(false)}
        >
          <div
            className={styles["custom-modal-card"]}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: "0.74rem", fontWeight: 700, color: "var(--accent-red)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Athlete Routine Builder</span>
                <h3 style={{ margin: "4px 0 0", fontSize: "1.25rem", color: "var(--text-main)" }}>Create Custom Workout</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreatingCustom(false)}
                style={{ background: "transparent", border: "none", color: "var(--text-muted)", fontSize: "1.4rem", cursor: "pointer" }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateCustom} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-muted)" }}>Workout Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chest & Triceps Hypertrophy"
                  value={customForm.name}
                  onChange={(e) => setCustomForm({ ...customForm, name: e.target.value })}
                  style={{ background: "var(--bg-card-subtle)", border: "1px solid var(--border-color)", borderRadius: 8, padding: "10px 12px", color: "var(--text-main)", fontSize: "0.92rem" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-muted)" }}>Category</label>
                  <select
                    value={customForm.category}
                    onChange={(e) => setCustomForm({ ...customForm, category: e.target.value })}
                    style={{ background: "var(--bg-card-subtle)", border: "1px solid var(--border-color)", borderRadius: 8, padding: "10px 12px", color: "var(--text-main)", fontSize: "0.92rem" }}
                  >
                    <option value="Strength">Strength</option>
                    <option value="Hypertrophy">Hypertrophy</option>
                    <option value="Cardio">Cardio</option>
                    <option value="Mobility">Mobility</option>
                    <option value="Power">Power</option>
                    <option value="Conditioning">Conditioning</option>
                  </select>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-muted)" }}>Difficulty</label>
                  <select
                    value={customForm.difficulty}
                    onChange={(e) => setCustomForm({ ...customForm, difficulty: e.target.value })}
                    style={{ background: "var(--bg-card-subtle)", border: "1px solid var(--border-color)", borderRadius: 8, padding: "10px 12px", color: "var(--text-main)", fontSize: "0.92rem" }}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-muted)" }}>Est. Duration (min)</label>
                  <input
                    type="number"
                    min="10"
                    max="240"
                    value={customForm.duration}
                    onChange={(e) => setCustomForm({ ...customForm, duration: e.target.value })}
                    style={{ background: "var(--bg-card-subtle)", border: "1px solid var(--border-color)", borderRadius: 8, padding: "10px 12px", color: "var(--text-main)", fontSize: "0.92rem" }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-muted)" }}>Equipment</label>
                  <input
                    type="text"
                    placeholder="e.g. Barbell, Bench"
                    value={customForm.equipment}
                    onChange={(e) => setCustomForm({ ...customForm, equipment: e.target.value })}
                    style={{ background: "var(--bg-card-subtle)", border: "1px solid var(--border-color)", borderRadius: 8, padding: "10px 12px", color: "var(--text-main)", fontSize: "0.92rem" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-muted)" }}>Target Muscle Groups (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Chest, Triceps, Anterior Deltoids"
                  value={customForm.muscleGroups}
                  onChange={(e) => setCustomForm({ ...customForm, muscleGroups: e.target.value })}
                  style={{ background: "var(--bg-card-subtle)", border: "1px solid var(--border-color)", borderRadius: 8, padding: "10px 12px", color: "var(--text-main)", fontSize: "0.92rem" }}
                />
              </div>

              {/* Exercises List Builder */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-main)" }}>Exercises / Movements</label>
                  <button
                    type="button"
                    onClick={() =>
                      setCustomForm({
                        ...customForm,
                        exercisesList: [
                          ...customForm.exercisesList,
                          { name: "", sets: 3, reps: 10 },
                        ],
                      })
                    }
                    style={{ background: "transparent", border: "none", color: "var(--accent-red)", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}
                  >
                    + Add Movement
                  </button>
                </div>

                {customForm.exercisesList.map((ex, idx) => (
                  <div key={idx} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                      type="text"
                      placeholder={`Exercise ${idx + 1}`}
                      value={ex.name}
                      onChange={(e) => {
                        const updated = [...customForm.exercisesList];
                        updated[idx].name = e.target.value;
                        setCustomForm({ ...customForm, exercisesList: updated });
                      }}
                      style={{ flex: 3, background: "var(--bg-card-subtle)", border: "1px solid var(--border-color)", borderRadius: 8, padding: "8px 10px", color: "var(--text-main)", fontSize: "0.86rem" }}
                    />
                    <input
                      type="number"
                      min="1"
                      placeholder="Sets"
                      value={ex.sets}
                      onChange={(e) => {
                        const updated = [...customForm.exercisesList];
                        updated[idx].sets = Number(e.target.value) || 1;
                        setCustomForm({ ...customForm, exercisesList: updated });
                      }}
                      style={{ flex: 1, background: "var(--bg-card-subtle)", border: "1px solid var(--border-color)", borderRadius: 8, padding: "8px 10px", color: "var(--text-main)", fontSize: "0.86rem" }}
                    />
                    <input
                      type="number"
                      min="1"
                      placeholder="Reps"
                      value={ex.reps}
                      onChange={(e) => {
                        const updated = [...customForm.exercisesList];
                        updated[idx].reps = Number(e.target.value) || 1;
                        setCustomForm({ ...customForm, exercisesList: updated });
                      }}
                      style={{ flex: 1, background: "var(--bg-card-subtle)", border: "1px solid var(--border-color)", borderRadius: 8, padding: "8px 10px", color: "var(--text-main)", fontSize: "0.86rem" }}
                    />
                    {customForm.exercisesList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const updated = customForm.exercisesList.filter((_, i) => i !== idx);
                          setCustomForm({ ...customForm, exercisesList: updated });
                        }}
                        style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "1rem" }}
                      >
                        &times;
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setIsCreatingCustom(false)}
                  style={{ background: "var(--bg-card-subtle)", border: "1px solid var(--border-color)", color: "var(--text-main)", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ background: "var(--accent-red)", border: "none", color: "#ffffff", padding: "8px 20px", borderRadius: 8, cursor: "pointer", fontWeight: 700 }}
                >
                  Save Workout Routine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Custom Workout Confirmation */}
      <NoticeModal
        isOpen={Boolean(deletingCustomWorkout)}
        type="danger"
        title="Delete Custom Workout"
        message={
          deletingCustomWorkout
            ? `Delete custom workout "${deletingCustomWorkout.name}"? This routine will be removed from your catalog.`
            : "Delete this custom workout routine?"
        }
        confirmText="Delete Routine"
        cancelText="Cancel"
        onConfirm={handleConfirmDeleteCustom}
        onClose={() => setDeletingCustomWorkout(null)}
      />
    </div>
  );
}

export default Workouts;
