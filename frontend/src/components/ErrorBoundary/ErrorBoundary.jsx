import { Component } from "react";
import styles from "./ErrorBoundary.module.css";
import sharedStyles from "../../Shared.module.css";
import { cx } from "../../utils/classNames.js";

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("FitTrack encountered a rendering error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleResetAuth = () => {
    try {
      localStorage.removeItem("fittrack_token");
      localStorage.removeItem("fittrack-auth-state");
      localStorage.removeItem("fittrack-user-profile");
      sessionStorage.clear();
    } catch {
      // ignore
    }
    window.location.href = "/login";
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <main className={cx([styles, sharedStyles], "auth-page error-page")}>
        <section
          className={cx([styles, sharedStyles], "auth-card error-card")}
          role="alert"
        >
          <p className={cx([styles, sharedStyles], "eyebrow accent")}>
            Something went wrong
          </p>
          <h1>FitTrack encountered an error.</h1>
          <p>
            The application ran into an unexpected display state. You can retry
            loading the page or sign out and reset your session.
          </p>
          {this.state.error && (
            <p
              style={{
                fontSize: "0.82rem",
                color: "#ef4444",
                background: "rgba(239, 68, 68, 0.1)",
                padding: "8px 12px",
                borderRadius: "8px",
                wordBreak: "break-word",
              }}
            >
              {this.state.error.message || String(this.state.error)}
            </p>
          )}
          <div className={cx([styles, sharedStyles], "error-actions")}>
            <button
              type="button"
              className={cx([styles, sharedStyles], "primary-button")}
              onClick={this.handleRetry}
            >
              Retry
            </button>
            <button
              type="button"
              className={cx([styles, sharedStyles], "secondary-button")}
              onClick={this.handleResetAuth}
            >
              Sign out & reset
            </button>
            <a
              className={cx([styles, sharedStyles], "ghost-button")}
              href="/"
            >
              Go home
            </a>
          </div>
        </section>
      </main>
    );
  }
}

export default ErrorBoundary;
