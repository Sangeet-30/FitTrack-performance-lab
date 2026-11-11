import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import styles from "./AuthSplit.module.css";
import { loginSuccess } from "../../features/auth/authSlice.js";
import { setProfile } from "../../features/user/userSlice.js";
import { signupUser } from "../../services/authService.js";
import PasswordInput from "../../components/PasswordInput/PasswordInput.jsx";
import BrandLogo from "../../components/Brand/BrandLogo.jsx";

const initialForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real-time password criteria
  const passwordCriteria = {
    length: form.password.length >= 8,
    upper: /[A-Z]/.test(form.password),
    lower: /[a-z]/.test(form.password),
    number: /[0-9]/.test(form.password),
    special: /[^A-Za-z0-9]/.test(form.password),
  };

  const isPasswordStrong = Object.values(passwordCriteria).every(Boolean);

  const validate = () => {
    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = "Full name is required.";
    }

    if (!form.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!form.password) {
      nextErrors.password = "Password is required.";
    } else if (!isPasswordStrong) {
      nextErrors.password = "Please fulfill all password requirements below.";
    }

    if (!form.confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your password.";
    } else if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = "Passwords do not match.";
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
      const user = await signupUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      const authenticatedUser = { ...user, demoMode: false };
      dispatch(loginSuccess(authenticatedUser));
      dispatch(setProfile(authenticatedUser));
      navigate("/dashboard");
    } catch (error) {
      setErrors({
        form: error.message || "Unable to create account. Please check your credentials and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.authPage}>
      {/* Left Performance Lab Panel (Split Screen - Image 2) */}
      <aside className={styles.leftPanel} aria-label="Brand performance panel">
        <div className={styles.leftHeader}>
          <Link to="/" className={styles.leftLogo} title="FitTrack Pro Home">
            <BrandLogo variant="full" mode="dark" height={34} />
          </Link>
          <span className={styles.leftLabBadge}>SYSTEM OVERVIEW</span>
        </div>

        <div className={styles.leftHero}>
          <p className={styles.leftEyebrow}>
            YOUR NEXT REP STARTS HERE
          </p>
          <h1 className={styles.leftTitle}>
            START<br />
            WITH<br />
            INTENT<span className={styles.titleDotAccent}>.</span>
          </h1>
          <p className={styles.leftSubtitle}>
            Track your training. Build better habits.<br />
            Turn effort into progress.
          </p>

          {/* Weekly Progress Bar Widget */}
          <div className={styles.widgetCard}>
            <div className={styles.widgetHeader}>
              <span className={styles.widgetLabel}>WEEKLY PROGRESS</span>
              <div>
                <span className={styles.widgetStatWhite}>+12%</span>
                <span className={styles.widgetStatSub}>VS LAST WEEK</span>
              </div>
            </div>

            <div className={styles.barChartGrid}>
              {/* Stepped progress bars Mon - Sun */}
              <div className={styles.barCol}>
                <div className={styles.barTrack}>
                  <div className={styles.barFillRed} style={{ height: "24%" }} />
                </div>
                <span className={styles.barDay}>MON</span>
              </div>
              <div className={styles.barCol}>
                <div className={styles.barTrack}>
                  <div className={styles.barFillRed} style={{ height: "40%" }} />
                </div>
                <span className={styles.barDay}>TUE</span>
              </div>
              <div className={styles.barCol}>
                <div className={styles.barTrack}>
                  <div className={styles.barFillRed} style={{ height: "48%" }} />
                </div>
                <span className={styles.barDay}>WED</span>
              </div>
              <div className={styles.barCol}>
                <div className={styles.barTrack}>
                  <div className={styles.barFillRed} style={{ height: "64%" }} />
                </div>
                <span className={styles.barDay}>THU</span>
              </div>
              <div className={styles.barCol}>
                <div className={styles.barTrack}>
                  <div className={styles.barFillRed} style={{ height: "78%" }} />
                </div>
                <span className={styles.barDay}>FRI</span>
              </div>
              <div className={styles.barCol}>
                <div className={styles.barTrack}>
                  <div className={styles.barFillRed} style={{ height: "96%" }} />
                </div>
                <span className={styles.barDay}>SAT</span>
              </div>
              <div className={styles.barCol}>
                <div className={styles.barTrack}>
                  <div className={styles.barFillRed} style={{ height: "82%" }} />
                </div>
                <span className={styles.barDay}>SUN</span>
              </div>
            </div>

            {/* Triplet Stats: 7 Workouts, +12% Volume, 3 New PRs */}
            <div className={styles.statsRow}>
              <div className={styles.statItem}>
                <strong className={styles.statNum}>7</strong>
                <span className={styles.statLabel}>WORKOUTS</span>
              </div>
              <div className={styles.statItem}>
                <strong className={styles.statNum}>+12%</strong>
                <span className={styles.statLabel}>VOLUME</span>
              </div>
              <div className={styles.statItem}>
                <strong className={styles.statNum}>3</strong>
                <span className={styles.statLabel}>NEW PRS</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.leftFooter}>
          <span>DISCIPLINE CREATES OPTIONS.</span>
          <span>FITTRACK</span>
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
          <Link to="/" className={styles.mobileBrandBlock} title="FitTrack Pro Home">
            <BrandLogo variant="full" mode="auto" height={28} />
          </Link>
        </div>

        <div className={styles.formWrapper}>
          <div className={styles.formHeader}>
            <p className={styles.formEyebrow}>CREATE ACCOUNT</p>
            <h2 className={styles.formTitle}>
              Build your training system<span className={styles.formTitleDot}>.</span>
            </h2>
          </div>

          <form className={styles.authForm} onSubmit={handleSubmit} noValidate>
            {errors.form && (
              <div className={styles.errorMessage} role="alert">
                {errors.form}
              </div>
            )}

            <div className={styles.inputGroup}>
              <label htmlFor="signup-name" className={styles.inputLabel}>
                Full name
              </label>
              <input
                id="signup-name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="Alex Rivera"
                className={styles.textInput}
                autoComplete="name"
                aria-invalid={Boolean(errors.name)}
              />
              {errors.name && <span className={styles.fieldError}>{errors.name}</span>}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="signup-email" className={styles.inputLabel}>
                Email
              </label>
              <input
                id="signup-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={styles.textInput}
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
              />
              {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="signup-password" className={styles.inputLabel}>
                Password
              </label>
              <PasswordInput
                id="signup-password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Create a password"
                className={styles.passwordInput}
                error={Boolean(errors.password)}
              />
              <span className={styles.passwordHelper}>8+ characters</span>
              {errors.password && <span className={styles.fieldError}>{errors.password}</span>}

              {/* Password criteria chips */}
              {form.password.length > 0 && (
                <div className="grid grid-cols-2 gap-1.5 mt-1 text-[11px]">
                  <span className={passwordCriteria.length ? "text-emerald-500 font-medium" : "text-zinc-500"}>
                    {passwordCriteria.length ? "✓" : "○"} 8+ chars
                  </span>
                  <span className={passwordCriteria.upper ? "text-emerald-500 font-medium" : "text-zinc-500"}>
                    {passwordCriteria.upper ? "✓" : "○"} 1 uppercase
                  </span>
                  <span className={passwordCriteria.lower ? "text-emerald-500 font-medium" : "text-zinc-500"}>
                    {passwordCriteria.lower ? "✓" : "○"} 1 lowercase
                  </span>
                  <span className={passwordCriteria.number ? "text-emerald-500 font-medium" : "text-zinc-500"}>
                    {passwordCriteria.number ? "✓" : "○"} 1 number
                  </span>
                  <span className={passwordCriteria.special ? "text-emerald-500 font-medium col-span-2" : "text-zinc-500 col-span-2"}>
                    {passwordCriteria.special ? "✓" : "○"} 1 special symbol (!@#$%^&*)
                  </span>
                </div>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="signup-confirm-password" className={styles.inputLabel}>
                Confirm password
              </label>
              <PasswordInput
                id="signup-confirm-password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                className={styles.passwordInput}
                error={Boolean(errors.confirmPassword)}
              />
              {errors.confirmPassword && (
                <span className={styles.fieldError}>{errors.confirmPassword}</span>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={styles.submitBtn}
            >
              {isSubmitting ? "Creating account…" : "Create account →"}
            </button>

            <p className={styles.switchText}>
              Already training?
              <Link to="/login" className={styles.switchLink}>
                Sign in
              </Link>
            </p>
          </form>
        </div>

        {/* Empty spacer to align with split footer */}
        <div style={{ height: "20px" }} />
      </main>
    </div>
  );
}

export default Signup;
