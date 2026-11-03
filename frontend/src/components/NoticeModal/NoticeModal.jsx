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
  const demoMode = useSelector((state) => state?.auth?.demoMode);
  const isDemoEffective = isDemo !== undefined ? Boolean(isDemo) : Boolean(demoMode);

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

  const titleLower = (title || "").toLowerCase();
  const isSuccess =
    type === "success" ||
    titleLower.includes("logged") ||
    titleLower.includes("saved") ||
    titleLower.includes("success");

  // Determine eyebrow label
  let displayEyebrow = eyebrow;
  if (!displayEyebrow) {
    if (isDemoEffective) {
      displayEyebrow = "Read-Only Preview";
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
            isSuccess
              ? {
                  background: "rgba(34, 197, 94, 0.12)",
                  borderColor: "rgba(34, 197, 94, 0.35)",
                }
              : undefined
          }
        >
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
                onClick={handleAction}
              >
                {confirmText || "Confirm"}
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

