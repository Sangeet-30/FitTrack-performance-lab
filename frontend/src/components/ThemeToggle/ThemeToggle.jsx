import { useTheme } from "../../utils/theme.js";

function ThemeToggle({ className = "", iconOnly = false }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "day" : "night"} theme`}
      title={`Switch to ${isDark ? "day" : "night"} theme`}
      className={`relative inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 border cursor-pointer select-none ${
        isDark
          ? "bg-zinc-900 border-zinc-700/80 text-zinc-200 hover:border-red-500 hover:text-white"
          : "bg-white border-zinc-300 text-zinc-800 hover:border-red-600 hover:text-black shadow-sm"
      } ${className}`}
    >
      <span className="flex items-center justify-center w-5 h-5 rounded-full transition-transform duration-200 pointer-events-none">
        {isDark ? (
          <span className="text-yellow-400 text-sm">🌙</span>
        ) : (
          <span className="text-amber-500 text-sm">☀️</span>
        )}
      </span>
      {!iconOnly && <span className="pointer-events-none">{isDark ? "Night" : "Day"}</span>}
    </button>
  );
}

export { ThemeToggle };
export default ThemeToggle;

