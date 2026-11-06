import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./UniversalSearchModal.module.css";
import { workouts } from "../../data/workouts.js";

const APP_PAGES = [
  {
    id: "page-dashboard",
    title: "Today / Dashboard",
    category: "Navigation",
    path: "/dashboard",
    subtitle: "Daily readiness, weekly training target, and recent activity",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    id: "page-logs",
    title: "Session Logs & Records",
    category: "Navigation",
    path: "/logs",
    subtitle: "View, filter, edit, and track all your logged workout sessions",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    id: "page-workouts",
    title: "Training / Workouts",
    category: "Navigation",
    path: "/workouts",
    subtitle: "Explore workout library, splits, and training regimens",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <path d="M6 9V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v5" />
      </svg>
    ),
  },
  {
    id: "page-progress",
    title: "Progress & Analytics",
    category: "Navigation",
    path: "/progress",
    subtitle: "Volume trends, personal bests, and workout history",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    id: "page-goals",
    title: "Goals & Targets",
    category: "Navigation",
    path: "/goals",
    subtitle: "Weekly consistency, bodyweight targets, and volume goals",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
  },
  {
    id: "page-nutrition",
    title: "Nutrition & Fuel",
    category: "Navigation",
    path: "/nutrition",
    subtitle: "Calorie balance, macros, water intake, and meal logs",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
      </svg>
    ),
  },
  {
    id: "page-profile",
    title: "Athlete Profile",
    category: "Settings",
    path: "/profile",
    subtitle: "Personal biometrics, fitness level, and profile completeness",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    id: "page-settings",
    title: "Settings & Preferences",
    category: "Settings",
    path: "/settings",
    subtitle: "Units, theme preference, workout split, and notifications",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

export default function UniversalSearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Extract exercise list from workouts
  const exerciseItems = useMemo(() => {
    if (!isOpen) return [];
    const list = [];
    const seen = new Set();
    workouts.forEach((w) => {
      (w.exercisesList || []).forEach((ex) => {
        if (!seen.has(ex.name)) {
          seen.add(ex.name);
          list.push({
            id: `ex-${ex.name.toLowerCase().replace(/\s+/g, "-")}`,
            title: ex.name,
            category: "Exercise",
            subtitle: `Used in ${w.name} (${ex.sets} sets × ${ex.reps} reps)`,
            path: "/workouts",
            badge: w.category,
          });
        }
      });
    });
    return list;
  }, [isOpen]);

  // Pre-built workouts
  const workoutItems = useMemo(() => {
    if (!isOpen) return [];
    return workouts.map((w) => ({
      id: `w-${w.id}`,
      title: w.name,
      category: "Workout Plan",
      subtitle: `${w.duration} min · ${w.difficulty} · ${(w.muscleGroups || []).join(", ")}`,
      path: "/workouts",
      badge: w.category,
    }));
  }, [isOpen]);

  // Filtered results
  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // Default / Quick shortcuts
      return {
        pages: APP_PAGES,
        workouts: workoutItems.slice(0, 4),
        exercises: [],
      };
    }

    const pages = APP_PAGES.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q) ||
        p.path.toLowerCase().includes(q)
    );

    const matchedWorkouts = workoutItems.filter(
      (w) =>
        w.title.toLowerCase().includes(q) ||
        w.subtitle.toLowerCase().includes(q) ||
        w.badge.toLowerCase().includes(q)
    );

    const exercises = exerciseItems.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.subtitle.toLowerCase().includes(q)
    );

    return {
      pages,
      workouts: matchedWorkouts,
      exercises,
    };
  }, [query, workoutItems, exerciseItems]);

  if (!isOpen) return null;

  const totalMatches =
    filteredResults.pages.length +
    filteredResults.workouts.length +
    filteredResults.exercises.length;

  const handleSelect = (path) => {
    onClose();
    navigate(path);
  };

  const handleClear = () => {
    setQuery("");
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <div
      className={styles["search-backdrop"]}
      onClick={onClose}
      data-testid="search-modal-backdrop"
    >
      <div
        className={styles["search-dialog"]}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Universal Search"
      >
        <div className={styles["search-input-wrap"]}>
          <span className={styles["search-icon"]} aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            ref={inputRef}
            type="text"
            className={styles["search-input"]}
            placeholder="Search pages, workouts, or exercises..."
            aria-label="Search pages, workouts, or exercises"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            data-testid="universal-search-input"
          />
          {query ? (
            <button
              type="button"
              className={styles["clear-btn"]}
              onClick={handleClear}
              title="Clear search input"
              aria-label="Clear search input"
            >
              ✕
            </button>
          ) : (
            <span className={styles["esc-badge"]}>ESC</span>
          )}
        </div>

        <div className={styles["search-results"]}>
          {totalMatches === 0 ? (
            <div className={styles["no-results"]}>
              No results found for &ldquo;{query}&rdquo;.
            </div>
          ) : (
            <>
              {filteredResults.pages.length > 0 && (
                <div>
                  <div className={styles["section-label"]}>Pages & Navigation</div>
                  {filteredResults.pages.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className={styles["result-item"]}
                      onClick={() => handleSelect(p.path)}
                    >
                      <div className={styles["result-left"]}>
                        <div className={styles["result-icon-box"]}>{p.icon}</div>
                        <div className={styles["result-texts"]}>
                          <span className={styles["result-title"]}>{p.title}</span>
                          <span className={styles["result-sub"]}>{p.subtitle}</span>
                        </div>
                      </div>
                      <span className={styles["result-badge"]}>Page</span>
                    </button>
                  ))}
                </div>
              )}

              {filteredResults.workouts.length > 0 && (
                <div>
                  <div className={styles["section-label"]}>Workouts & Regimens</div>
                  {filteredResults.workouts.map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      className={styles["result-item"]}
                      onClick={() => handleSelect(w.path)}
                    >
                      <div className={styles["result-left"]}>
                        <div className={styles["result-icon-box"]}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="5 3 19 12 5 21 5 3" />
                          </svg>
                        </div>
                        <div className={styles["result-texts"]}>
                          <span className={styles["result-title"]}>{w.title}</span>
                          <span className={styles["result-sub"]}>{w.subtitle}</span>
                        </div>
                      </div>
                      <span className={styles["result-badge"]}>{w.badge}</span>
                    </button>
                  ))}
                </div>
              )}

              {filteredResults.exercises.length > 0 && (
                <div>
                  <div className={styles["section-label"]}>Exercises</div>
                  {filteredResults.exercises.map((e) => (
                    <button
                      key={e.id}
                      type="button"
                      className={styles["result-item"]}
                      onClick={() => handleSelect(e.path)}
                    >
                      <div className={styles["result-left"]}>
                        <div className={styles["result-icon-box"]}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="6" y1="12" x2="18" y2="12" />
                            <circle cx="6" cy="12" r="3" />
                            <circle cx="18" cy="12" r="3" />
                          </svg>
                        </div>
                        <div className={styles["result-texts"]}>
                          <span className={styles["result-title"]}>{e.title}</span>
                          <span className={styles["result-sub"]}>{e.subtitle}</span>
                        </div>
                      </div>
                      <span className={styles["result-badge"]}>Exercise</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

