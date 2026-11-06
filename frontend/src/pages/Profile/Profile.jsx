import styles from "./Profile.module.css";
import sharedStyles from "../../Shared.module.css";
import { cx } from "../../utils/classNames.js";
import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect, useMemo, useCallback } from "react";
import { setProfile } from "../../features/user/userSlice.js";
import { formatWeight } from "../../utils/formatWeight.js";
import { apiRequest } from "../../services/api.js";
import NoticeModal from "../../components/NoticeModal/NoticeModal.jsx";
import { SPLIT_SCHEDULES, isThreeDaySplit } from "../../utils/splitSchedule.js";

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

const workoutSplitOptions = [
  "Push / Pull / Legs (PPL)",
  "Back & Biceps / Chest & Triceps / Legs & Shoulders",
  "Upper / Lower Split",
  "Bro Split (Chest, Back, Legs, Shoulders, Arms)",
  "Arnold Split (Chest & Back, Shoulders & Arms, Legs)",
  "Full Body (3x / week)",
  "Chest & Biceps / Back & Triceps / Legs & Core",
  "Custom Split",
];

const futurePlanPresets = [
  "Chest Hypertrophy & Density",
  "Upper Chest & Triceps Power",
  "Lat Width & Heavy Pull Day",
  "Upper Back & Rear Delts Density",
  "Quad-Dominant Leg Day",
  "Hamstrings & Glute Builder",
  "Biceps Peak & Forearm Builder",
  "Arm Annihilator (Biceps & Triceps)",
  "Boulder Shoulders Specialization",
  "Upper Body Power",
  "Lower Body Strength",
  "Full Body Builder",
  "HIIT Conditioning",
  "Active Recovery & Mobility",
];

const nextDayOptions = [
  "Today",
  "Tomorrow",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function Profile() {
  const dispatch = useDispatch();
  const profile = useSelector((state) => state.user.profile);
  const authUser = useSelector((state) => state.auth.user);
  const demoMode = useSelector((state) => state.auth.demoMode);
  const units = useSelector((state) => state.user.preferences.units) || profile?.units || "kg";

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState({ isOpen: false, title: "", message: "" });

  // Sync profile from backend on mount
  const loadProfile = useCallback(async () => {
    if (demoMode) return;
    try {
      const data = await apiRequest("/profile");
      if (data?.user) {
        dispatch(setProfile(data.user));
      }
    } catch {
      // Offline or network error - retain existing state gracefully
    }
  }, [demoMode, dispatch]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const displayName = useMemo(() => {
    if (typeof profile?.name === "string" && profile.name.trim()) return profile.name.trim();
    if (typeof authUser?.name === "string" && authUser.name.trim()) return authUser.name.trim();
    return "Athlete";
  }, [profile, authUser]);

  const displayEmail = useMemo(() => {
    if (typeof profile?.email === "string" && profile.email.trim()) return profile.email.trim();
    if (typeof authUser?.email === "string" && authUser.email.trim()) return authUser.email.trim();
    return "athlete@fittrack.app";
  }, [profile, authUser]);

  const userInitials = useMemo(() => {
    const parts = displayName.split(" ").filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return displayName.slice(0, 2).toUpperCase() || "AT";
  }, [displayName]);

  const actualWeight = useMemo(() => {
    if (profile?.currentWeightKg != null && !Number.isNaN(Number(profile.currentWeightKg))) {
      return Number(profile.currentWeightKg);
    }
    if (profile?.weight != null && !Number.isNaN(Number(profile.weight))) {
      return Number(profile.weight);
    }
    return null;
  }, [profile]);

  const actualTrainingDays = profile?.trainingDays || 4;

  const [form, setForm] = useState({
    name: "",
    age: "",
    heightCm: "",
    currentWeightKg: "",
    units: "kg",
    fitnessLevel: "Intermediate",
    goal: "Build Muscle",
    trainingDays: 4,
    equipment: "Commercial Gym",
    workoutDuration: "45 min",
    workoutSplit: "Push / Pull / Legs (PPL)",
    futureWorkoutPlan: "",
    nextWorkoutDay: "Today",
  });

  const handleEditClick = () => {
    setForm({
      name: displayName,
      age: profile?.age ?? "",
      heightCm: profile?.heightCm ?? profile?.height ?? "",
      currentWeightKg: actualWeight ?? "",
      units: units || "kg",
      fitnessLevel: profile?.fitnessLevel || "Intermediate",
      goal: profile?.goal || profile?.mainGoal || "Build Muscle",
      trainingDays: profile?.trainingDays || 4,
      equipment: profile?.equipment || "Commercial Gym",
      workoutDuration: profile?.workoutDuration || "45 min",
      workoutSplit: profile?.workoutSplit || "Push / Pull / Legs (PPL)",
      futureWorkoutPlan: profile?.futureWorkoutPlan || "",
      nextWorkoutDay: profile?.nextWorkoutDay || "Today",
    });
    setIsEditing(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      name: form.name.trim(),
      age: form.age !== "" ? Number(form.age) : undefined,
      heightCm: form.heightCm !== "" ? Number(form.heightCm) : undefined,
      currentWeightKg: form.currentWeightKg !== "" ? Number(form.currentWeightKg) : undefined,
      units: form.units,
      fitnessLevel: form.fitnessLevel,
      goal: form.goal,
      trainingDays: Number(form.trainingDays),
      equipment: form.equipment,
      workoutDuration: form.workoutDuration,
      workoutSplit: form.workoutSplit,
      futureWorkoutPlan: form.futureWorkoutPlan.trim(),
      nextWorkoutDay: form.nextWorkoutDay,
    };

    if (demoMode) {
      dispatch(setProfile({ ...profile, ...payload }));
      setIsEditing(false);
      setIsSaving(false);
      setNotice({
        isOpen: true,
        title: "Profile Updated",
        message: "Profile updated in demo mode.",
        type: "success",
      });
      return;
    }

    try {
      const res = await apiRequest("/profile", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      if (res?.user) {
        dispatch(setProfile(res.user));
      }
      setIsEditing(false);
      setNotice({
        isOpen: true,
        title: "Profile Saved",
        message: "Your athlete parameters and workout split have been synchronized.",
        type: "success",
      });
    } catch (err) {
      setNotice({
        isOpen: true,
        title: "Save Failed",
        message: err.message || "Could not update your athlete profile.",
        type: "info",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Profile completion status
  const profileStatus = useMemo(() => {
    const requiredFields = [
      { key: "name", label: "Name", present: Boolean(displayName) },
      { key: "age", label: "Age", present: profile?.age != null && profile?.age > 0 },
      { key: "height", label: "Height", present: (profile?.heightCm || profile?.height) != null },
      { key: "weight", label: "Weight", present: actualWeight != null && actualWeight > 0 },
      { key: "goal", label: "Goal", present: Boolean(profile?.goal || profile?.mainGoal) },
      { key: "split", label: "Split", present: Boolean(profile?.workoutSplit) },
    ];
    const total = requiredFields.length;
    const completed = requiredFields.filter((f) => f.present).length;
    const missing = requiredFields.filter((f) => !f.present).map((f) => f.label);
    const percent = Math.round((completed / total) * 100);

    return {
      percent,
      isComplete: percent === 100,
      missingLabels: missing,
    };
  }, [profile, displayName, actualWeight]);

  return (
    <div className={styles["profile-page"]}>
      {/* SECTION 1: EXECUTIVE ATHLETE PROFILE HEADER */}
      <section className={styles["profile-header-card"]}>
        <div className={styles["profile-user-info"]}>
          <div className={styles["profile-avatar"]}>
            {userInitials}
          </div>

          <div className={styles["profile-title-block"]}>
            <p className={cx([sharedStyles], "eyebrow accent")} style={{ margin: 0 }}>
              ATHLETE PROFILE &amp; PROTOCOL
            </p>
            <h1 className={styles["profile-name"]}>{displayName}</h1>
            <p className={styles["profile-subtitle"]}>{displayEmail}</p>

            <div className={styles["profile-badges-row"]}>
              <span className={cx([styles["profile-badge"], styles["profile-badge-accent"]])}>
                {profile?.fitnessLevel || "Intermediate"} Athlete
              </span>
              <span className={styles["profile-badge"]}>
                Split: {profile?.workoutSplit || "Push / Pull / Legs (PPL)"}
              </span>
              <span className={styles["profile-badge"]}>
                {actualTrainingDays} Sessions / Wk
              </span>
            </div>
          </div>
        </div>

        {!isEditing && (
          <button
            type="button"
            className={styles["edit-toggle-btn"]}
            onClick={handleEditClick}
          >
            ⚙️ Edit Profile Setup
          </button>
        )}
      </section>

      {/* Incomplete Profile Alert Card */}
      {!profileStatus.isComplete && !isEditing && (
        <section className={styles["incomplete-banner"]}>
          <div className={styles["incomplete-top"]}>
            <div className={styles["incomplete-title-wrap"]}>
              <div className={styles["incomplete-tag-row"]}>
                <span className={styles["incomplete-badge"]}>Action Recommended</span>
                <h3 className={styles["incomplete-headline"]}>
                  Your profile is {profileStatus.percent}% complete
                </h3>
              </div>
              <p className={styles["incomplete-desc"]}>
                Provide your height, age, and weight to calculate accurate caloric burn, volume targets, and progressive overload recommendations.
              </p>
            </div>
            <button
              type="button"
              className={styles["incomplete-btn"]}
              onClick={handleEditClick}
            >
              Complete Profile Now &rarr;
            </button>
          </div>

          <div className={styles["incomplete-bar-wrap"]}>
            <div className={styles["incomplete-bar-track"]}>
              <div
                className={styles["incomplete-bar-fill"]}
                style={{ width: `${profileStatus.percent}%` }}
              />
            </div>
            <span className={styles["incomplete-percent"]}>{profileStatus.percent}%</span>
          </div>

          {profileStatus.missingLabels.length > 0 && (
            <div className={styles["missing-chips-row"]}>
              <span className={styles["missing-label"]}>Missing parameters:</span>
              {profileStatus.missingLabels.map((lbl) => (
                <span key={lbl} className={styles["missing-chip"]}>
                  + {lbl}
                </span>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Edit Profile Form */}
      {isEditing && (
        <form className={styles["profile-edit-card"]} onSubmit={handleSave}>
          <div className={cx([sharedStyles], "panel-header")}>
            <h3 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 800 }}>
              Edit Athlete Parameters &amp; Split
            </h3>
          </div>

          <div className={styles["field-group"]}>
            <label htmlFor="profile-name">Full Athlete Name</label>
            <input
              id="profile-name"
              name="name"
              className={styles["form-input"]}
              type="text"
              required
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div className={styles["form-grid-3"]}>
            <div className={styles["field-group"]}>
              <label htmlFor="profile-age">Age (years)</label>
              <input
                id="profile-age"
                name="age"
                className={styles["form-input"]}
                type="number"
                min="10"
                max="120"
                placeholder="e.g. 25"
                value={form.age}
                onChange={handleChange}
              />
            </div>

            <div className={styles["field-group"]}>
              <label htmlFor="profile-height">Height (cm)</label>
              <input
                id="profile-height"
                name="heightCm"
                className={styles["form-input"]}
                type="number"
                min="50"
                max="260"
                placeholder="e.g. 178"
                value={form.heightCm}
                onChange={handleChange}
              />
            </div>

            <div className={styles["field-group"]}>
              <label htmlFor="profile-weight">Current Weight ({form.units})</label>
              <input
                id="profile-weight"
                name="currentWeightKg"
                className={styles["form-input"]}
                type="number"
                min="20"
                max="500"
                step="0.1"
                placeholder="e.g. 74.5"
                value={form.currentWeightKg}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles["form-grid-2"]}>
            <div className={styles["field-group"]}>
              <label htmlFor="profile-fitness-level">Fitness Level</label>
              <select
                id="profile-fitness-level"
                name="fitnessLevel"
                className={styles["form-select"]}
                value={form.fitnessLevel}
                onChange={handleChange}
              >
                {fitnessLevels.map((lvl) => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
            </div>

            <div className={styles["field-group"]}>
              <label htmlFor="profile-goal">Primary Goal</label>
              <select
                id="profile-goal"
                name="goal"
                className={styles["form-select"]}
                value={form.goal}
                onChange={handleChange}
              >
                {goalOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles["form-grid-3"]}>
            <div className={styles["field-group"]}>
              <label htmlFor="profile-training-days">Weekly Training Days</label>
              <input
                id="profile-training-days"
                name="trainingDays"
                className={styles["form-input"]}
                type="number"
                min="1"
                max="7"
                value={form.trainingDays}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles["field-group"]}>
              <label htmlFor="profile-equipment">Available Equipment</label>
              <select
                id="profile-equipment"
                name="equipment"
                className={styles["form-select"]}
                value={form.equipment}
                onChange={handleChange}
              >
                {equipmentOptions.map((eq) => (
                  <option key={eq} value={eq}>{eq}</option>
                ))}
              </select>
            </div>

            <div className={styles["field-group"]}>
              <label htmlFor="profile-duration">Preferred Session Length</label>
              <select
                id="profile-duration"
                name="workoutDuration"
                className={styles["form-select"]}
                value={form.workoutDuration}
                onChange={handleChange}
              >
                {sessionLengths.map((dur) => (
                  <option key={dur} value={dur}>{dur}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <p className={cx([sharedStyles], "eyebrow accent")} style={{ margin: "0 0 8px" }}>
              TRAINING SPLIT &amp; FUTURE PLAN
            </p>
          </div>

          <div className={styles["form-grid-2"]}>
            <div className={styles["field-group"]}>
              <label htmlFor="profile-split">Workout Split</label>
              <select
                id="profile-split"
                name="workoutSplit"
                className={styles["form-select"]}
                value={form.workoutSplit}
                onChange={handleChange}
              >
                {workoutSplitOptions.map((sp) => (
                  <option key={sp} value={sp}>{sp}</option>
                ))}
              </select>
            </div>

            <div className={styles["field-group"]}>
              <label htmlFor="profile-next-day">Next Scheduled Day</label>
              <select
                id="profile-next-day"
                name="nextWorkoutDay"
                className={styles["form-select"]}
                value={form.nextWorkoutDay}
                onChange={handleChange}
              >
                {nextDayOptions.map((day) => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles["field-group"]}>
            <label htmlFor="profile-future-plan">
              Next Planned Session / Target Body Focus Day
            </label>
            <input
              id="profile-future-plan"
              name="futureWorkoutPlan"
              className={styles["form-input"]}
              type="text"
              list="future-plan-presets"
              value={form.futureWorkoutPlan}
              onChange={handleChange}
              placeholder="e.g. Chest Hypertrophy &amp; Density, Quad-Dominant Leg Day..."
            />
            <datalist id="future-plan-presets">
              {futurePlanPresets.map((preset) => (
                <option key={preset} value={preset} />
              ))}
            </datalist>
          </div>

          {/* 3-Day Auto-Assigned Schedule Preview (Sunday Rest) */}
          {isThreeDaySplit(form.workoutSplit) && SPLIT_SCHEDULES[form.workoutSplit] && (
            <div style={{ marginTop: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--accent-red)" }}>
                  3-Day Rotating Split (Mon &amp; Thu • Tue &amp; Fri • Wed &amp; Sat) • Sunday Rest
                </span>
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Repeats After 3 Days</span>
              </div>
              <div className={styles["split-schedule-grid"]}>
                {Object.entries(SPLIT_SCHEDULES[form.workoutSplit].schedule).map(([day, info]) => (
                  <div
                    key={day}
                    className={`${styles["schedule-day-card"]} ${!info.isRest ? styles["training"] : day === "Sunday" ? styles["sunday"] : ""}`}
                  >
                    <span className={styles["schedule-day-title"]}>
                      {day.slice(0, 3)}
                    </span>
                    <span
                      className={styles["schedule-day-workout"]}
                      style={day === "Sunday" ? { color: "#3b82f6" } : !info.isRest ? { color: "var(--accent-red)" } : { color: "var(--text-muted)" }}
                    >
                      {day === "Sunday" ? "Rest Day 🛑" : info.session}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={styles["profile-edit-actions"]}>
            <button
              type="button"
              className={cx([sharedStyles], "secondary-button")}
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className={cx([sharedStyles], "primary-button")}
            >
              {isSaving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      )}

      {/* SECTION 2: 4 BIOMETRICS KPI CARDS */}
      <section className={styles["biometrics-grid"]}>
        <article className={styles["biometric-card"]}>
          <span className={styles["biometric-label"]}>Bodyweight</span>
          <h3 className={styles["biometric-val"]}>
            {actualWeight != null ? formatWeight(actualWeight, units) : "Not set"}
          </h3>
          <p className={styles["biometric-sub"]}>Measured in {units.toUpperCase()}</p>
        </article>

        <article className={styles["biometric-card"]}>
          <span className={styles["biometric-label"]}>Heart Rate Monitor</span>
          <h3 className={styles["biometric-val"]}>Not tracked</h3>
          <p className={styles["biometric-sub"]}>Connect wearable device</p>
        </article>

        <article className={styles["biometric-card"]}>
          <span className={styles["biometric-label"]}>Weekly Target</span>
          <h3 className={styles["biometric-val"]}>{actualTrainingDays} Sessions</h3>
          <p className={styles["biometric-sub"]}>Planned cadence per week</p>
        </article>

        <article className={styles["biometric-card"]}>
          <span className={styles["biometric-label"]}>Profile Score</span>
          <h3 className={styles["biometric-val"]}>{profileStatus.percent}%</h3>
          <p className={styles["biometric-sub"]}>Athlete profile completeness</p>
        </article>
      </section>

      {/* SECTION 3: 2-COLUMN PROFILE DETAILS */}
      <section className={styles["profile-details-grid"]}>
        {/* Personal Details Card */}
        <article className={styles["detail-card"]}>
          <div className={styles["detail-header"]}>
            <h3>Anthropometry &amp; Biometrics</h3>
          </div>
          <div className={styles["detail-list"]}>
            <div className={styles["detail-row"]}>
              <span>Registered Email</span>
              <strong>{displayEmail}</strong>
            </div>
            <div className={styles["detail-row"]}>
              <span>Chronological Age</span>
              <strong>{profile?.age ? `${profile.age} yrs` : "Not provided"}</strong>
            </div>
            <div className={styles["detail-row"]}>
              <span>Stature / Height</span>
              <strong>
                {profile?.heightCm || profile?.height
                  ? `${profile.heightCm || profile.height} cm`
                  : "Not provided"}
              </strong>
            </div>
            <div className={styles["detail-row"]}>
              <span>Current Scale Weight</span>
              <strong>
                {actualWeight != null ? formatWeight(actualWeight, units) : "Not provided"}
              </strong>
            </div>
            <div className={styles["detail-row"]}>
              <span>Primary Athletic Goal</span>
              <strong>{profile?.goal || profile?.mainGoal || "Improve Fitness"}</strong>
            </div>
          </div>
        </article>

        {/* Training Preferences & Split Card */}
        <article className={styles["detail-card"]}>
          <div className={styles["detail-header"]}>
            <h3>Training Preferences &amp; Split Protocol</h3>
          </div>
          <div className={styles["detail-list"]}>
            <div className={styles["detail-row"]}>
              <span>Active Workout Split</span>
              <strong style={{ color: "var(--accent-red)" }}>
                {profile?.workoutSplit || "Push / Pull / Legs (PPL)"}
              </strong>
            </div>
            <div className={styles["detail-row"]}>
              <span>Next Planned Session</span>
              <strong>{profile?.futureWorkoutPlan || "No session scheduled"}</strong>
            </div>
            <div className={styles["detail-row"]}>
              <span>Next Target Day</span>
              <strong>{profile?.nextWorkoutDay || "Not set"}</strong>
            </div>
            <div className={styles["detail-row"]}>
              <span>Fitness Level</span>
              <strong>{profile?.fitnessLevel || "Intermediate"}</strong>
            </div>
            <div className={styles["detail-row"]}>
              <span>Facility Equipment Setup</span>
              <strong>{profile?.equipment || "Commercial Gym"}</strong>
            </div>
            <div className={styles["detail-row"]}>
              <span>Preferred Session Length</span>
              <strong>{profile?.workoutDuration || "45 min"}</strong>
            </div>
          </div>

          {/* Auto-Assigned Schedule Breakdown */}
          {isThreeDaySplit(profile?.workoutSplit || form.workoutSplit) &&
            SPLIT_SCHEDULES[profile?.workoutSplit || form.workoutSplit] && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border-color)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--accent-red)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Weekly Split Routine • 3-Day Cycle Repeated • Sunday Rest
                  </span>
                  <small style={{ color: "var(--text-muted)", fontSize: "0.76rem" }}>Auto-Assigned</small>
                </div>
                <div className={styles["split-schedule-grid"]}>
                  {Object.entries(
                    SPLIT_SCHEDULES[profile?.workoutSplit || form.workoutSplit].schedule
                  ).map(([day, info]) => (
                    <div
                      key={day}
                      className={`${styles["schedule-day-card"]} ${
                        !info.isRest
                          ? styles["training"]
                          : day === "Sunday"
                          ? styles["sunday"]
                          : ""
                      }`}
                    >
                      <span className={styles["schedule-day-title"]}>
                        {day.slice(0, 3)}
                      </span>
                      <span
                        className={styles["schedule-day-workout"]}
                        style={
                          day === "Sunday"
                            ? { color: "#3b82f6" }
                            : !info.isRest
                            ? { color: "var(--accent-red)" }
                            : { color: "var(--text-muted)" }
                        }
                      >
                        {day === "Sunday" ? "Rest Day 🛑" : info.session}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </article>
      </section>

      <NoticeModal
        isOpen={notice.isOpen}
        title={notice.title}
        message={notice.message}
        type={notice.type}
        isDemo={notice.isDemo ?? false}
        onClose={() => setNotice((prev) => ({ ...prev, isOpen: false, isDemo: false }))}
      />
    </div>
  );
}

export default Profile;
