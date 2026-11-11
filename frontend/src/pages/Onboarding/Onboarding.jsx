import styles from "./Onboarding.module.css";
import sharedStyles from "../../Shared.module.css";
import { cx } from "../../utils/classNames.js";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { setProfile } from "../../features/user/userSlice.js";
import { apiRequest } from "../../services/api.js";
import ThemeToggle from "../../components/ThemeToggle/ThemeToggle.jsx";
import BrandLogo from "../../components/Brand/BrandLogo.jsx";

const fitnessLevels = ["Beginner", "Intermediate", "Advanced"];
const goalOptions = [
  "Lose Weight",
  "Build Muscle",
  "Increase Strength",
  "Improve Fitness",
  "Improve Endurance",
  "Maintain Fitness",
];
const equipmentOptions = [
  "Home Gym",
  "Commercial Gym",
  "Minimal Equipment",
  "Bodyweight Only",
];
const sessionLengths = ["30 min", "45 min", "60 min", "75 min"];

const defaultForm = {
  name: "",
  age: "",
  height: "",
  weight: "",
  fitnessLevel: "Beginner",
  mainGoal: "Improve Fitness",
  trainingDays: "3",
  equipment: "Home Gym",
  workoutDuration: "45 min",
};

function Onboarding() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth.user);
  const [form, setForm] = useState({
    ...defaultForm,
    name: authUser?.name || "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = "Please enter your name.";
    }

    if (!form.age || Number(form.age) < 10 || Number(form.age) > 100) {
      nextErrors.age = "Age must be between 10 and 100.";
    }

    if (!form.height || Number(form.height) <= 0) {
      nextErrors.height = "Height is required.";
    }

    if (!form.weight || Number(form.weight) <= 0) {
      nextErrors.weight = "Weight is required.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate() || isSubmitting) return;
    const profile = {
      name: form.name.trim(), age: Number(form.age), height: Number(form.height),
      weight: Number(form.weight), fitnessLevel: form.fitnessLevel,
      mainGoal: form.mainGoal, trainingDays: Number(form.trainingDays),
      equipment: form.equipment, workoutDuration: form.workoutDuration,
    };
    setIsSubmitting(true);
    setErrors({});
    try {
      if (!authUser?.demoMode) {
        const saved = await apiRequest("/profile", { method: "PATCH", body: JSON.stringify({
          name: profile.name, age: profile.age, heightCm: profile.height,
          currentWeightKg: profile.weight, fitnessLevel: profile.fitnessLevel,
          goal: profile.mainGoal, trainingDays: profile.trainingDays,
          equipment: profile.equipment, workoutDuration: profile.workoutDuration,
        }) });
        dispatch(setProfile({ ...profile, ...saved.user }));
      } else {
        dispatch(setProfile(profile));
      }
      navigate("/dashboard");
    } catch (error) {
      setErrors({ form: error.message || "Could not save your profile. Please try again." });
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className={cx([styles, sharedStyles], "auth-page onboarding-page")}>
      <div className={cx([styles, sharedStyles], "auth-card onboarding-card")}>
        {/* Top actions bar with Home link & Theme Toggle */}
        <div
          className="flex items-center justify-between mb-5 pb-3 border-b"
          style={{ borderColor: "var(--border-color)" }}
        >
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all hover:border-red-500"
            style={{
              backgroundColor: "var(--bg-card-subtle)",
              borderColor: "var(--border-color)",
              color: "var(--text-main)",
            }}
            title="Return to FitTrack Home"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span>Home</span>
          </Link>
          <ThemeToggle />
        </div>

        <div className={cx([styles, sharedStyles], "auth-header")}>
          <Link to="/" title="Go to FitTrack Home" style={{ display: "inline-flex", textDecoration: "none" }}>
            <BrandLogo variant="symbol" mode="auto" height={38} />
          </Link>
          <div>
            <p className={cx([styles, sharedStyles], "eyebrow accent")}>
              Personalize your plan
            </p>
            <h2>Set up your fitness profile</h2>
          </div>
        </div>

        <form
          className={cx([styles, sharedStyles], "auth-form onboarding-form")}
          onSubmit={handleSubmit}
          noValidate
        >
          {errors.form && <p className={cx([styles, sharedStyles], "field-error")} role="alert">{errors.form}</p>}
          <div className={cx([styles, sharedStyles], "field-row")}>
            <div className={cx([styles, sharedStyles], "field-group")}>
              <label htmlFor="name">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={
                  errors.name ? "onboarding-name-error" : undefined
                }
              />
              {errors.name && (
                <span
                  id="onboarding-name-error"
                  className={cx([styles, sharedStyles], "field-error")}
                  role="alert"
                >
                  {errors.name}
                </span>
              )}
            </div>

            <div className={cx([styles, sharedStyles], "field-group")}>
              <label htmlFor="age">Age</label>
              <input
                id="age"
                name="age"
                type="number"
                value={form.age}
                onChange={handleChange}
                aria-invalid={Boolean(errors.age)}
                aria-describedby={
                  errors.age ? "onboarding-age-error" : undefined
                }
              />
              {errors.age && (
                <span
                  id="onboarding-age-error"
                  className={cx([styles, sharedStyles], "field-error")}
                  role="alert"
                >
                  {errors.age}
                </span>
              )}
            </div>
          </div>

          <div className={cx([styles, sharedStyles], "field-row")}>
            <div className={cx([styles, sharedStyles], "field-group")}>
              <label htmlFor="height">Height (cm)</label>
              <input
                id="height"
                name="height"
                type="number"
                value={form.height}
                onChange={handleChange}
                aria-invalid={Boolean(errors.height)}
                aria-describedby={
                  errors.height ? "onboarding-height-error" : undefined
                }
              />
              {errors.height && (
                <span
                  id="onboarding-height-error"
                  className={cx([styles, sharedStyles], "field-error")}
                  role="alert"
                >
                  {errors.height}
                </span>
              )}
            </div>

            <div className={cx([styles, sharedStyles], "field-group")}>
              <label htmlFor="weight">Weight (kg)</label>
              <input
                id="weight"
                name="weight"
                type="number"
                value={form.weight}
                onChange={handleChange}
                aria-invalid={Boolean(errors.weight)}
                aria-describedby={
                  errors.weight ? "onboarding-weight-error" : undefined
                }
              />
              {errors.weight && (
                <span
                  id="onboarding-weight-error"
                  className={cx([styles, sharedStyles], "field-error")}
                  role="alert"
                >
                  {errors.weight}
                </span>
              )}
            </div>
          </div>

          <div className={cx([styles, sharedStyles], "field-row")}>
            <div className={cx([styles, sharedStyles], "field-group")}>
              <label htmlFor="fitnessLevel">Fitness level</label>
              <select
                id="fitnessLevel"
                name="fitnessLevel"
                value={form.fitnessLevel}
                onChange={handleChange}
              >
                {fitnessLevels.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className={cx([styles, sharedStyles], "field-group")}>
              <label htmlFor="trainingDays">Training days</label>
              <input
                id="trainingDays"
                name="trainingDays"
                type="number"
                min="1"
                max="7"
                value={form.trainingDays}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={cx([styles, sharedStyles], "field-row")}>
            <div className={cx([styles, sharedStyles], "field-group")}>
              <label htmlFor="mainGoal">Main goal</label>
              <select
                id="mainGoal"
                name="mainGoal"
                value={form.mainGoal}
                onChange={handleChange}
              >
                {goalOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className={cx([styles, sharedStyles], "field-group")}>
              <label htmlFor="equipment">Equipment</label>
              <select
                id="equipment"
                name="equipment"
                value={form.equipment}
                onChange={handleChange}
              >
                {equipmentOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={cx([styles, sharedStyles], "field-group")}>
            <label htmlFor="workoutDuration">Preferred workout duration</label>
            <select
              id="workoutDuration"
              name="workoutDuration"
              value={form.workoutDuration}
              onChange={handleChange}
            >
              {sessionLengths.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className={cx([styles, sharedStyles], "primary-button auth-submit")}
          >
            {isSubmitting ? "Saving profile…" : "Continue to dashboard"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="text-xs text-zinc-500 hover:text-red-500 mt-2 block text-center w-full bg-transparent border-none cursor-pointer font-medium transition-colors"
          >
            Skip setup for now &rarr; Go to dashboard
          </button>
        </form>
      </div>
    </div>
  );
}

export default Onboarding;
