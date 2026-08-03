import React from "react";

export default function MemberList({ members, ownerId, currentUserId }) {
  return (
    <div className="flex flex-col gap-3">
      {members.map((member, index) => {
        const isOwner = member.uid === ownerId;
        const isMe = member.uid === currentUserId;

        return (
          <div
            key={member.uid}
            className="flex items-center justify-between p-4 rounded-2xl bg-white/70 dark:bg-slate-800/60 backdrop-blur-md border border-white/40 dark:border-slate-700/60 shadow-md shadow-slate-200/30 dark:shadow-black/10 transition-all duration-300 hover:scale-[1.01] fade-in-section"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center gap-3">
              {member.photoURL ? (
                <img
                  src={member.photoURL}
                  alt=""
                  className="w-10 h-10 rounded-xl object-cover ring-2 ring-emerald-500/30"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                  {member.displayName?.[0]?.toUpperCase() || member.email?.[0]?.toUpperCase() || "U"}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                    {member.displayName || member.email?.split("@")[0] || "Member"}
                  </span>
                  
                  {/* Indicators / Badges */}
                  {isMe && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border border-emerald-300/40">
                      You
                    </span>
                  )}
                  {isOwner && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 border border-amber-300/40">
                      Owner
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500">{member.email}</p>
              </div>
            </div>

            {/* Custom user word/tag display or role indicator */}
            <div className="flex items-center gap-2">
              {member.customTag ? (
                <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 font-medium">
                  {member.customTag}
                </span>
              ) : (
                <span className="text-xs text-slate-400 italic">Active Member</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}