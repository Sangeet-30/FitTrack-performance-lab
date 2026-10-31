import styles from "./WorkoutDetail.module.css";
import sharedStyles from "../../Shared.module.css";
import { cx } from "../../utils/classNames.js";
import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { getWorkoutById } from "../../services/workoutService.js";

function WorkoutDetail() {
  const { workoutId } = useParams();
  const workout = useMemo(() => getWorkoutById(workoutId), [workoutId]);

  if (!workout) {
    return (
      <div className={cx([styles, sharedStyles], "page-block")}>
        <p className={cx([styles, sharedStyles], "eyebrow accent")}>
          Workout not found
        </p>
        <h2>We could not find that workout.</h2>
        <Link
          className={cx([styles, sharedStyles], "primary-button")}
          to="/workouts"
        >
          Back to library
        </Link>
      </div>
    );
  }

  return (
    <div className={cx([styles, sharedStyles], "workout-detail-page")}>
      <section
        className={cx([styles, sharedStyles], "page-header-block card-panel")}
      >
        <div>
          <p className={cx([styles, sharedStyles], "eyebrow accent")}>
            Workout details
          </p>
          <h2>{workout.name}</h2>
        </div>
        <Link
          className={cx([styles, sharedStyles], "primary-button")}
          to={`/workouts/${workout.id}/active`}
        >
          Start workout
        </Link>
      </section>

      <section className={cx([styles, sharedStyles], "card-panel detail-hero")}>
        <div className={cx([styles, sharedStyles], "detail-badge-row")}>
          <span className={cx([styles, sharedStyles], "badge")}>
            {workout.category}
          </span>
          <span className={cx([styles, sharedStyles], "difficulty-pill")}>
            {workout.difficulty}
          </span>
        </div>

        <div className={cx([styles, sharedStyles], "detail-hero-grid")}>
          <div>
            <h3>Overview</h3>
            <p>{workout.description}</p>
          </div>

          <div className={cx([styles, sharedStyles], "detail-metrics")}>
            <div>
              <strong>{workout.duration}</strong>
              <span>Minutes</span>
            </div>
            <div>
              <strong>{workout.exercisesList.length}</strong>
              <span>Exercises</span>
            </div>
            <div>
              <strong>{workout.equipment}</strong>
              <span>Equipment</span>
            </div>
          </div>
        </div>
      </section>

      <section className={cx([styles, sharedStyles], "detail-grid")}>
        <div className={cx([styles, sharedStyles], "card-panel")}>
          <h3>Muscle groups</h3>
          <div className={cx([styles, sharedStyles], "muscle-tags")}>
            {workout.muscleGroups.map((group) => (
              <span key={group}>{group}</span>
            ))}
          </div>
        </div>

        <div className={cx([styles, sharedStyles], "card-panel")}>
          <h3>Session structure</h3>
          <ul className={cx([styles, sharedStyles], "exercise-list")}>
            {workout.exercisesList.map((exercise) => (
              <li key={exercise.name}>
                <span>{exercise.name}</span>
                <strong>
                  {exercise.sets} x {exercise.reps}
                </strong>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

export default WorkoutDetail;
