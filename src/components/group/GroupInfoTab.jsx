export default function GroupInfoTab({ group, isOwner }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="bg-white/70 dark:bg-slate-800/60 backdrop-blur-md border border-white/40 dark:border-slate-700/60 shadow-lg shadow-slate-200/40 dark:shadow-black/20 rounded-2xl p-4">
        <p className="text-xs font-medium text-slate-400 mb-1">About</p>
        <p className="text-sm text-slate-700 dark:text-slate-200">
          {group.description || "No description yet."}
        </p>
      </div>

      <div className="bg-white/70 dark:bg-slate-800/60 backdrop-blur-md border border-white/40 dark:border-slate-700/60 shadow-lg shadow-slate-200/40 dark:shadow-black/20 rounded-2xl p-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-medium text-slate-400">Category</p>
          <p className="text-sm text-slate-700 dark:text-slate-200 mt-0.5">{group.category}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-400">Visibility</p>
          <p className="text-sm text-slate-700 dark:text-slate-200 mt-0.5">{group.isPublic ? "🌐 Public" : "🔒 Private"}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-400">Members</p>
          <p className="text-sm text-slate-700 dark:text-slate-200 mt-0.5">{group.memberIds?.length || 1}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-400">Started</p>
          <p className="text-sm text-slate-700 dark:text-slate-200 mt-0.5">
            {group.createdAt ? group.createdAt.toDate().toLocaleDateString() : "—"}
          </p>
        </div>
      </div>

      {isOwner && (
        <div className="bg-white/70 dark:bg-slate-800/60 backdrop-blur-md border border-white/40 dark:border-slate-700/60 shadow-lg shadow-slate-200/40 dark:shadow-black/20 rounded-2xl p-4">
          <p className="text-xs font-medium text-slate-400">Invite code</p>
          <p className="text-sm font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">{group.inviteCode}</p>
        </div>
      )}
    </div>
  );
}