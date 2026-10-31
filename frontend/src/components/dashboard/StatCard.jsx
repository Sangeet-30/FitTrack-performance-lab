import styles from "./StatCard.module.css";
import sharedStyles from "../../Shared.module.css";
import { cx } from "../../utils/classNames.js";
function StatCard({ label, value, subtext, accent = "blue" }) {
  return (
    <div className={cx([styles, sharedStyles], "stat-card")}>
      <div className={cx([styles, sharedStyles], `stat-icon stat-icon-${accent}`)}>
        {label ? label.charAt(0) : "•"}
      </div>
      <div className={cx([styles, sharedStyles], "stat-copy")}>
        <span>{label}</span>
        <strong>{value}</strong>
        {subtext && <small>{subtext}</small>}
      </div>
    </div>
  );
}

export default StatCard;
