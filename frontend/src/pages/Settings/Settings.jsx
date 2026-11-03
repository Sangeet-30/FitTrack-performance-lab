import styles from "./Settings.module.css";
import sharedStyles from "../../Shared.module.css";
import { cx } from "../../utils/classNames.js";
import { useDispatch, useSelector } from "react-redux";
import { updatePreferences, setProfile } from "../../features/user/userSlice.js";
import { apiRequest } from "../../services/api.js";

function Settings() {
  const dispatch = useDispatch();
  const preferences = useSelector((state) => state.user.preferences);
  const user = useSelector((state) => state.user.profile);
  const authUser = useSelector((state) => state.auth.user);
  const demoMode = useSelector((state) => state.auth.demoMode);

  const handlePreferenceChange = (key, value) => {
    dispatch(updatePreferences({ [key]: value }));
    // If unit changed, sync to backend profile too
    if (key === "units" && !demoMode) {
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

  const planName = user?.tier || authUser?.tier || "Free Athlete Plan";

  const settingsSections = [
    {
      title: "Account",
      fields: [
        {
          label: "Email notifications",
          key: "notifications",
          type: "checkbox",
          readOnly: false,
        },
        {
          label: "Membership tier",
          value: planName,
          type: "info",
          readOnly: true,
        },
        {
          label: "Language",
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
          readOnly: false,
        },
      ],
    },
    {
      title: "Training",
      fields: [
        {
          label: "Measurement units",
          key: "units",
          type: "select",
          options: ["kg", "lb"],
          readOnly: false,
        },
        {
          label: "Auto-save workouts",
          key: "autoSaveWorkouts",
          type: "checkbox",
          readOnly: false,
        },
        {
          label: "Rest timer",
          key: "restTimer",
          type: "select",
          options: [30, 60, 90, 120, 180],
          formatOption: (value) => `${value} seconds`,
          readOnly: false,
        },
        {
          label: "Workout reminders",
          key: "workoutReminders",
          type: "select",
          options: ["Off", "Daily", "Weekdays", "Weekly"],
          readOnly: false,
        },
      ],
    },
    {
      title: "Privacy & Data",
      fields: [
        {
          label: "Profile visibility",
          key: "profileVisibility",
          type: "select",
          options: ["Private", "Public"],
          readOnly: false,
        },
        {
          label: "Share progress with coach",
          key: "shareProgress",
          type: "checkbox",
          readOnly: false,
        },
        {
          label: "Two-factor authentication",
          key: "twoFactorAuth",
          type: "checkbox",
          readOnly: false,
        },
      ],
    },
  ];

  return (
    <div className={cx([styles, sharedStyles], "settings-page")}>
      <section
        className={cx([styles, sharedStyles], "page-header-block card-panel")}
      >
        <div>
          <p className={cx([styles, sharedStyles], "eyebrow accent")}>
            Settings
          </p>
          <h2>Preferences &amp; Account</h2>
        </div>
      </section>

      <section className={cx([styles, sharedStyles], "settings-grid")}>
        {settingsSections.map((section) => (
          <article
            key={section.title}
            className={cx([styles, sharedStyles], "card-panel settings-card")}
          >
            <div className={cx([styles, sharedStyles], "panel-header")}>
              <h3>{section.title}</h3>
            </div>

            <div className={cx([styles, sharedStyles], "settings-list")}>
              {section.fields.map((field) => (
                <div
                  key={field.label}
                  className={cx([styles, sharedStyles], "settings-row")}
                >
                  <span>{field.label}</span>

                  {field.type === "checkbox" ? (
                    <label
                      className={cx([styles, sharedStyles], "settings-control")}
                      style={field.readOnly ? { opacity: 0.6, cursor: "not-allowed" } : { cursor: "pointer" }}
                    >
                      <input
                        type="checkbox"
                        aria-label={field.label}
                        checked={Boolean(preferences[field.key])}
                        disabled={field.readOnly}
                        onChange={(event) =>
                          !field.readOnly &&
                          handlePreferenceChange(
                            field.key,
                            event.target.checked,
                          )
                        }
                      />
                      <span>
                        {preferences[field.key] ? "Enabled" : "Disabled"}
                      </span>
                    </label>
                  ) : field.type === "select" ? (
                    <select
                      className={cx([styles, sharedStyles], "settings-control")}
                      value={preferences[field.key] || field.options[0]}
                      disabled={field.readOnly}
                      style={field.readOnly ? { opacity: 0.65, cursor: "not-allowed" } : { cursor: "pointer" }}
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
                    <strong
                      className={cx([styles, sharedStyles], "settings-info")}
                    >
                      {field.value}
                    </strong>
                  )}
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

export default Settings;
