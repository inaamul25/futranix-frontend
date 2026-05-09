import { MoonStar, SunMedium } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

export default function ThemeToggle({ compact = false }) {
  const { isDark, toggleTheme } = useTheme();

  if (compact) {
    return (
      <button className="theme-toggle theme-toggle-compact" onClick={toggleTheme} aria-label="Toggle color theme">
        {isDark ? <MoonStar size={18} /> : <SunMedium size={18} />}
      </button>
    );
  }

  return (
    <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle color theme">
      <motion.span
        className="theme-toggle-thumb"
        animate={{ x: isDark ? 0 : 26 }}
        transition={{ duration: 0.24, ease: "easeInOut" }}
      >
        {isDark ? <MoonStar size={14} /> : <SunMedium size={14} />}
      </motion.span>
      <span className="theme-toggle-track">
        <MoonStar size={14} />
        <SunMedium size={14} />
      </span>
    </button>
  );
}
