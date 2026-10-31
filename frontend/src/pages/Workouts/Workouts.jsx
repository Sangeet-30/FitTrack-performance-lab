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
      <section
        className={cx([styles, sharedStyles], "page-header-block card-panel")}
      >
        <div>
          <p className={cx([styles, sharedStyles], "eyebrow accent")}>
            Workout library
          </p>
          <h2>Find your next session</h2>
        </div>
      </section>

      <section
        className={cx([styles, sharedStyles], "card-panel filter-panel")}
      >
        <div className={cx([styles, sharedStyles], "filter-row")}>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search workouts or muscle groups"
            aria-label="Search workouts"
          />

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label="Workout category"
          >
            {workoutCategories.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <select
            value={difficulty}
            onChange={(event) => setDifficulty(event.target.value)}
            aria-label="Difficulty filter"
          >
            {difficulties.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className={cx([styles, sharedStyles], "workout-grid")}>
        {filteredWorkouts.length > 0 ? (
          filteredWorkouts.map((workout) => (
            <article
              key={workout.id}
              className={cx([styles, sharedStyles], "workout-card card-panel")}
            >
              <div
                className={cx([styles, sharedStyles], "workout-image")}
                aria-hidden="true"
              >
                {workout.category}
              </div>

              <div className={cx([styles, sharedStyles], "workout-content")}>
                <div className={cx([styles, sharedStyles], "workout-topline")}>
                  <span className={cx([styles, sharedStyles], "badge")}>
                    {workout.category}
                  </span>
                  <span
                    className={cx([styles, sharedStyles], "difficulty-pill")}
                  >
                    {workout.difficulty}
                  </span>
                </div>

                <h3>{workout.name}</h3>
                <p>{workout.description}</p>

                <div className={cx([styles, sharedStyles], "workout-meta")}>
                  <span>{workout.duration} min</span>
                  <span>{workout.exercisesList.length} exercises</span>
                </div>

                <div className={cx([styles, sharedStyles], "muscle-tags")}>
                  {workout.muscleGroups.map((group) => (
                    <span key={group}>{group}</span>
                  ))}
                </div>

                <div className={cx([styles, sharedStyles], "workout-actions")}>
                  <Link
                    className={cx(
                      [styles, sharedStyles],
                      "secondary-button workout-button",
                    )}
                    to={`/workouts/${workout.id}`}
                  >
                    View
                  </Link>
                  <Link
                    className={cx(
                      [styles, sharedStyles],
                      "primary-button workout-button",
                    )}
                    to={`/workouts/${workout.id}/active`}
                  >
                    Start
                  </Link>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className={cx([styles, sharedStyles], "card-panel empty-state")}>
            <h3>No workouts match your filters.</h3>
            <p>Try adjusting the search or selecting a different category.</p>
          </div>
        )}
      </section>
    </div>
  );
}

export default Workouts;
