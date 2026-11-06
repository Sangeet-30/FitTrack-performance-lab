import styles from "./Workouts.module.css";
import sharedStyles from "../../Shared.module.css";
import { cx } from "../../utils/classNames.js";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { searchWorkouts } from "../../services/workoutService.js";
import { workoutCategories } from "../../data/workouts.js";

const difficulties = ["All", "Beginner", "Intermediate", "Advanced"];

function Workouts() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("All");

  const filteredWorkouts = useMemo(
    () => searchWorkouts({ query, category, difficulty }),
    [query, category, difficulty],
  );

  return (
    <div className={cx([styles, sharedStyles], "workout-page")}>
      {/* Header Banner */}
      <section className={styles["workouts-hero"]}>
        <div className={styles["hero-text"]}>
          <div className={styles["hero-eyebrow-row"]}>
            <span className={styles["hero-tag"]}>ATHLETIC PERFORMANCE LAB</span>
            <span className={styles["hero-count"]}>
              {filteredWorkouts.length} Curated Programs
            </span>
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
                  <div className={styles["category-flag"]}>{workout.category}</div>
                  <div className={styles["difficulty-tag"]}>
                    <span
                      className={`${styles["diff-dot"]} ${
                        workout.difficulty.toLowerCase() === "beginner"
                          ? styles["beginner"]
                          : workout.difficulty.toLowerCase() === "advanced"
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
                      <span>{workout.exercisesList.length} movements</span>
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
                    {workout.muscleGroups.map((group, idx) => (
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
                    <Link
                      to={`/workouts/${workout.id}/active`}
                      className={styles["start-btn"]}
                    >
                      ▶ Start
                    </Link>
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
    </div>
  );
}

export default Workouts;
