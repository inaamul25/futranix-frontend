import {
  ArrowRight,
  Bell,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  MessageSquare,
  ShieldQuestion,
  Sparkles,
  UserCircle2
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import orgLogoDark from "../assets/org-logo.png";
import orgLogoLight from "../assets/org-logo-white-mode.png";
import { useToast } from "../context/ToastContext";
import SearchBar from "./ui/SearchBar";
import ThemeToggle from "./ui/ThemeToggle";

export default function Layout({ children }) {
  const { auth, logout } = useAuth();
  const { isDark } = useTheme();
  const toast = useToast();
  const navigate = useNavigate();
  const roles = auth?.roles || [];
  const location = useLocation();
  const isProfileRoute = location.pathname === "/profile";
  const showUtilityBar = location.pathname !== "/auth" && !isProfileRoute;
  const isAuthRoute = location.pathname === "/auth";
  const brandLogo = isDark ? orgLogoDark : orgLogoLight;
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    if (!profileMenuOpen) return undefined;

    const handlePointerDown = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [profileMenuOpen]);

  const handleLogout = () => {
    logout();
    setProfileMenuOpen(false);
    toast.info("You have been logged out.");
    navigate("/auth");
  };

  const handleProfileNavigation = () => {
    setProfileMenuOpen(false);
    navigate("/profile");
  };

  const notifyPlaceholder = (label) => {
    setProfileMenuOpen(false);
    toast.info(`${label} is coming soon.`);
  };

  const avatar = auth?.profileImageUrl;
  const avatarInitial = auth?.fullName?.trim()?.[0] || "U";

  const profileActions = auth ? (
    <div className="subbar-actions">
      <ThemeToggle compact />
      <div className="profile-popover-wrap" ref={profileMenuRef}>
        <button
          type="button"
          className={`profile-avatar-button ${profileMenuOpen ? "profile-avatar-button-open" : ""}`}
          onClick={() => setProfileMenuOpen((current) => !current)}
          aria-haspopup="menu"
          aria-expanded={profileMenuOpen}
          aria-label="Open profile menu"
        >
          {avatar ? (
            <img src={avatar} alt={auth.fullName} className="profile-avatar-image" />
          ) : (
            <span className="profile-avatar-fallback">{avatarInitial}</span>
          )}
        </button>

        {profileMenuOpen && (
          <div className="profile-popover" role="menu">
            <button type="button" className="profile-popover-header" onClick={handleProfileNavigation}>
              <div className="profile-popover-avatar">
                {avatar ? (
                  <img src={avatar} alt={auth.fullName} className="profile-avatar-image" />
                ) : (
                  <span className="profile-avatar-fallback">{avatarInitial}</span>
                )}
              </div>
              <div className="profile-popover-copy">
                <strong>{auth.fullName.toLowerCase()}</strong>
                <span>{auth.email}</span>
              </div>
            </button>

            <div className="profile-popover-links">
              <button type="button" className="profile-popover-link" onClick={handleProfileNavigation}>
                <UserCircle2 size={18} />
                <span>Profile</span>
              </button>
              <button type="button" className="profile-popover-link" onClick={() => notifyPlaceholder("User Feedback")}>
                <MessageSquare size={18} />
                <span>User Feedback</span>
              </button>
              <button type="button" className="profile-popover-link" onClick={() => notifyPlaceholder("Mentor Connect")}>
                <ShieldQuestion size={18} />
                <span>Mentor Connect</span>
              </button>
              <button type="button" className="profile-popover-link" onClick={() => notifyPlaceholder("Feedback")}>
                <MessageCircle size={18} />
                <span>Feedback</span>
              </button>
              <button type="button" className="profile-popover-link profile-popover-link-danger" onClick={handleLogout}>
                <LogOut size={18} />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  ) : null;

  return (
    <div className="shell">
      <header className="topbar">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className="brand-wrap"
        >
          <Link to="/" className="wordmark">
            <span className="wordmark-mark" aria-hidden="true">
              <img src={brandLogo} alt="" />
            </span>
            <span className="wordmark-copy">
              <strong>Futranix Academy</strong>
              <span>AI-powered modular learning</span>
            </span>
          </Link>
        </motion.div>

        <div className="actions">
          {isAuthRoute ? (
            <ThemeToggle />
          ) : isProfileRoute ? (
            profileActions
          ) : (
            <Link to={auth ? "/dashboard" : "/auth"} className="primary-button header-signin">
              <span className="header-signin-copy">
                <span className="header-signin-label">{auth ? "Workspace" : "Start learning"}</span>
                <strong>{auth ? "Open your dashboard" : "Sign in / Register"}</strong>
              </span>
              <span className="header-signin-arrow" aria-hidden="true">
                <ArrowRight size={18} />
              </span>
            </Link>
          )}
        </div>
      </header>

      {showUtilityBar && (
        <div className="subbar-wrap">
          <div className="subbar">
            <nav className="nav">
              <NavLink to="/">
                <GraduationCap size={16} />
                <span>Courses</span>
              </NavLink>
              <NavLink to="/paths">
                <Sparkles size={16} />
                <span>Paths</span>
              </NavLink>
              {auth && (
                <NavLink to="/dashboard">
                  <LayoutDashboard size={16} />
                  <span>Dashboard</span>
                </NavLink>
              )}
              {(roles.includes("CREATOR") || roles.includes("ADMIN")) && (
                <NavLink to="/creator">
                  <Bell size={16} />
                  <span>Studio</span>
                </NavLink>
              )}
            </nav>

            <div className="subbar-search">
              <SearchBar />
            </div>

            {profileActions}
          </div>
        </div>
      )}

      <div className="noise-layer" />
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <main>{children}</main>
    </div>
  );
}
