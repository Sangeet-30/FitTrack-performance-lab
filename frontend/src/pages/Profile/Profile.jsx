import styles from "./Profile.module.css";
import sharedStyles from "../../Shared.module.css";
import { cx } from "../../utils/classNames.js";
import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect, useMemo, useCallback } from "react";
import { setProfile } from "../../features/user/userSlice.js";
import { formatWeight } from "../../utils/formatWeight.js";
import { apiRequest } from "../../services/api.js";
import NoticeModal from "../../components/NoticeModal/NoticeModal.jsx";

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
  }, [profile?.name, authUser?.name]);

  const displayEmail = useMemo(() => {
    if (typeof profile?.email === "string" && profile.email.trim()) return profile.email.trim();
    if (typeof authUser?.email === "string" && authUser.email.trim()) return authUser.email.trim();
    return "Not provided";
  }, [profile?.email, authUser?.email]);

  const avatarInitial = useMemo(() => {
    return displayName.charAt(0).toUpperCase() || "A";
  }, [displayName]);

  // Actual Form State
  const [form, setForm] = useState({
    name: "",
    age: "",
    heightCm: "",
    currentWeightKg: "",
    fitnessLevel: "Beginner",
    goal: "Improve Fitness",
    trainingDays: 4,
    equipment: "Commercial Gym",
    workoutDuration: "45 min",
    units: "kg",
  });

  // Keep form in sync when profile updates
  useEffect(() => {
    setForm({
      name: profile?.name || displayName,
      age: profile?.age ?? "",
      heightCm: profile?.heightCm ?? profile?.height ?? "",
      currentWeightKg: profile?.currentWeightKg ?? profile?.weight ?? "",
      fitnessLevel: profile?.fitnessLevel || "Beginner",
      goal: profile?.goal || profile?.mainGoal || "Improve Fitness",
      trainingDays: profile?.trainingDays || 4,
      equipment: profile?.equipment || "Commercial Gym",
      workoutDuration: profile?.workoutDuration || "45 min",
      units: profile?.units || units || "kg",
    });
  }, [profile, displayName, units]);

  // Calculate Profile Completeness
  const profileStatus = useMemo(() => {
    const fields = [
      { key: "name", label: "Name", val: profile?.name || displayName },
      { key: "age", label: "Age", val: profile?.age },
      { key: "heightCm", label: "Height", val: profile?.heightCm || profile?.height },
      { key: "currentWeightKg", label: "Weight", val: profile?.currentWeightKg || profile?.weight },
      { key: "goal", label: "Fitness Goal", val: profile?.goal || profile?.mainGoal },
      { key: "fitnessLevel", label: "Fitness Level", val: profile?.fitnessLevel },
      { key: "trainingDays", label: "Weekly Sessions", val: profile?.trainingDays },
      { key: "equipment", label: "Equipment", val: profile?.equipment },
      { key: "workoutDuration", label: "Workout Duration", val: profile?.workoutDuration },
    ];

    const missing = fields.filter((f) => f.val == null || f.val === "");
    const percent = Math.round(((fields.length - missing.length) / fields.length) * 100);

    return {
      isComplete: missing.length === 0,
      percent,
      missingLabels: missing.map((m) => m.label),
    };
  }, [profile, displayName]);

  const handleEditClick = () => {
    if (demoMode) {
      setNotice({
        isOpen: true,
        title: "Profile Editing Disabled",
        message: "You are exploring FitTrack in Demo Overview mode. Edits are disabled in preview mode. Create a personal account to customize your athlete profile!",
      });
      return;
    }
    setIsEditing(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (demoMode) return;

    setIsSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        fitnessLevel: form.fitnessLevel,
        goal: form.goal,
        trainingDays: Number(form.trainingDays) || 4,
        equipment: form.equipment || undefined,
        workoutDuration: form.workoutDuration || "45 min",
        units: form.units || "kg",
      };

      if (form.age !== "" && !isNaN(Number(form.age))) {
        payload.age = Number(form.age);
      }
      if (form.heightCm !== "" && !isNaN(Number(form.heightCm))) {
        payload.heightCm = Number(form.heightCm);
      }
      if (form.currentWeightKg !== "" && !isNaN(Number(form.currentWeightKg))) {
        payload.currentWeightKg = Number(form.currentWeightKg);
      }

      const res = await apiRequest("/profile", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      const updated = res?.user || { ...profile, ...payload };
      dispatch(setProfile(updated));
      setIsEditing(false);
      setNotice({
        isOpen: true,
        title: "Profile Saved",
        message: "Your athlete profile and preferences have been updated successfully.",
      });
    } catch (err) {
      setNotice({
        isOpen: true,
        title: "Update Error",
        message: err.message || "Failed to update profile. Please verify your inputs.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Real quick stats (no fake 72 kg, 58 bpm, or 89%!)
  const actualWeight = profile?.currentWeightKg ?? profile?.weight;
  const actualTrainingDays = profile?.trainingDays || 4;

  return (
    <div className={cx([styles, sharedStyles], "profile-page")}>
      {/* Page Header */}
      <section
        className={cx(
          [styles, sharedStyles],
          "page-header-block card-panel profile-header",
        )}
      >
        <div className={cx([styles, sharedStyles], "profile-intro")}>
          <div className={cx([styles, sharedStyles], "profile-avatar")}>
            {avatarInitial}
          </div>
          <div>
            <p className={cx([styles, sharedStyles], "eyebrow accent")}>
              Athlete Profile
            </p>
            <h2>{displayName}</h2>
          </div>
        </div>
        {!isEditing && (
          <button
            type="button"
            className={cx(
              [styles, sharedStyles],
              "primary-button small-button",
            )}
            onClick={handleEditClick}
          >
            Edit profile
          </button>
        )}
      </section>

      {/* Profile Incomplete Banner (if < 100%) */}
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
              <span className={styles["missing-label"]}>Missing:</span>
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
        <form
          className={cx([styles, sharedStyles], "card-panel profile-edit-form")}
          onSubmit={handleSave}
        >
          <div className={cx([styles, sharedStyles], "panel-header")}>
            <h3>Edit Profile Details</h3>
          </div>

          <div className={cx([styles, sharedStyles], "field-group")}>
            <label htmlFor="profile-name">Full Name</label>
            <input
              id="profile-name"
              name="name"
              type="text"
              required
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div className={cx([styles, sharedStyles], "field-row")}>
            <div className={cx([styles, sharedStyles], "field-group")}>
              <label htmlFor="profile-age">Age (years)</label>
              <input
                id="profile-age"
                name="age"
                type="number"
                min="10"
                max="120"
                placeholder="e.g. 25"
                value={form.age}
                onChange={handleChange}
              />
            </div>

            <div className={cx([styles, sharedStyles], "field-group")}>
              <label htmlFor="profile-height">Height (cm)</label>
              <input
                id="profile-height"
                name="heightCm"
                type="number"
                min="50"
                max="260"
                placeholder="e.g. 178"
                value={form.heightCm}
                onChange={handleChange}
              />
            </div>

            <div className={cx([styles, sharedStyles], "field-group")}>
              <label htmlFor="profile-weight">Current Weight ({form.units})</label>
              <input
                id="profile-weight"
                name="currentWeightKg"
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

          <div className={cx([styles, sharedStyles], "field-row")}>
            <div className={cx([styles, sharedStyles], "field-group")}>
              <label htmlFor="profile-fitness-level">Fitness Level</label>
              <select
                id="profile-fitness-level"
                name="fitnessLevel"
                value={form.fitnessLevel}
                onChange={handleChange}
              >
                {fitnessLevels.map((lvl) => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
            </div>

            <div className={cx([styles, sharedStyles], "field-group")}>
              <label htmlFor="profile-goal">Primary Goal</label>
              <select
                id="profile-goal"
                name="goal"
                value={form.goal}
                onChange={handleChange}
              >
                {goalOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={cx([styles, sharedStyles], "field-row")}>
            <div className={cx([styles, sharedStyles], "field-group")}>
              <label htmlFor="profile-training-days">Weekly Training Days</label>
              <input
                id="profile-training-days"
                name="trainingDays"
                type="number"
                min="1"
                max="7"
                value={form.trainingDays}
                onChange={handleChange}
                required
              />
            </div>

            <div className={cx([styles, sharedStyles], "field-group")}>
              <label htmlFor="profile-equipment">Available Equipment</label>
              <select
                id="profile-equipment"
                name="equipment"
                value={form.equipment}
                onChange={handleChange}
              >
                {equipmentOptions.map((eq) => (
                  <option key={eq} value={eq}>{eq}</option>
                ))}
              </select>
            </div>

            <div className={cx([styles, sharedStyles], "field-group")}>
              <label htmlFor="profile-duration">Preferred Session Length</label>
              <select
                id="profile-duration"
                name="workoutDuration"
                value={form.workoutDuration}
                onChange={handleChange}
              >
                {sessionLengths.map((dur) => (
                  <option key={dur} value={dur}>{dur}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles["profile-edit-actions"]}>
            <button
              type="submit"
              disabled={isSaving}
              className={cx([styles, sharedStyles], "primary-button")}
            >
              {isSaving ? "Saving..." : "Save Profile"}
            </button>
            <button
              type="button"
              className={cx([styles, sharedStyles], "secondary-button")}
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Actual Stats Grid (No fake 72 kg or 58 bpm!) */}
      <section className={cx([styles, sharedStyles], "stats-grid profile-stats")}>
        <div className={cx([styles, sharedStyles], "stat-card profile-stat-card")}>
          <div className={cx([styles, sharedStyles], "stat-copy")}>
            <span>Bodyweight</span>
            <strong>
              {actualWeight != null ? formatWeight(actualWeight, units) : "Not set"}
            </strong>
          </div>
        </div>

        <div className={cx([styles, sharedStyles], "stat-card profile-stat-card")}>
          <div className={cx([styles, sharedStyles], "stat-copy")}>
            <span>Heart Rate Monitor</span>
            <strong>Not tracked</strong>
          </div>
        </div>

        <div className={cx([styles, sharedStyles], "stat-card profile-stat-card")}>
          <div className={cx([styles, sharedStyles], "stat-copy")}>
            <span>Weekly Goal</span>
            <strong>{actualTrainingDays} sessions</strong>
          </div>
        </div>

        <div className={cx([styles, sharedStyles], "stat-card profile-stat-card")}>
          <div className={cx([styles, sharedStyles], "stat-copy")}>
            <span>Profile Completion</span>
            <strong>{profileStatus.percent}%</strong>
          </div>
        </div>
      </section>

      {/* Personal Details & Actual Preferences */}
      <section className={cx([styles, sharedStyles], "profile-grid")}>
        <div className={cx([styles, sharedStyles], "card-panel")}>
          <div className={cx([styles, sharedStyles], "panel-header")}>
            <h3>Personal Details</h3>
          </div>
          <div className={cx([styles, sharedStyles], "profile-detail-list")}>
            <div>
              <span>Email</span>
              <strong>{displayEmail}</strong>
            </div>
            <div>
              <span>Age</span>
              <strong>{profile?.age ? `${profile.age} yrs` : "Not provided"}</strong>
            </div>
            <div>
              <span>Height</span>
              <strong>
                {profile?.heightCm || profile?.height
                  ? `${profile.heightCm || profile.height} cm`
                  : "Not provided"}
              </strong>
            </div>
            <div>
              <span>Current Weight</span>
              <strong>
                {actualWeight != null ? formatWeight(actualWeight, units) : "Not provided"}
              </strong>
            </div>
            <div>
              <span>Primary Goal</span>
              <strong>{profile?.goal || profile?.mainGoal || "Improve Fitness"}</strong>
            </div>
          </div>
        </div>

        <div className={cx([styles, sharedStyles], "card-panel")}>
          <div className={cx([styles, sharedStyles], "panel-header")}>
            <h3>Training Preferences</h3>
          </div>
          <ul className={cx([styles, sharedStyles], "preference-list")}>
            <li>
              <span>Fitness Level</span>
              <strong>{profile?.fitnessLevel || "Beginner"}</strong>
            </li>
            <li>
              <span>Weekly Target</span>
              <strong>{actualTrainingDays} sessions / week</strong>
            </li>
            <li>
              <span>Equipment Setup</span>
              <strong>{profile?.equipment || "Commercial Gym"}</strong>
            </li>
            <li>
              <span>Workout Duration</span>
              <strong>{profile?.workoutDuration || "45 min"}</strong>
            </li>
            <li>
              <span>Measurement Units</span>
              <strong>{units.toUpperCase()}</strong>
            </li>
          </ul>
        </div>
      </section>

      <NoticeModal
        isOpen={notice.isOpen}
        title={notice.title}
        message={notice.message}
        onClose={() => setNotice((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

export default Profile;
