import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./NoticeModal.module.css";
import sharedStyles from "../../Shared.module.css";
import { cx } from "../../utils/classNames.js";

function NoticeModal({
  isOpen,
  title = "Live Demo Overview",
  message = "This is a read-only live preview for exploring features. Create a free account to customize your data!",
  confirmText = "Create Free Account",
  cancelText = "Continue Exploring",
  onClose,
  onConfirm,
}) {
  const navigate = useNavigate();

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAction = () => {
    onClose();
    if (onConfirm) {
      onConfirm();
    } else {
      navigate("/signup");
    }
  };

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
        <div className={styles.iconWrapper}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={styles.icon}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        {/* Text Content */}
        <div className={styles.content}>
          <p className={cx([sharedStyles], "eyebrow accent")}>Read-Only Preview</p>
          <h3 id="notice-modal-title" className={styles.title}>
            {title}
          </h3>
          <p className={styles.message}>{message}</p>
        </div>

        {/* Action Buttons */}
        <div className={styles.actions}>
          <button
            type="button"
            className={cx([sharedStyles], "primary-button")}
            onClick={handleAction}
          >
            {confirmText} &rarr;
          </button>
          <button
            type="button"
            className={cx([sharedStyles], "secondary-button")}
            onClick={onClose}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}

export { NoticeModal };
export default NoticeModal;

