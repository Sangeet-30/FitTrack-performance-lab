import { useState } from "react";
import styles from "./Landing.module.css";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { loginSuccess, logout } from "../features/auth/authSlice.js";
import { clearProfile, setProfile } from "../features/user/userSlice.js";
import { logoutUser, startDemoOverviewSession } from "../services/authService.js";
import ThemeToggle from "../components/ThemeToggle/ThemeToggle.jsx";
import NoticeModal from "../components/NoticeModal/NoticeModal.jsx";
import BrandLogo from "../components/Brand/BrandLogo.jsx";

function Landing() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const [isStartingDemo, setIsStartingDemo] = useState(false);
  const [notice, setNotice] = useState({ isOpen: false, title: "", message: "", type: "info" });

  const handleExploreDemo = async () => {
    try {
      setIsStartingDemo(true);
      const demoUser = await startDemoOverviewSession();
      dispatch(loginSuccess(demoUser));
      dispatch(setProfile(demoUser));
      navigate("/dashboard");
    } catch (err) {
      setNotice({
        isOpen: true,
        title: "Demo Overview Unavailable",
        message: err?.message || "Could not initialize demo overview. Please verify that the backend server is running and accessible.",
        type: "error",
      });
    } finally {
      setIsStartingDemo(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.error(e);
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
  };

  return (
    <div className={styles.landingPage}>
      <div className={styles.landingContainer}>
        {/* Navigation Bar - Cleaned: No 'How it works', 'Features', or 'Pricing' */}
        <header className={styles.landingNav}>
          <Link to="/" className={styles.brandLogo} title="FitTrack Pro - Athletic Training Lab">
            <BrandLogo variant="full" mode="auto" height={34} />
          </Link>

          <div className={styles.navActions}>
            <ThemeToggle />
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className={styles.signInLink}>
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className={styles.signOutBtn}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={styles.signInLink}>
                  Sign in
                </Link>
                <Link to="/signup" className={styles.startFreeBtn}>
                  Start free &rarr;
                </Link>
              </>
            )}
          </div>
        </header>

        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroLeft}>
            <p className={styles.heroEyebrow}>
              TRAIN &nbsp;/&nbsp; MEASURE &nbsp;/&nbsp; IMPROVE &nbsp;/&nbsp; REPEAT
            </p>
            <h1 className={styles.heroTitle}>
              BUILD A BODY<br />
              OF WORK<span className={styles.titleDot} />
            </h1>
            <p className={styles.heroSubtitle}>
              Structured training, clear progress and the consistency to keep going.
              FitTrack turns your effort into measurable results.
            </p>
            <div className={styles.heroCtaRow}>
              {isAuthenticated ? (
                <button
                  type="button"
                  className={styles.primaryCta}
                  onClick={() => navigate("/dashboard")}
                >
                  Launch Dashboard &rarr;
                </button>
              ) : (
                <>
                  <Link to="/signup" className={styles.primaryCta}>
                    Start free &rarr;
                  </Link>
                  <button
                    type="button"
                    className={styles.secondaryCta}
                    onClick={handleExploreDemo}
                    disabled={isStartingDemo}
                  >
                    {isStartingDemo ? "Opening Demo…" : "Explore the system"}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Hero Right - Interactive Floating HUD Showcase with Right Accent Rail */}
          <div className={styles.heroRight}>
            <div className={styles.hudCardsArea}>
              <div className={styles.mockupGrid}>
                {/* Card 1: RECOVERY Gauge */}
                <div className={styles.hudCard}>
                  <div className={styles.cardHeader}>
                    <span className={styles.cardTitle}>RECOVERY</span>
                    <span className={styles.cardTag}>TODAY •••</span>
                  </div>
                  <div className={styles.recoveryGaugeWrap}>
                    <div className={styles.gaugeCircle}>
                      <svg className={styles.gaugeSvg} width="104" height="104" viewBox="0 0 104 104">
                        <circle
                          cx="52"
                          cy="52"
                          r="42"
                          fill="none"
                          className={styles.gaugeBgCircle}
                          strokeWidth="7"
                        />
                        <circle
                          cx="52"
                          cy="52"
                          r="42"
                          fill="none"
                          stroke="#dc2626"
                          strokeWidth="7"
                          strokeDasharray="264"
                          strokeDashoffset="65"
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className={styles.gaugeScore}>78</span>
                      <span className={styles.gaugeStatus}>GOOD</span>
                    </div>
                  </div>
                  <div className={styles.recoveryMetrics}>
                    <div className={styles.metricItem}>
                      <span className={styles.metricLabel}>HRV</span>
                      <span className={styles.metricValue}>
                        62 <span className={styles.trendGreen}>&uarr;</span>
                      </span>
                    </div>
                    <div className={styles.metricItem}>
                      <span className={styles.metricLabel}>RESTING HR</span>
                      <span className={styles.metricValue}>
                        48 <span className={styles.trendGreen}>&darr;</span>
                      </span>
                    </div>
                    <div className={styles.metricItem}>
                      <span className={styles.metricLabel}>SLEEP</span>
                      <span className={styles.metricValue}>
                        7h 24m <span className={styles.trendGreen}>&uarr;</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card 2: TRAINING CALENDAR */}
                <div className={styles.hudCard}>
                  <div className={styles.cardHeader}>
                    <span className={styles.cardTitle}>TRAINING CALENDAR</span>
                    <span className={styles.cardTag}>APR &lang; &rang;</span>
                  </div>
                  <div className={styles.calDaysHeader}>
                    <span>M</span>
                    <span>T</span>
                    <span>W</span>
                    <span>T</span>
                    <span>F</span>
                    <span>S</span>
                    <span>S</span>
                  </div>
                  {/* 4 Weeks of Calendar Dots */}
                  <div className={styles.calGrid}>
                    {/* Row 1 */}
                    <span className={styles.calDotActive} />
                    <span className={styles.calDot} />
                    <span className={styles.calDot} />
                    <span className={styles.calDotActive} />
                    <span className={styles.calDot} />
                    <span className={styles.calDot} />
                    <span className={styles.calDot} />
                    {/* Row 2 */}
                    <span className={styles.calDot} />
                    <span className={styles.calDot} />
                    <span className={styles.calDotActive} />
                    <span className={styles.calDot} />
                    <span className={styles.calDotActive} />
                    <span className={styles.calDot} />
                    <span className={styles.calDot} />
                    {/* Row 3 */}
                    <span className={styles.calDot} />
                    <span className={styles.calDot} />
                    <span className={styles.calDot} />
                    <span className={styles.calDotActive} />
                    <span className={styles.calDot} />
                    <span className={styles.calDot} />
                    <span className={styles.calDotToday} />
                    {/* Row 4 */}
                    <span className={styles.calDot} />
                    <span className={styles.calDot} />
                    <span className={styles.calDot} />
                    <span className={styles.calDot} />
                    <span className={styles.calDot} />
                    <span className={styles.calDot} />
                    <span className={styles.calDot} />
                  </div>
                  <div className={styles.calLegend}>
                    <span>
                      <span className={styles.legendDot} style={{ background: "#dc2626" }} />
                      Workout
                    </span>
                    <span>
                      <span className={`${styles.legendDot} ${styles.legendRestDot}`} />
                      Rest
                    </span>
                    <span>
                      <span
                        className={styles.legendDot}
                        style={{ border: "1.5px solid #dc2626", background: "transparent" }}
                      />
                      Today
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 3: WEEKLY VOLUME (Bottom Wide Card) */}
              <div className={styles.volumeCard}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardTitle}>WEEKLY VOLUME</span>
                  <span className={styles.cardTag}>LAST 8 WEEKS •••</span>
                </div>
                <div className={styles.volumeStatBlock}>
                  <div>
                    <span className={styles.volumeBigNum}>12,420</span>
                    <span className={styles.volumeUnit}>TOTAL KG</span>
                  </div>
                  <span className={styles.volumeBadge}>+28% VS PREVIOUS 8 WEEKS</span>
                </div>
                {/* Dynamic SVG Sparkline Graph */}
                <div className={styles.volumeSvgWrap}>
                  <svg width="100%" height="90" viewBox="0 0 500 90" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="volumeGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#dc2626" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {/* Shaded Area */}
                    <path
                      d="M 10 75 Q 80 72 150 68 T 290 52 T 400 35 T 490 20 L 490 90 L 10 90 Z"
                      fill="url(#volumeGlow)"
                    />
                    {/* Glowing Trendline */}
                    <path
                      d="M 10 75 Q 80 72 150 68 T 290 52 T 400 35 T 490 20"
                      fill="none"
                      stroke="#dc2626"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    {/* Data Points */}
                    <circle cx="10" cy="75" r="4" fill="#dc2626" />
                    <circle cx="80" cy="72" r="4" fill="#dc2626" />
                    <circle cx="150" cy="68" r="4" fill="#dc2626" />
                    <circle cx="220" cy="62" r="4" fill="#dc2626" />
                    <circle cx="290" cy="52" r="4" fill="#dc2626" />
                    <circle cx="360" cy="42" r="4" fill="#dc2626" />
                    <circle cx="430" cy="30" r="4" fill="#dc2626" />
                    <circle cx="490" cy="20" r="5" fill="#dc2626" stroke="#fff" strokeWidth="2" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Dedicated Right Side Rail - Fixed within hero section without overflow */}
            <aside className={styles.sideRail} aria-hidden="true">
              <div className={styles.hudSideIndicator}>
                <span>01</span>
                <span>02</span>
                <span>03</span>
              </div>

              <div className={styles.railTrack}>
                <span className={styles.railLine} />
                <span className={styles.railDot} />
                <span className={styles.railLine} />
              </div>

              <div className={styles.disciplineBadge}>
                <span className={styles.disciplineRedAccent}>//</span>
                <span>DISCIPLINE</span>
                <span>CREATES</span>
                <span>OPTIONS</span>
              </div>
            </aside>
          </div>
        </section>

        {/* 3-Column System Section */}
        <section className={styles.systemSection}>
          <div className={styles.systemHeader}>
            <h2 className={styles.systemTitle}>THE SYSTEM FOR CONSISTENT TRAINING</h2>
            <span className={styles.systemSubtitle}>SIMPLE HABITS / REAL PROGRESS</span>
          </div>
          <div className={styles.stepsGrid}>
            <div className={styles.stepCard}>
              <div className={styles.stepHeader}>
                <span className={styles.stepNum}>01</span>
                <span className={styles.stepDash} />
                <h3 className={styles.stepHeading}>PLAN WITH PURPOSE</h3>
              </div>
              <p className={styles.stepDescription}>
                Structured programs that adapt to your personal goals and schedule.
              </p>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepHeader}>
                <span className={styles.stepNum}>02</span>
                <span className={styles.stepDash} />
                <h3 className={styles.stepHeading}>TRACK WHAT MATTERS</h3>
              </div>
              <p className={styles.stepDescription}>
                Log your sets, volume, and recovery in real time with zero friction.
              </p>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepHeader}>
                <span className={styles.stepNum}>03</span>
                <span className={styles.stepDash} />
                <h3 className={styles.stepHeading}>BUILD LONG-TERM RESULTS</h3>
              </div>
              <p className={styles.stepDescription}>
                Small, consistent actions compound into measurable athletic progress.
              </p>
            </div>
          </div>
        </section>

        {/* Landing Page Footer */}
        <footer className={styles.landingFooter}>
          <div className={styles.footerContent}>
            <div className={styles.footerMainInfo}>
              <span className={styles.footerCopy}>
                &copy; 2026 <strong>FitTrack Pro</strong> • Built &amp; Designed by <strong>Sangeet</strong>
              </span>
              <span className={styles.footerSep}>•</span>
              <span className={styles.footerStack}>
                <span className={styles.stackTag}>React</span>
                <span className={styles.stackDot}>+</span>
                <span className={styles.stackTag}>Node.js</span>
                <span className={styles.stackDot}>+</span>
                <span className={styles.stackTag}>Express</span>
                <span className={styles.stackDot}>+</span>
                <span className={styles.stackTag}>MongoDB</span>
              </span>
            </div>
            <div className={styles.footerLinks}>
              <a
                href="https://github.com/Sangeet-30"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                title="GitHub Profile"
                aria-label="Sangeet GitHub Profile"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <span>GitHub</span>
              </a>
              <a
                href="https://www.linkedin.com/in/sangeet-a62094255/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                title="LinkedIn Profile"
                aria-label="Sangeet LinkedIn Profile"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                <span>LinkedIn</span>
              </a>
            </div>
          </div>
        </footer>
      </div>

      <NoticeModal
        isOpen={notice.isOpen}
        onClose={() => setNotice((prev) => ({ ...prev, isOpen: false }))}
        title={notice.title}
        message={notice.message}
        type={notice.type}
      />
    </div>
  );
}

export default Landing;
