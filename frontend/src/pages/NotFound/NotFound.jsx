import { Link } from "react-router-dom";
import styles from "./NotFound.module.css";
import sharedStyles from "../../Shared.module.css";
import { cx } from "../../utils/classNames.js";

function NotFound() {
  return (
    <main className={cx([styles, sharedStyles], "auth-page not-found-page")}>
      <section
        className={cx([styles, sharedStyles], "auth-card not-found-card")}
      >
        <p className={cx([styles, sharedStyles], "eyebrow accent")}>404</p>
        <h1>Page not found</h1>
        <p>
          The page you requested does not exist or may have moved elsewhere.
        </p>
        <div className={cx([styles, sharedStyles], "not-found-actions")}>
          <Link className={cx([styles, sharedStyles], "primary-button")} to="/">
            Go home
          </Link>
          <Link
            className={cx([styles, sharedStyles], "secondary-button")}
            to="/dashboard"
          >
            Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}

export default NotFound;
