import { useState } from "react";
import styles from "./Settings.module.css";
import sharedStyles from "../../Shared.module.css";
import { cx } from "../../utils/classNames.js";
import { useDispatch, useSelector } from "react-redux";
import { updatePreferences, setProfile } from "../../features/user/userSlice.js";
import { apiRequest } from "../../services/api.js";
import NoticeModal from "../../components/NoticeModal/NoticeModal.jsx";

function Settings() {
  const dispatch = useDispatch();
  const preferences = useSelector((state) => state.user.preferences);
  const user = useSelector((state) => state.user.profile);
  const authUser = useSelector((state) => state.auth.user);
  const demoMode = useSelector((state) => state.auth.demoMode);

  const isDemoUser = Boolean(
    demoMode ||
    user?.isDemo ||
    authUser?.isDemo ||
    authUser?.email === "demo@fittrack.app" ||
    user?.email === "demo@fittrack.app"
  );

  const [notice, setNotice] = useState({
    isOpen: false,
    title: "",
    message: "",
    eyebrow: "Demo Account",
  });

  const triggerDemoNotice = () => {
    setNotice({
      isOpen: true,
      title: "Settings Read-Only",
      message:
        "Demo account settings and environment preferences cannot be modified. Create a personal athlete account to configure custom units, timer intervals, and notifications.",
      eyebrow: "Demo Account",
      type: "info",
    });
  };

  const handlePreferenceChange = (key, value) => {
    if (isDemoUser) {
      triggerDemoNotice();
      return;
    }

    dispatch(updatePreferences({ [key]: value }));
    // If unit changed, sync to backend profile too
    if (key === "units") {
      apiRequest("/profile", {
        method: "PATCH",
        body: JSON.stringify({ units: value }),
      })
        .then((res) => {
          if (res?.user) dispatch(setProfile(res.user));
        })
        .catch(() => {});
    }
  };

  const level = user?.fitnessLevel || authUser?.fitnessLevel;
  const athleteStatus = isDemoUser
    ? "Demo Overview"
    : level
    ? `${level} Athlete`
    : "Active Athlete";

  const settingsSections = [
    {
      title: "Account & Interface",
      fields: [
        {
          label: "Email Notifications",
          key: "notifications",
          type: "checkbox",
          readOnly: isDemoUser,
        },
        {
          label: "Athlete Status",
          value: athleteStatus,
          type: "info",
          readOnly: true,
        },
        {
          label: "Interface Language",
          key: "language",
          type: "select",
          options: [
            "English (US)",
            "English (UK)",
            "Español",
            "Français",
            "Deutsch",
            "Hindi",
            "日本語",
          ],
          readOnly: isDemoUser,
        },
      ],
    },
    {
      title: "Training Engine Controls",
      fields: [
        {
          label: "Standard Measurement Units",
          key: "units",
          type: "select",
          options: ["kg", "lb"],
          readOnly: isDemoUser,
        },
        {
          label: "Auto-Save Active Workouts",
          key: "autoSaveWorkouts",
          type: "checkbox",
          readOnly: isDemoUser,
        },
        {
          label: "Inter-Set Rest Timer",
          key: "restTimer",
          type: "select",
          options: [30, 60, 90, 120, 180],
          formatOption: (value) => `${value} seconds`,
          readOnly: isDemoUser,
        },
        {
          label: "Workout Reminder Cadence",
          key: "workoutReminders",
          type: "select",
          options: ["Off", "Daily", "Weekdays", "Weekly"],
          readOnly: isDemoUser,
        },
      ],
    },
    {
      title: "Privacy & Cloud Security",
      fields: [
        {
          label: "Profile Visibility Mode",
          key: "profileVisibility",
          type: "select",
          options: ["Private", "Public"],
          readOnly: isDemoUser,
        },
        {
          label: "Share Analytics with Coach",
          key: "shareProgress",
          type: "checkbox",
          readOnly: isDemoUser,
        },
        {
          label: "Two-Factor Authentication",
          key: "twoFactorAuth",
          type: "checkbox",
          readOnly: isDemoUser,
        },
      ],
    },
  ];

  return (
    <div className={styles["settings-page"]}>
      {/* SECTION 1: EXECUTIVE HEADER */}
      <section className={styles["settings-header-card"]}>
        <div className={styles["header-text"]}>
          <p className={cx([sharedStyles], "eyebrow accent")} style={{ margin: 0 }}>
            SYSTEM &amp; PREFERENCES
          </p>
          <h1>Settings &amp; Environment</h1>
          <p>Configure units of measure, rest timer intervals, notifications, and telemetry options.</p>
        </div>

        {isDemoUser && (
          <span className={styles["demo-readonly-pill"]}>
            🔒 Demo Settings (Read-Only)
          </span>
        )}
      </section>

      {/* SECTION 2: STATUS STRIP */}
      <section className={styles["settings-status-strip"]}>
        <article className={styles["status-card"]}>
          <span className={styles["status-card-label"]}>Athlete Tier</span>
          <h3 className={styles["status-card-value"]}>{athleteStatus}</h3>
          <p className={styles["status-card-sub"]}>Personal training profile</p>
        </article>

        <article className={styles["status-card"]}>
          <span className={styles["status-card-label"]}>Active Units</span>
          <h3 className={styles["status-card-value"]}>
            {(preferences.units || "kg").toUpperCase()}
          </h3>
          <p className={styles["status-card-sub"]}>Metric / Imperial system</p>
        </article>

        <article className={styles["status-card"]}>
          <span className={styles["status-card-label"]}>Inter-Set Rest</span>
          <h3 className={styles["status-card-value"]}>
            {preferences.restTimer || 90}s
          </h3>
          <p className={styles["status-card-sub"]}>Default timer duration</p>
        </article>

        <article className={styles["status-card"]}>
          <span className={styles["status-card-label"]}>Auto-Save Engine</span>
          <h3 className={styles["status-card-value"]}>
            {preferences.autoSaveWorkouts ? "Active" : "Manual"}
          </h3>
          <p className={styles["status-card-sub"]}>Local storage synchronization</p>
        </article>
      </section>

      {/* SECTION 3: CONFIGURATION CARDS */}
      <section className={styles["settings-grid"]}>
        {settingsSections.map((section) => (
          <article key={section.title} className={styles["settings-card"]}>
            <div className={styles["settings-card-header"]}>
              <h3>{section.title}</h3>
            </div>

            <div className={styles["settings-list"]}>
              {section.fields.map((field) => (
                <div
                  key={field.label}
                  className={`${styles["settings-row"]} ${
                    isDemoUser ? styles["readonly-row"] : ""
                  }`}
                  onClick={() => {
                    if (isDemoUser && field.type !== "info") {
                      triggerDemoNotice();
                    }
                  }}
                >
                  <span className={styles["settings-row-label"]}>{field.label}</span>

                  {field.type === "checkbox" ? (
                    <label
                      className={styles["toggle-switch-wrap"]}
                      style={
                        field.readOnly
                          ? { opacity: 0.6, cursor: "not-allowed" }
                          : { cursor: "pointer" }
                      }
                      onClick={(e) => {
                        if (isDemoUser) {
                          e.preventDefault();
                          triggerDemoNotice();
                        }
                      }}
                    >
                      <input
                        type="checkbox"
                        aria-label={field.label}
                        checked={Boolean(preferences[field.key])}
                        disabled={field.readOnly}
                        style={{ display: "none" }}
                        onChange={(event) =>
                          !field.readOnly &&
                          handlePreferenceChange(
                            field.key,
                            event.target.checked
                          )
                        }
                      />
                      <div
                        className={`${styles["toggle-switch"]} ${
                          preferences[field.key] ? styles["active"] : ""
                        }`}
                      >
                        <div className={styles["toggle-knob"]} />
                      </div>
                      <span className={styles["toggle-label"]}>
                        {preferences[field.key] ? "Enabled" : "Disabled"}
                      </span>
                    </label>
                  ) : field.type === "select" ? (
                    <select
                      className={styles["settings-select"]}
                      value={preferences[field.key] || field.options[0]}
                      disabled={field.readOnly}
                      style={
                        field.readOnly
                          ? { opacity: 0.65, cursor: "not-allowed" }
                          : undefined
                      }
                      onClick={(e) => {
                        if (isDemoUser) {
                          e.preventDefault();
                          triggerDemoNotice();
                        }
                      }}
                      onChange={(event) => {
                        if (field.readOnly) return;
                        const value =
                          field.key === "restTimer"
                            ? Number(event.target.value)
                            : event.target.value;

                        handlePreferenceChange(field.key, value);
                      }}
                      aria-label={field.label}
                    >
                      {field.options.map((option) => (
                        <option key={option} value={option}>
                          {field.formatOption
                            ? field.formatOption(option)
                            : option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <strong className={styles["settings-info-badge"]}>
                      {field.value}
                    </strong>
                  )}
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>

      {/* Notice Dialog for Demo Mode Restrictions */}
      <NoticeModal
        isOpen={notice.isOpen}
        title={notice.title}
        message={notice.message}
        eyebrow={notice.eyebrow}
        type={notice.type || "info"}
        isDemo={isDemoUser}
        onClose={() => setNotice({ ...notice, isOpen: false })}
      />
    </div>
  );
}

export default Settings;
