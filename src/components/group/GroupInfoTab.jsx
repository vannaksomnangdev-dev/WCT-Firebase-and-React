export default function GroupInfoTab({ group, isOwner }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Left Sidebar: Contact/About Info & Group Rules */}
      <div className="flex flex-col gap-6">
        {/* Contact Info Card (Facebook Style) */}
        <div className="bg-white/70 dark:bg-slate-800/60 backdrop-blur-md border border-white/40 dark:border-slate-700/60 shadow-lg shadow-slate-200/40 dark:shadow-black/20 rounded-2xl p-5">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">Contact info</h3>
          
          <div className="flex flex-col gap-3.5 text-xs text-slate-600 dark:text-slate-300">
            {group.email && (
              <div className="flex items-center gap-3">
                <span className="text-base">✉️</span>
                <p className="text-emerald-600 dark:text-emerald-400 font-medium truncate">{group.email}</p>
              </div>
            )}

            <div className="flex items-center gap-3">
              <span className="text-base">🌐</span>
              <p className="text-slate-700 dark:text-slate-200 font-medium">{group.name}</p>
            </div>

            <div>
              <p className="text-slate-400 font-medium">Description</p>
              <p className="text-slate-700 dark:text-slate-200 mt-0.5 leading-relaxed">
                {group.description || "No description provided yet."}
              </p>
            </div>

            <div>
              <p className="text-slate-400 font-medium">Category / Details</p>
              <p className="text-slate-700 dark:text-slate-200 mt-0.5 font-semibold">{group.category || "General"}</p>
            </div>

            <div>
              <p className="text-slate-400 font-medium">Visibility</p>
              <p className="text-slate-700 dark:text-slate-200 mt-0.5">{group.isPublic ? "🌐 Public Group" : "🔒 Private Group"}</p>
            </div>

            <div>
              <p className="text-slate-400 font-medium">Members & Stats</p>
              <p className="text-slate-700 dark:text-slate-200 mt-0.5">{group.memberIds?.length || 1} members</p>
            </div>

            {isOwner && (
              <div className="pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
                <p className="text-slate-400 font-medium">Invite Code</p>
                <p className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {group.inviteCode}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Group Rules Card */}
        <div className="bg-white/70 dark:bg-slate-800/60 backdrop-blur-md border border-white/40 dark:border-slate-700/60 shadow-lg shadow-slate-200/40 dark:shadow-black/20 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3">Group Rules</h3>
          {group.rules && group.rules.length > 0 ? (
            <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
              {group.rules.map((rule, idx) => (
                <li key={idx}>{rule}</li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-400 italic">No specific rules set yet.</p>
          )}
        </div>
      </div>

      {/* Right Main Area: Photos Preview & Posts Layout Side */}
      <div className="md:col-span-2 flex flex-col gap-6">
        {/* Photos Preview Section (Exact Facebook Grid Layout) */}
        <div className="bg-white/70 dark:bg-slate-800/60 backdrop-blur-md border border-white/40 dark:border-slate-700/60 shadow-lg shadow-slate-200/40 dark:shadow-black/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Photos</h3>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 cursor-pointer hover:underline">
              See all photos
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {group.photoURL || group.bannerPhotoURL ? (
              <>
                {group.photoURL && (
                  <div className="aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                    <img src={group.photoURL} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                  </div>
                )}
                {group.bannerPhotoURL && (
                  <div className="aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                    <img src={group.bannerPhotoURL} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                  </div>
                )}
              </>
            ) : (
              <div className="col-span-3 py-8 text-center bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-400 italic">No media or custom group photos uploaded yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}