const COLORS = ["bg-emerald-500", "bg-sky-500", "bg-amber-500", "bg-fuchsia-500", "bg-rose-500", "bg-indigo-500"];

function colorFor(uid) {
  let sum = 0;
  for (let i = 0; i < uid.length; i++) sum += uid.charCodeAt(i);
  return COLORS[sum % COLORS.length];
}

export default function MemberList({ members, ownerId }) {
  return (
    <div className="flex flex-col gap-2">
      {members.map((m) => (
        <div key={m.uid} className="flex items-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3">
          <div className={`w-9 h-9 rounded-full ${colorFor(m.uid)} text-white text-sm font-semibold flex items-center justify-center shrink-0`}>
            {(m.displayName || "?").charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{m.displayName}</p>
            <p className="text-xs text-slate-400 truncate">{m.email}</p>
          </div>
          {m.uid === ownerId && (
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-full">
              Owner
            </span>
          )}
        </div>
      ))}
    </div>
  );
}