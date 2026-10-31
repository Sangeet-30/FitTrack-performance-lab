import { useState } from "react";
import styles from "./Landing.module.css";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { loginSuccess, logout } from "../features/auth/authSlice.js";
import { clearProfile, setProfile } from "../features/user/userSlice.js";
import { logoutUser, startDemoOverviewSession } from "../services/authService.js";
import ThemeToggle from "../components/ThemeToggle/ThemeToggle.jsx";

function Landing() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const [isStartingDemo, setIsStartingDemo] = useState(false);

  const handleExploreDemo = async () => {
    try {
      setIsStartingDemo(true);
      const demoUser = await startDemoOverviewSession();
      dispatch(loginSuccess(demoUser));
      dispatch(setProfile(demoUser));
      navigate("/dashboard");
    } catch (err) {
      console.error("Failed to start live demo overview:", err);
      navigate("/dashboard");
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
          <Link to="/" className={styles.brandLogo}>
            <span className={styles.brandSlashes}>//</span>
            <span>FITTRACK</span>
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
      </div>
    </div>
  );
}

export default Landing;
