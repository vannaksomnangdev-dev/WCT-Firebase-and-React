import React from "react";
import { Link } from "react-router-dom";

export default function ActiveDock({ profiles = [], groups = [] }) {
  return (
    <aside className="w-72 hidden lg:flex flex-col gap-6 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto pb-8 pr-2 custom-scrollbar">
      {/* Active Community Members */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Community Pulse</h3>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {profiles.length === 0 ? (
            <p className="text-xs text-slate-500 italic px-1">No other members online</p>
          ) : (
            profiles.slice(0, 6).map((profile, index) => (
              <div
                key={profile.uid || index}
                className="flex items-center justify-between p-2 rounded-2xl hover:bg-slate-800/60 transition-all duration-200 group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {profile.photoURL ? (
                      <img
                        src={profile.photoURL}
                        alt=""
                        className="w-9 h-9 rounded-xl object-cover ring-2 ring-slate-800"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                        {profile.displayName?.[0]?.toUpperCase() || "U"}
                      </div>
                    )}
                    {/* Online status indicator dot */}
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors">
                      {profile.displayName || "Member"}
                    </h4>
                    <p className="text-[10px] text-slate-400">Active now</p>
                  </div>
                </div>

                <span className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-800 text-slate-400 border border-slate-700/50">
                  Online
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Your Group Shortcuts Widget */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-4 shadow-xl">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-1">Your Groups</h3>
        
        <div className="flex flex-col gap-1.5">
          {groups.length === 0 ? (
            <p className="text-xs text-slate-500 italic px-1">No groups joined yet.</p>
          ) : (
            groups.slice(0, 5).map((group) => (
              <Link
                key={group.id}
                to={`/groups/${group.id}`}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/60 transition-all duration-200 group"
              >
                <div className={`w-8 h-8 rounded-lg ${group.iconBgColor || "bg-emerald-600"} text-white flex items-center justify-center text-sm font-bold shadow-sm shrink-0`}>
                  {group.iconText || group.icon || "👥"}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-medium text-slate-300 group-hover:text-emerald-400 transition-colors truncate">
                    {group.name}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">{group.category || "Community"}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}