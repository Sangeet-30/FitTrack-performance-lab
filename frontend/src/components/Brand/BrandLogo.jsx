import styles from "./BrandLogo.module.css";

/**
 * Official FitTrack Pro Brand Logo Component
 * 
 * Supports:
 * - variant='full': Complete horizontal logo (//F symbol + FITTRACK wordmark + PRO badge)
 * - variant='symbol': Symbol-only logo (//F with dynamic red orbital arcs)
 * - mode='auto': Automatically adapts to html.dark / light theme
 * - mode='dark': Always dark theme version (for dark sidebar, dark panels)
 * - mode='light': Always light theme version (for white cards)
 */
export default function BrandLogo({
  variant = "full",
  mode = "auto",
  height = 32,
  className = "",
  alt = "FitTrack Pro",
}) {
  const isSymbol = variant === "symbol";

  if (mode === "dark") {
    const src = isSymbol ? "/fittrack-symbol-dark.svg" : "/fittrack-logo-dark.svg";
    return (
      <img
        src={src}
        alt={alt}
        height={height}
        className={`${styles.logo} ${className}`}
        style={{ height: typeof height === "number" ? `${height}px` : height, width: "auto" }}
      />
    );
  }

  if (mode === "light") {
    const src = isSymbol ? "/fittrack-symbol-light.svg" : "/fittrack-logo-light.svg";
    return (
      <img
        src={src}
        alt={alt}
        height={height}
        className={`${styles.logo} ${className}`}
        style={{ height: typeof height === "number" ? `${height}px` : height, width: "auto" }}
      />
    );
  }

  // mode='auto': responsive to html.dark class
  const darkSrc = isSymbol ? "/fittrack-symbol-dark.svg" : "/fittrack-logo-dark.svg";
  const lightSrc = isSymbol ? "/fittrack-symbol-light.svg" : "/fittrack-logo-light.svg";

  return (
    <span className={`${styles.logoWrapper} ${className}`}>
      <img
        src={darkSrc}
        alt={alt}
        height={height}
        className={`${styles.logo} ${styles.logoDark}`}
        style={{ height: typeof height === "number" ? `${height}px` : height, width: "auto" }}
      />
      <img
        src={lightSrc}
        alt={alt}
        height={height}
        className={`${styles.logo} ${styles.logoLight}`}
        style={{ height: typeof height === "number" ? `${height}px` : height, width: "auto" }}
      />
    </span>
  );
}
