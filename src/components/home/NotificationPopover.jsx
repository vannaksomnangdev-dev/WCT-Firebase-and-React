import React from "react";
import { useNavigate } from "react-router-dom";

export default function NotificationPopover({ isOpen, notifications = [], onClose, onMarkAsRead, onMarkAllAsRead }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  function handleNotificationClick(item) {
    if (!item.read && onMarkAsRead) {
      onMarkAsRead(item.id);
    }
    onClose();
    if (item.postId) {
      navigate(`/home`);
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="absolute right-0 mt-3 w-80 bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Notifications</h3>
          {unreadCount > 0 && (
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && onMarkAllAsRead && (
          <button
            onClick={onMarkAllAsRead}
            className="text-[10px] text-slate-400 hover:text-emerald-400 transition-colors underline"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="flex flex-col gap-1.5 max-h-80 overflow-y-auto custom-scrollbar pr-1">
        {notifications.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6 italic">No notifications yet.</p>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => handleNotificationClick(item)}
              className={`flex items-start gap-3 p-2.5 rounded-2xl transition-colors cursor-pointer group ${
                !item.read ? "bg-slate-800/60 border border-slate-700/50" : "hover:bg-slate-800/40"
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-emerald-500/30">
                {item.type === "like" ? "❤️" : item.type === "comment" ? "💬" : "🔔"}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className={`text-xs transition-colors leading-relaxed ${!item.read ? "text-slate-100 font-medium" : "text-slate-300"}`}>
                  {item.message || "You have a new activity update."}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-slate-500">
                    {item.createdAt?.seconds ? new Date(item.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                  </span>
                  {!item.read && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}