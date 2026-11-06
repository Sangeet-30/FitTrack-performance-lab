import { useState, useEffect, useMemo, useRef, lazy, Suspense } from "react";
import { NavLink, Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../features/auth/authSlice.js";
import { clearProfile } from "../../features/user/userSlice.js";
import { logoutUser } from "../../services/authService.js";
import ThemeToggle from "../ThemeToggle/ThemeToggle.jsx";
import styles from "./AppShell.module.css";
import sharedStyles from "../../Shared.module.css";
import { cx } from "../../utils/classNames.js";

const QuickLogModal = lazy(() => import("../QuickLogModal/QuickLogModal.jsx"));
const UniversalSearchModal = lazy(() => import("../UniversalSearchModal/UniversalSearchModal.jsx"));

const navItems = [
  {
    to: "/dashboard",
    label: "Today",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    to: "/logs",
    label: "Logs",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    to: "/workouts",
    label: "Workouts",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m6.5 6.5 11 11" />
        <path d="m21 21-1-1a2 2 0 0 0-2.8 0l-1.4 1.4a2 2 0 0 1-2.8 0L9.7 19.1a2 2 0 0 1 0-2.8l1.4-1.4a2 2 0 0 0 0-2.8L10 11" />
        <path d="m3 3 1 1a2 2 0 0 0 2.8 0l1.4-1.4a2 2 0 0 1 2.8 0l4.3 4.3a2 2 0 0 1 0 2.8l-1.4 1.4a2 2 0 0 0 0 2.8l1.1 1.1" />
      </svg>
    ),
  },
  {
    to: "/progress",
    label: "Progress",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    to: "/goals",
    label: "Goals",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
  },
  {
    to: "/nutrition",
    label: "Nutrition",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" />
        <path d="M10 2c1 .5 2 2 2 5" />
      </svg>
    ),
  },
];

function AppShell() {
  const demoMode = useSelector((state) => state.auth.demoMode);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const authUser = useSelector((state) => state.auth.user);
  const user = useSelector((state) => state.user.profile);

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      if (typeof window !== "undefined" && window.innerWidth <= 768) {
        return false;
      }
      return localStorage.getItem("fittrack_sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });

  const menuRef = useRef(null);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("fittrack_sidebar_collapsed", String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = useMemo(() => {
    if (typeof user?.name === "string" && user.name.trim().length > 0) {
      return user.name.trim();
    }
    if (typeof authUser?.name === "string" && authUser.name.trim().length > 0) {
      return authUser.name.trim();
    }
    return "Athlete";
  }, [user?.name, authUser?.name]);

  const avatarInitial = useMemo(() => {
    return displayName.charAt(0).toUpperCase() || "A";
  }, [displayName]);

  const firstName = useMemo(() => {
    return displayName.split(" ")[0];
  }, [displayName]);

  // Formatted date: "TUESDAY, APR 22, 2025"
  const formattedDate = useMemo(() => {
    try {
      const d = new Date();
      return d.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric",
      }).toUpperCase();
    } catch {
      return "TUESDAY, APR 22, 2025";
    }
  }, []);

  // Time-based greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Sign-out request failed", error);
    }
    dispatch(logout());
    dispatch(clearProfile());
    try {
      localStorage.removeItem("fittrack_token");
      localStorage.removeItem("fittrack-auth-state");
      localStorage.removeItem("fittrack-user-profile");
      sessionStorage.clear();
    } catch {
      // ignore
    }
    navigate("/login", { replace: true });
  };

  // Listen for open-log event from any page or child button
  useEffect(() => {
    const handleOpen = () => setIsLogModalOpen(true);
    window.addEventListener("fittrack:open-log", handleOpen);
    return () => window.removeEventListener("fittrack:open-log", handleOpen);
  }, []);

  const handleOpenLogModal = () => {
    setIsLogModalOpen(true);
  };

  const pageMeta = useMemo(() => {
    const path = location.pathname;
    if (path === "/dashboard" || path === "/") {
      return {
        title: `${greeting}, ${firstName}.`,
        subtitle: "Show up today. Progress compounds.",
      };
    }
    if (path.startsWith("/workouts/") && path !== "/workouts") {
      return {
        title: "Workout Routine",
        subtitle: "Review structure, target muscles, and coaching protocol.",
      };
    }
    if (path === "/workouts" || path === "/workout") {
      return {
        title: "Workouts",
        subtitle: "Structured muscle-group routines and training programs.",
      };
    }
    if (path === "/exercises") {
      return {
        title: "Movement Library",
        subtitle: "Exercise catalog, biomechanics, and form guides.",
      };
    }
    if (path === "/logs") {
      return {
        title: "Training Logs",
        subtitle: "Session history, volume tracking, and workout records.",
      };
    }
    if (path === "/progress") {
      return {
        title: "Progress & Biometrics",
        subtitle: "Body composition checkpoints and weight tracking.",
      };
    }
    if (path === "/nutrition") {
      return {
        title: "Nutrition & Fuel",
        subtitle: "Daily caloric targets, macros, and hydration tracking.",
      };
    }
    if (path === "/goals") {
      return {
        title: "Milestones & Goals",
        subtitle: "Performance benchmarks and target roadmaps.",
      };
    }
    if (path === "/profile") {
      return {
        title: "Athlete Profile",
        subtitle: "Personal biometrics, split setup, and training cadence.",
      };
    }
    if (path === "/settings") {
      return {
        title: "Settings & Preferences",
        subtitle: "System preferences, units of measure, and account controls.",
      };
    }
    return {
      title: path.replace("/", "").charAt(0).toUpperCase() + path.replace("/", "").slice(1),
      subtitle: "FitTrack Performance Lab.",
    };
  }, [location.pathname, greeting, firstName]);

  return (
    <div
      className={cx(
        [styles, sharedStyles],
        `app-shell ${isCollapsed ? "sidebar-collapsed" : ""}`
      )}
    >
      <a
        className={cx([styles, sharedStyles], "skip-link")}
        href="#main-content"
      >
        Skip to main content
      </a>

      {/* Sidebar - Matching Photo 2 */}
      <aside
        className={cx(
          [styles, sharedStyles],
          `sidebar ${isCollapsed ? "collapsed" : ""}`
        )}
      >
        <div className={styles["brand-header"]}>
          <Link to="/dashboard" className={styles["brand-link"]} title="FitTrack Dashboard">
            <span className={styles["brand-slashes"]}>//</span>
            {!isCollapsed && <span className={styles["brand-text"]}>FITTRACK</span>}
          </Link>
          <button
            type="button"
            className={styles["collapse-toggle-btn"]}
            onClick={toggleSidebar}
            title={isCollapsed ? "Expand sidebar" : "Minimize sidebar (icons only)"}
            aria-label={isCollapsed ? "Expand sidebar" : "Minimize sidebar"}
          >
            {isCollapsed ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="13 17 18 12 13 7" />
                <polyline points="6 17 11 12 6 7" />
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="11 17 6 12 11 7" />
                <polyline points="18 17 13 12 18 7" />
              </svg>
            )}
          </button>
        </div>

        <nav
          className={cx([styles, sharedStyles], "sidebar-nav")}
          aria-label="Main navigation"
        >
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `${styles["nav-link"]} ${isActive ? styles["active"] : ""}`
              }
              title={isCollapsed ? item.label : undefined}
              end={item.to === "/dashboard"}
            >
              <span className={styles["nav-icon"]}>{item.icon}</span>
              {!isCollapsed && <span className={styles["nav-label"]}>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer with Theme Toggle & Profile Card */}
        <div className={styles["sidebar-footer"]} ref={menuRef}>
          <div className={styles["sidebar-theme-wrap"]}>
            <ThemeToggle className={styles["sidebar-theme-btn"]} iconOnly={isCollapsed} />
          </div>

          {profileMenuOpen && (
            <div className={styles["profile-popover"]}>
              <div className={styles["popover-header"]}>
                <div className={styles["popover-user-badge"]}>{avatarInitial}</div>
                <div className={styles["popover-user-info"]}>
                  <strong>{displayName}</strong>
                  <small>{user?.email || authUser?.email || "athlete@fittrack.com"}</small>
                </div>
              </div>
              <div className={styles["popover-divider"]} />
              <Link
                to="/profile"
                className={styles["popover-item"]}
                onClick={() => setProfileMenuOpen(false)}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span>Profile Details</span>
              </Link>
              <Link
                to="/settings"
                className={styles["popover-item"]}
                onClick={() => setProfileMenuOpen(false)}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                <span>Settings &amp; Preferences</span>
              </Link>
              <div className={styles["popover-divider"]} />
              <button
                type="button"
                className={styles["popover-logout"]}
                onClick={handleLogout}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span>Sign out</span>
              </button>
            </div>
          )}

          <button
            type="button"
            className={styles["profile-card"]}
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            aria-expanded={profileMenuOpen}
            aria-label="User menu"
            title={displayName}
          >
            <div className={styles["profile-avatar"]}>{avatarInitial}</div>
            {!isCollapsed && (
              <>
                <div className={styles["profile-details"]}>
                  <span className={styles["profile-name"]}>{displayName}</span>
                  <span className={styles["profile-plan"]}>
                    {demoMode ? "Demo Guest" : (user?.fitnessLevel || authUser?.fitnessLevel || "Athlete")}
                  </span>
                </div>
                <span className={styles["profile-chevron"]}>›</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <main
        id="main-content"
        className={cx([styles, sharedStyles], "main-panel")}
      >
        {demoMode && (
          <aside
            aria-label="Demo mode notice"
            className={styles["demo-banner"]}
          >
            <div className={styles["demo-banner-content"]}>
              <span className={styles["demo-pulse"]} />
              <span>
                <strong>Live Demo Overview:</strong> Exploring sample workouts, metrics &amp; goals. Edits are disabled in preview mode.
              </span>
            </div>
            <Link
              to="/signup"
              className={styles["demo-banner-link"]}
            >
              Create Free Account &rarr;
            </Link>
          </aside>
        )}

        {/* Topbar Header - Matching Photo 2 */}
        <header className={styles["dashboard-topbar"]}>
          <div className={styles["topbar-left"]}>
            <span className={styles["topbar-date"]}>{formattedDate}</span>
            <h1 className={styles["topbar-heading"]}>
              {pageMeta.title}
            </h1>
            <p className={styles["topbar-subtitle"]}>
              {pageMeta.subtitle}
            </p>
          </div>

          <div className={styles["topbar-right"]}>
            <div className={styles["topbar-actions-row"]}>
              <button
                type="button"
                className={styles["icon-btn"]}
                title="Search workouts, exercises, and pages"
                aria-label="Search"
                onClick={() => setIsSearchOpen(true)}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>

              <div className="relative">
                <button
                  type="button"
                  className={styles["icon-btn"]}
                  title="Notifications"
                  aria-label="Notifications"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  <span className={styles["notification-dot"]} />
                </button>

                {showNotifications && (
                  <div className={styles["notifications-popover"]}>
                    <div className={styles["notifications-title"]}>Recent Updates</div>
                    <div className={styles["notification-row"]}>
                      <span className={styles["notification-bullet"]} />
                      <div>
                        <p className={styles["notification-text"]}>FitTrack Performance Lab is active.</p>
                        <small className={styles["notification-time"]}>System Online</small>
                      </div>
                    </div>
                    <div className={styles["notification-row"]}>
                      <span className={styles["notification-bullet"]} />
                      <div>
                        <p className={styles["notification-text"]}>Tap &apos;+ LOG SESSION&apos; to record your workouts.</p>
                        <small className={styles["notification-time"]}>Ready to train</small>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                className={styles["log-session-btn"]}
                onClick={handleOpenLogModal}
              >
                <span>+</span> LOG SESSION
              </button>
            </div>

            <p className={styles["quote-text"]}>
              &ldquo;A little progress each day adds up to big results.&rdquo;
            </p>
          </div>
        </header>

        <div className={cx([styles, sharedStyles], "page-shell")}>
          <Outlet />
        </div>

        <footer className={styles["dashboard-footer"]}>
          <p>© 2026 FitTrack Pro Performance Lab. High-Performance Athletic Training.</p>
        </footer>
      </main>

      {/* Universal Modals across all authenticated views (loaded on-demand) */}
      {isLogModalOpen && (
        <Suspense fallback={null}>
          <QuickLogModal
            isOpen={isLogModalOpen}
            onClose={() => setIsLogModalOpen(false)}
          />
        </Suspense>
      )}

      {isSearchOpen && (
        <Suspense fallback={null}>
          <UniversalSearchModal
            isOpen={isSearchOpen}
            onClose={() => setIsSearchOpen(false)}
          />
        </Suspense>
      )}
    </div>
  );
}

export default AppShell;
