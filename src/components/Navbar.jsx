import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useDarkMode } from "../hooks/useDarkMode.js";
import { useNotifications } from "../hooks/useNotifications.js";
import { getUserProfiles } from "../hooks/useUserProfile.js";
import NotificationPopover from "./home/NotificationPopover.jsx";
import SwitchAccountModal from "./SwitchAccountModal.jsx";

const AVATAR_COLORS = ["bg-emerald-500", "bg-sky-500", "bg-amber-500", "bg-fuchsia-500", "bg-indigo-500", "bg-violet-500"];

function colorFor(uid) {
  let sum = 0;
  for (let i = 0; i < uid.length; i++) sum += uid.charCodeAt(i);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

function DarkModeToggle({ isDark, onToggle }) {
  return (
    <button
      onClick={() => onToggle(!isDark)}
      className="relative w-14 h-7 rounded-full bg-gradient-to-r from-sky-300 to-sky-400 dark:from-indigo-900 dark:to-slate-800 transition-colors duration-500 overflow-hidden shrink-0"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span className={`absolute top-1.5 left-2 w-0.5 h-0.5 rounded-full bg-white transition-opacity duration-500 ${isDark ? "opacity-80" : "opacity-0"}`} />
      <span className={`absolute top-3 left-4 w-0.5 h-0.5 rounded-full bg-white transition-opacity duration-500 ${isDark ? "opacity-60" : "opacity-0"}`} />
      <span className={`absolute top-2 left-6 w-1 h-1 rounded-full bg-white transition-opacity duration-500 ${isDark ? "opacity-70" : "opacity-0"}`} />

      <div
        className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center text-[11px] transition-transform duration-500 ease-in-out ${
          isDark ? "translate-x-7 rotate-[360deg]" : "translate-x-0 rotate-0"
        }`}
      >
        {isDark ? "🌙" : "☀️"}
      </div>
    </button>
  );
}

export default function Navbar() {
  const { user, logOut } = useAuth();
  const [isDark, setIsDark] = useDarkMode();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [switchModalOpen, setSwitchModalOpen] = useState(false);
  
  const [isAdmin, setIsAdmin] = useState(false);
  
  const profileMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const { notifications, markAsRead, markAllAsRead } = useNotifications(user?.uid);
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!user?.uid) {
      setIsAdmin(false);
      return;
    }
    getUserProfiles([user.uid]).then((results) => {
      if (results && results[0]) {
        setIsAdmin(!!results[0].isAdmin);
      }
    });
  }, [user?.uid]);

  function isActive(path) {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  }

  useEffect(() => {
    function onClickOutside(e) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) setProfileMenuOpen(false);
    }
    if (profileMenuOpen) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [profileMenuOpen]);

  async function handleLogout() {
    setProfileMenuOpen(false);
    await logOut();
  }

  const displayName = user?.email?.split("@")[0] || "Member";
  const initial = displayName.charAt(0).toUpperCase();
  const avatarColor = user?.uid ? colorFor(user.uid) : "bg-emerald-500";

  const NAV_LINKS = [
    { to: "/home", label: "Home" },
    { to: "/groups", label: "My Groups" },
    { to: "/discover", label: "Discover" },
  ];

  return (
    <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 relative z-30">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/home" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-sm group-hover:scale-110 group-hover:rotate-6 transition-transform">
              F
            </div>
            <span className="font-semibold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              FlowGroup
            </span>
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative text-sm font-medium pb-1 transition-colors ${
                  isActive(link.to) ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400 hover:text-emerald-600"
                }`}
              >
                {link.label}
                <span
                  className={`absolute left-0 -bottom-0.5 h-0.5 bg-emerald-500 rounded-full transition-all duration-300 ${
                    isActive(link.to) ? "w-full" : "w-0"
                  }`}
                />
              </Link>
            ))}

            <DarkModeToggle isDark={isDark} onToggle={setIsDark} />

            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Notifications"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-slate-950 shadow-md ring-2 ring-white dark:ring-slate-900 animate-pulse">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              <NotificationPopover
                isOpen={notifOpen}
                notifications={notifications}
                onClose={() => setNotifOpen(false)}
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={markAllAsRead}
              />
            </div>

            {/* Profile Avatar Dropdown */}
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setProfileMenuOpen((o) => !o)}
                className={`w-9 h-9 rounded-full ${avatarColor} text-white text-sm font-semibold flex items-center justify-center hover:ring-2 hover:ring-emerald-400 transition-all`}
              >
                {initial}
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 top-11 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl shadow-lg py-2 z-50">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{displayName}</p>
                    <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setProfileMenuOpen(false)}
                    className="block w-full text-left px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    👤 View Profile
                  </Link>
                  
                  <button
                    onClick={() => setSwitchModalOpen(true)}
                    className="w-full text-left px-3 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                  >
                    🔄 Switch Account
                  </button>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setProfileMenuOpen(false)}
                      className="block w-full text-left px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      🛡️ Admin Dashboard
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="md:hidden text-slate-600 dark:text-slate-300 p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="pb-4 flex flex-col gap-3">
            <div className="flex items-center gap-3 py-2">
              <div className={`w-9 h-9 rounded-full ${avatarColor} text-white text-sm font-semibold flex items-center justify-center shrink-0`}>
                {initial}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{displayName}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>

            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`text-sm font-medium flex items-center gap-2 ${
                  isActive(link.to) ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400 hover:text-emerald-600"
                }`}
              >
                {isActive(link.to) && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                {link.label}
              </Link>
            ))}

            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMenuOpen(false)}
                className="text-sm font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-2"
              >
                🛡️ Admin Dashboard
              </Link>
            )}

            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-slate-500 dark:text-slate-400">Dark mode</span>
              <DarkModeToggle isDark={isDark} onToggle={setIsDark} />
            </div>

            <button onClick={handleLogout} className="text-left text-sm font-medium text-red-500">
              Log Out
            </button>
          </div>
        </div>
      </div>

      <SwitchAccountModal isOpen={switchModalOpen} onClose={() => setSwitchModalOpen(false)} />
    </nav>
  );
}