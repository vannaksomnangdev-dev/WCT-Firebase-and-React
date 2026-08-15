import React from "react";

export default function MemberList({ members, ownerId, currentUserId }) {
  return (
    <div className="flex flex-col gap-4 max-w-2xl mx-auto w-full pb-20">
      
      {/* Header Info Banner */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-lg">👥</span>
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            Community Members
          </h3>
        </div>
        <span className="text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full shadow-inner">
          {members.length} Total
        </span>
      </div>

      {/* Member Cards List */}
      <div className="flex flex-col gap-3">
        {members.map((member, index) => {
          const isOwner = member.uid === ownerId;
          const isMe = member.uid === currentUserId;

          return (
            <div
              key={member.uid}
              className="flex items-center justify-between p-4 rounded-3xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/60 shadow-xl shadow-slate-200/30 dark:shadow-black/20 transition-all duration-300 hover:scale-[1.01] hover:border-emerald-500/40 fade-in-section"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-3.5">
                {member.photoURL ? (
                  <img
                    src={member.photoURL}
                    alt=""
                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-500/30 shadow-md"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-extrabold flex items-center justify-center text-sm shadow-md">
                    {member.displayName?.[0]?.toUpperCase() || member.email?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                      {member.displayName || member.email?.split("@")[0] || "Member"}
                    </span>
                    
                    {/* Indicators / Badges */}
                    {isMe && (
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-sm">
                        You ✨
                      </span>
                    )}
                    {isOwner && (
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-sm">
                        👑 Owner
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{member.email}</p>
                </div>
              </div>

              {/* Custom user word/tag display or role indicator */}
              <div className="flex items-center gap-2">
                {member.customTag ? (
                  <span className="text-xs px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300 font-semibold shadow-inner">
                    {member.customTag}
                  </span>
                ) : (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl">
                    Active Member 🟢
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {members.length === 0 && (
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/60 rounded-3xl p-12 text-center shadow-lg my-4">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-3 text-2xl shadow-inner">
              👥
            </div>
            <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">No members found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              This community doesn't have any members listed yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}