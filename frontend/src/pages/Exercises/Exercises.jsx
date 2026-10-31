import styles from "./Exercises.module.css";
import sharedStyles from "../../Shared.module.css";
import { cx } from "../../utils/classNames.js";
import { useMemo, useState } from "react";

const exerciseLibrary = [
  {
    id: "bench-press",
    name: "Bench Press",
    category: "Strength",
    target: "Chest",
    difficulty: "Intermediate",
    equipment: "Barbell",
    description:
      "A foundational compound lift for upper-body pushing strength.",
  },
  {
    id: "deadlift",
    name: "Deadlift",
    category: "Strength",
    target: "Back",
    difficulty: "Advanced",
    equipment: "Barbell",
    description: "Posterior chain power movement for total-body strength.",
  },
  {
    id: "pull-up",
    name: "Pull-Up",
    category: "Bodyweight",
    target: "Back",
    difficulty: "Intermediate",
    equipment: "Pull-Up Bar",
    description: "Bodyweight vertical pull to build back and arm strength.",
  },
  {
    id: "jump-squat",
    name: "Jump Squat",
    category: "Cardio",
    target: "Legs",
    difficulty: "Beginner",
    equipment: "Bodyweight",
    description:
      "A plyometric squat variation to improve power and conditioning.",
  },
  {
    id: "plank",
    name: "Plank Hold",
    category: "Core",
    target: "Core",
    difficulty: "Beginner",
    equipment: "Mat",
    description: "Static trunk stabilization focused on the deep core muscles.",
  },
  {
    id: "overhead-press",
    name: "Overhead Press",
    category: "Strength",
    target: "Shoulders",
    difficulty: "Intermediate",
    equipment: "Dumbbells",
    description: "Vertical pressing for shoulder strength and trunk stability.",
  },
];

const difficultyOptions = ["All", "Beginner", "Intermediate", "Advanced"];
const categoryOptions = ["All", "Strength", "Bodyweight", "Cardio", "Core"];

function Exercises() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("All");

  const filteredExercises = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return exerciseLibrary.filter((exercise) => {
      const matchesQuery =
        !normalizedQuery ||
        exercise.name.toLowerCase().includes(normalizedQuery) ||
        exercise.target.toLowerCase().includes(normalizedQuery) ||
        exercise.equipment.toLowerCase().includes(normalizedQuery);

      const matchesCategory =
        category === "All" || exercise.category === category;
      const matchesDifficulty =
        difficulty === "All" || exercise.difficulty === difficulty;

      return matchesQuery && matchesCategory && matchesDifficulty;
    });
  }, [query, category, difficulty]);

  return (
    <div className={cx([styles, sharedStyles], "exercise-page")}>
      <section className={cx([styles, sharedStyles], "page-header-block card-panel")}>
        <div>
          <p className={cx([styles, sharedStyles], "eyebrow accent")}>Exercise library</p>
          <h2>Build workout variety</h2>
        </div>
      </section>

      <section className={cx([styles, sharedStyles], "card-panel filter-panel")}>
        <div className={cx([styles, sharedStyles], "filter-row")}>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search exercises, targets or equipment"
            aria-label="Search exercises"
          />

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label="Exercise category"
          >
            {categoryOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <select
            value={difficulty}
            onChange={(event) => setDifficulty(event.target.value)}
            aria-label="Exercise difficulty"
          >
            {difficultyOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className={cx([styles, sharedStyles], "exercise-grid")}>
        {filteredExercises.length > 0 ? (
          filteredExercises.map((exercise) => (
            <article key={exercise.id} className={cx([styles, sharedStyles], "card-panel exercise-card")}>
              <div className={cx([styles, sharedStyles], "exercise-card-top")}>
                <span className={cx([styles, sharedStyles], "badge")}>{exercise.category}</span>
                <span className={cx([styles, sharedStyles], "difficulty-pill")}>{exercise.difficulty}</span>
              </div>

              <h3>{exercise.name}</h3>
              <p>{exercise.description}</p>

              <div className={cx([styles, sharedStyles], "exercise-meta")}>
                <span>{exercise.target}</span>
                <span>{exercise.equipment}</span>
              </div>
            </article>
          ))
        ) : (
          <div className={cx([styles, sharedStyles], "card-panel empty-state")}>
            <h3>No exercises match your filters.</h3>
            <p>Adjust your search to explore more training options.</p>
          </div>
        )}
      </section>
    </div>
  );
}

export default Exercises;
