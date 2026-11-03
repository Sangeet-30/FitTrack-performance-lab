export function cx(styleMaps, className = "") {
  if (!styleMaps && !className) return "";

  // If first argument is just a string: cx("foo bar")
  if (typeof styleMaps === "string" && !className) {
    return styleMaps;
  }

  // If first argument is an array of class name strings: cx(["foo", "bar"])
  if (Array.isArray(styleMaps) && !className) {
    return styleMaps
      .filter((item) => typeof item === "string" && item.trim())
      .join(" ");
  }

  // Standard usage: cx([styles, sharedStyles], "class1 class2")
  const styles = Array.isArray(styleMaps)
    ? Object.assign({}, ...styleMaps.filter((m) => m && typeof m === "object"))
    : (styleMaps && typeof styleMaps === "object" ? styleMaps : {});

  if (!className || typeof className !== "string") {
    return "";
  }

  return className
    .split(" ")
    .filter(Boolean)
    .map((name) => styles[name] || name)
    .join(" ");
}

if (typeof window !== "undefined") {
  window.cx = cx;
}

export default cx;
