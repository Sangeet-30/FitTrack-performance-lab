import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import styles from "./NoticeModal.module.css";
import sharedStyles from "../../Shared.module.css";
import { cx } from "../../utils/classNames.js";

function NoticeModal({
  isOpen,
  title = "Notice",
  message = "",
  confirmText,
  cancelText,
  onClose,
  onConfirm,
  isDemo,
  eyebrow,
  type,
}) {
  const navigate = useNavigate();
  const auth = useSelector((state) => state?.auth);
  const isAuthenticated = Boolean(auth?.isAuthenticated);
  const isDemoAccount = auth?.user?.email === "demo@fittrack.app" || auth?.user?.id === "demo-user";
  const isRealUser = isAuthenticated && !isDemoAccount;
  const demoMode = Boolean(auth?.demoMode) && (!isAuthenticated || isDemoAccount);
  const isDemoEffective = isRealUser ? false : (isDemo !== undefined ? Boolean(isDemo) : demoMode);
  const titleLower = (title || "").toLowerCase();

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAction = () => {
    onClose?.();
    if (onConfirm) {
      onConfirm();
    } else if (isDemoEffective) {
      navigate("/signup");
    }
  };

  const isSuccess =
    type === "success" ||
    titleLower.includes("logged") ||
    titleLower.includes("saved") ||
    titleLower.includes("success");

  const isDanger =
    type === "danger" ||
    titleLower.includes("delete") ||
    titleLower.includes("remove");

  // Determine eyebrow label
  let displayEyebrow = eyebrow;
  if (!displayEyebrow) {
    if (isDemoEffective) {
      displayEyebrow = "Read-Only Preview";
    } else if (isDanger) {
      displayEyebrow = "Delete Confirmation";
    } else if (titleLower.includes("session") || titleLower.includes("workout")) {
      displayEyebrow = "Session Recorded";
    } else if (titleLower.includes("readiness")) {
      displayEyebrow = "Performance Metric";
    } else if (titleLower.includes("saved") || titleLower.includes("profile")) {
      displayEyebrow = "Profile Updated";
    } else {
      displayEyebrow = "FitTrack Lab";
    }
  }

  return (
    <div
      className={styles.backdrop}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="notice-modal-title"
    >
      <div
        className={styles.modalCard}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Icon */}
        <div
          className={styles.iconWrapper}
          style={
            isDanger
              ? {
                  background: "rgba(239, 68, 68, 0.12)",
                  borderColor: "rgba(239, 68, 68, 0.35)",
                }
              : isSuccess
              ? {
                  background: "rgba(34, 197, 94, 0.12)",
                  borderColor: "rgba(34, 197, 94, 0.35)",
                }
              : undefined
          }
        >
          {isDanger ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={styles.icon}
              style={{ color: "#ef4444" }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={styles.icon}
              style={isSuccess ? { color: "#22c55e" } : undefined}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              {isSuccess ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              )}
            </svg>
          )}
        </div>

        {/* Text Content */}
        <div className={styles.content}>
          <p className={cx([sharedStyles], "eyebrow accent")}>{displayEyebrow}</p>
          <h3 id="notice-modal-title" className={styles.title}>
            {title}
          </h3>
          <p className={styles.message}>{message}</p>
        </div>

        {/* Action Buttons */}
        <div className={styles.actions}>
          {isDemoEffective ? (
            <>
              <button
                type="button"
                className={cx([sharedStyles], "primary-button")}
                onClick={handleAction}
              >
                {confirmText || "Create Free Account →"}
              </button>
              <button
                type="button"
                className={cx([sharedStyles], "secondary-button")}
                onClick={onClose}
              >
                {cancelText || "Continue Exploring"}
              </button>
            </>
          ) : onConfirm ? (
            <>
              <button
                type="button"
                className={cx([sharedStyles], "primary-button")}
                style={
                  isDanger
                    ? {
                        backgroundColor: "#dc2626",
                        borderColor: "#dc2626",
                        color: "#ffffff",
                      }
                    : undefined
                }
                onClick={handleAction}
              >
                {confirmText || (isDanger ? "Delete" : "Confirm")}
              </button>
              <button
                type="button"
                className={cx([sharedStyles], "secondary-button")}
                onClick={onClose}
              >
                {cancelText || "Cancel"}
              </button>
            </>
          ) : (
            <button
              type="button"
              className={cx([sharedStyles], "primary-button")}
              onClick={onClose}
            >
              {confirmText || cancelText || "Got it"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export { NoticeModal };
export default NoticeModal;

