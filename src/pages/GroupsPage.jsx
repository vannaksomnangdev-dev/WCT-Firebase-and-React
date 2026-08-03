import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useToast } from "../contexts/ToastContext.jsx";
import { useUserGroups, joinGroupByCode } from "../hooks/useGroups.js";
import Navbar from "../components/Navbar.jsx";
import BackgroundBlobs from "../components/BackgroundBlobs.jsx";

export default function GroupsPage() {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const groups = useUserGroups(user?.uid);

  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);

  if (!authLoading && !user) return <Navigate to="/" replace />;

  async function handleJoin(e) {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setJoining(true);
    try {
      await joinGroupByCode(user.uid, joinCode.trim());
      setJoinCode("");
      showToast("Joined group");
    } catch (error) {
      showToast(error.message || "Couldn't join that group.", "error");
    } finally {
      setJoining(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
<BackgroundBlobs />

      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8 relative">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6 fade-in-section">
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">My Groups</h1>
          <div className="flex items-center gap-3">
            <Link to="/discover" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
              Discover public groups →
            </Link>
            <Link
              to="/groups/create"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              + Create Group
            </Link>
          </div>
        </div>

        <form
          onSubmit={handleJoin}
          className="bg-white/70 dark:bg-slate-800/60 backdrop-blur-md border border-white/40 dark:border-slate-700/60 shadow-lg shadow-slate-200/40 dark:shadow-black/20 rounded-2xl p-4 flex flex-col gap-3 mb-8 max-w-sm fade-in-section"
          style={{ animationDelay: "40ms" }}
        >
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Have an invite code?</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="e.g. A3F9K2"
              maxLength={6}
              className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={joining}
              className="bg-slate-700 hover:bg-slate-800 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Join
            </button>
          </div>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group, index) => (
            <Link
              key={group.id}
              to={`/groups/${group.id}`}
              className="group relative overflow-hidden rounded-2xl bg-white/70 dark:bg-slate-800/60 backdrop-blur-md border border-white/40 dark:border-slate-700/60 shadow-lg shadow-slate-200/40 dark:shadow-black/20 hover:shadow-xl hover:-translate-y-0.5 transition-all fade-in-section"
              style={{ animationDelay: `${80 + index * 40}ms` }}
            >
<div className="h-20 relative">
  {group.bannerPhotoURL ? (
    <img src={group.bannerPhotoURL} alt="" className="w-full h-full object-cover" />
  ) : (
    <div className={`w-full h-full ${group.bannerColor || "bg-emerald-500"} opacity-90`} />
  )}
  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
</div>

              <div className="p-4 pt-0 -mt-8 relative">
                <div className="flex items-end gap-3 mb-3">
                  {group.photoURL ? (
                    <img
                      src={group.photoURL}
                      alt=""
                      className="w-14 h-14 rounded-xl object-cover ring-4 ring-white dark:ring-slate-800 shrink-0"
                    />
                  ) : (
<div className={`w-14 h-14 rounded-xl ${group.iconBgColor || "bg-emerald-600"} ring-4 ring-white dark:ring-slate-800 text-2xl font-bold flex items-center justify-center shrink-0`}>
  {group.iconText || group.icon || "👥"}
</div>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm truncate">{group.name}</h3>
                  {group.isPublic && <span className="text-xs">🌐</span>}
                </div>

                {group.description ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">{group.description}</p>
                ) : (
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic mb-3">No description yet</p>
                )}

                <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500">
                  <span className="font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/60 px-2 py-0.5 rounded-full">
                    {group.category}
                  </span>
                  <span>{group.memberIds?.length || 1} member{group.memberIds?.length === 1 ? "" : "s"}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {groups.length === 0 && (
          <p className="text-sm text-slate-400 text-center mt-12 fade-in-section">
            No groups yet — create one or join with a code.
          </p>
        )}
      </main>
    </div>
  );
}