import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import styles from "./AuthSplit.module.css";
import { loginSuccess } from "../../features/auth/authSlice.js";
import { setProfile } from "../../features/user/userSlice.js";
import { loginUser } from "../../services/authService.js";
import PasswordInput from "../../components/PasswordInput/PasswordInput.jsx";
import NoticeModal from "../../components/NoticeModal/NoticeModal.jsx";

const initialForm = {
  email: "",
  password: "",
};

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState({ isOpen: false, title: "", message: "" });

  const validate = () => {
    const nextErrors = {};

    if (!form.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!form.password) {
      nextErrors.password = "Password is required.";
    } else if (form.password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
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
    setIsSubmitting(true);
    setErrors({});
    try {
      const user = await loginUser({ email: form.email.trim(), password: form.password });
      const authenticatedUser = { ...user, demoMode: false };
      dispatch(loginSuccess(authenticatedUser));
      dispatch(setProfile(authenticatedUser));
      navigate("/dashboard");
    } catch (error) {
      setErrors({ form: error.message || "Unable to sign in. Check your credentials and try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setNotice({
      isOpen: true,
      title: "Password Recovery Notice",
      message: "Self-service email recovery is currently disabled in this deployment as no outbound email relay is configured. Please contact your administrator or sign up with a new account.",
    });
  };

  return (
    <div className={styles.authPage}>
      {/* Left Performance Lab Panel (Split Screen - Image 1) */}
      <aside className={styles.leftPanel} aria-label="Brand performance panel">
        <div className={styles.leftHeader}>
          <Link to="/" className={styles.leftLogo}>
            FIT<span className={styles.leftLogoRed}>TRACK</span>
            <small style={{ fontSize: "0.6rem", verticalAlign: "top", marginLeft: "2px" }}>&trade;</small>
          </Link>
          <span className={styles.leftLabBadge}>ATHLETIC PERFORMANCE LAB</span>
        </div>

        <div className={styles.leftHero}>
          <p className={styles.leftEyebrow}>
            <span className={styles.leftDot} /> PROGRESS LIVES HERE
          </p>
          <h1 className={styles.leftTitle}>
            SHOW UP.<br />
            <span className={styles.titleHighlight}>KEEP GOING.</span>
          </h1>
          <p className={styles.leftSubtitle}>
            Build better habits. Track real progress.<br />
            A stronger you, one day at a time.
          </p>

          {/* Weekly Consistency Bar Widget */}
          <div className={styles.widgetCard}>
            <div className={styles.widgetHeader}>
              <span className={styles.widgetLabel}>WEEKLY CONSISTENCY</span>
              <span className={styles.widgetStat}>6 / 7 DAYS</span>
            </div>

            <div className={styles.barChartGrid}>
              {/* Mon - Tall */}
              <div className={styles.barCol}>
                <div className={styles.barTrack}>
                  <div className={styles.barFillRed} style={{ height: "92%" }} />
                </div>
                <span className={styles.barDay}>MON</span>
              </div>
              {/* Tue - Med */}
              <div className={styles.barCol}>
                <div className={styles.barTrack}>
                  <div className={styles.barFillRed} style={{ height: "55%" }} />
                </div>
                <span className={styles.barDay}>TUE</span>
              </div>
              {/* Wed - Tall */}
              <div className={styles.barCol}>
                <div className={styles.barTrack}>
                  <div className={styles.barFillRed} style={{ height: "88%" }} />
                </div>
                <span className={styles.barDay}>WED</span>
              </div>
              {/* Thu - Med */}
              <div className={styles.barCol}>
                <div className={styles.barTrack}>
                  <div className={styles.barFillRed} style={{ height: "58%" }} />
                </div>
                <span className={styles.barDay}>THU</span>
              </div>
              {/* Fri - Tall */}
              <div className={styles.barCol}>
                <div className={styles.barTrack}>
                  <div className={styles.barFillRed} style={{ height: "95%" }} />
                </div>
                <span className={styles.barDay}>FRI</span>
              </div>
              {/* Sat - Med */}
              <div className={styles.barCol}>
                <div className={styles.barTrack}>
                  <div className={styles.barFillRed} style={{ height: "52%" }} />
                </div>
                <span className={styles.barDay}>SAT</span>
              </div>
              {/* Sun - Rest Gray */}
              <div className={styles.barCol}>
                <div className={styles.barTrack}>
                  <div className={styles.barFillGray} style={{ height: "42%" }} />
                </div>
                <span className={styles.barDay}>SUN</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.leftFooter}>
          <span>DISCIPLINE TODAY. A STRONGER TOMORROW.</span>
          <span>FITTRACK&trade;</span>
        </div>
      </aside>

      {/* Right Form Panel */}
      <main className={styles.rightPanel}>
        <div className={styles.rightTopNav}>
          <Link to="/" className={styles.backHomeLink} title="Back to home">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span>Back to home</span>
          </Link>

          {/* Compact logo on Mobile (<768px) */}
          <Link to="/" className={styles.mobileBrandBlock}>
            <span className={styles.mobileBrandSlashes}>//</span>
            <span>FITTRACK</span>
          </Link>
        </div>

        <div className={styles.formWrapper}>
          <div className={styles.formHeader}>
            <p className={styles.formEyebrow}>WELCOME BACK</p>
            <h2 className={styles.formTitle}>
              Pick up where you left off<span className={styles.formTitleDot}>.</span>
            </h2>
          </div>

          <form className={styles.authForm} onSubmit={handleSubmit} noValidate>
            {errors.form && (
              <div className={styles.errorMessage} role="alert">
                {errors.form}
              </div>
            )}

            <div className={styles.inputGroup}>
              <label htmlFor="login-email" className={styles.inputLabel}>
                Email
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@domain.com"
                className={styles.textInput}
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
              />
              {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="login-password" className={styles.inputLabel}>
                Password
              </label>
              <PasswordInput
                id="login-password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className={styles.passwordInput}
                error={Boolean(errors.password)}
              />
              {errors.password && <span className={styles.fieldError}>{errors.password}</span>}

              <div className={styles.forgotPasswordRow}>
                <button
                  type="button"
                  className={styles.forgotPasswordLink}
                  onClick={handleForgotPassword}
                >
                  Forgot password?
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={styles.submitBtn}
            >
              {isSubmitting ? "Signing in…" : "Sign in"}
            </button>

            <div className={styles.dividerRow}>
              <div className={styles.dividerLine} />
              <span className={styles.dividerText}>OR</span>
              <div className={styles.dividerLine} />
            </div>

            <p className={styles.switchText}>
              New here?
              <Link to="/signup" className={styles.switchLink}>
                Create an account
              </Link>
            </p>
          </form>
        </div>

        {/* Empty spacer to align with split footer */}
        <div style={{ height: "20px" }} />
      </main>

      <NoticeModal
        isOpen={notice.isOpen}
        title={notice.title}
        message={notice.message}
        onClose={() => setNotice({ isOpen: false, title: "", message: "" })}
      />
    </div>
  );
}

export default Login;
