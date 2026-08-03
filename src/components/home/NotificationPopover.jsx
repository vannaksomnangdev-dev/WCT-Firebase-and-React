import React from "react";
import { useNavigate } from "react-router-dom";

export default function NotificationPopover({ isOpen, notifications = [], onClose }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  function handleNotificationClick(item) {
    onClose();
    // If the notification is tied to a post, navigate to home or post detail view
    if (item.postId) {
      navigate(`/home`); // Or navigate to a dedicated post route if you have one
    }
  }

  return (
    <div className="absolute right-0 mt-3 w-80 bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Notifications</h3>
        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
          {notifications.length} total
        </span>
      </div>

      <div className="flex flex-col gap-1.5 max-h-80 overflow-y-auto custom-scrollbar pr-1">
        {notifications.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6 italic">No notifications yet.</p>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => handleNotificationClick(item)}
              className="flex items-start gap-3 p-2.5 rounded-2xl hover:bg-slate-800/70 transition-colors cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-emerald-500/30">
                {item.type === "like" ? "❤️" : item.type === "comment" ? "💬" : "🔔"}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs text-slate-200 group-hover:text-emerald-400 transition-colors leading-relaxed">
                  {item.message || "You have a new activity update."}
                </p>
                <span className="text-[10px] text-slate-500">
                  {item.createdAt?.seconds ? new Date(item.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}