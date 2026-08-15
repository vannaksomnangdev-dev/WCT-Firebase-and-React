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
    <div className="relative min-h-screen">
      <BackgroundBlobs />
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-8 relative">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6 fade-in-section">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">My Groups</h1>
          <div className="flex items-center gap-3">
            <Link to="/discover" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors">
              Discover public groups →
            </Link>
            <Link
              to="/groups/create"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-md transition-colors"
            >
              + Create Group
            </Link>
          </div>
        </div>

        <form
          onSubmit={handleJoin}
          className="bg-white/70 dark:bg-slate-800/60 backdrop-blur-md border border-white/40 dark:border-slate-700/60 shadow-lg shadow-slate-200/40 dark:shadow-black/20 rounded-2xl p-4 flex flex-col gap-2.5 mb-8 max-w-sm fade-in-section"
        >
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Have an invite code?</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="e.g. A3F9K2"
              maxLength={6}
              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white/90 dark:bg-slate-700/90 text-slate-800 dark:text-slate-100 text-sm uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
            />
            <button
              type="submit"
              disabled={joining}
              className="bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors shadow-sm"
            >
              Join
            </button>
          </div>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group, index) => (
            <Link
              key={group.id}
              to={`/groups/${group.id}`}
              className="group relative overflow-hidden rounded-3xl bg-slate-900 text-white shadow-2xl shadow-slate-900/30 hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)] hover:-translate-y-1 transition-all fade-in-section border border-white/20 flex flex-col justify-between p-6"
              style={{ animationDelay: `${80 + index * 40}ms` }}
            >
              {/* 🌟 100% Full Card Background Fill Layer */}
              <div className="absolute inset-0 z-0">
                {group.bannerPhotoURL ? (
                  <img src={group.bannerPhotoURL} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : (
                  <div className={`w-full h-full ${group.bannerColor || "bg-emerald-600"}`} />
                )}
                {/* Cinematic glass gradient overlay for ultimate clarity and text contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/60 to-slate-950/30 backdrop-blur-[0.5px]" />
              </div>

              {/* Card Content Layer */}
              <div className="relative z-10 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  {group.category ? (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-3 py-1 rounded-full shadow backdrop-blur-md">
                      {group.category}
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 bg-black/50 px-3 py-1 rounded-full backdrop-blur-md">
                      General
                    </span>
                  )}
                  {group.isPublic && <span className="text-xs bg-black/50 p-1.5 rounded-full backdrop-blur-md" title="Public Group">🌐</span>}
                </div>

                <div className="flex items-center gap-3.5">
                  {group.photoURL ? (
                    <img
                      src={group.photoURL}
                      alt=""
                      className="w-14 h-14 rounded-2xl object-cover ring-2 ring-white/40 shadow-xl shrink-0"
                    />
                  ) : (
                    <div className={`w-14 h-14 rounded-2xl ${group.iconBgColor || "bg-emerald-600"} ring-2 ring-white/30 text-xl font-bold flex items-center justify-center shrink-0 shadow-xl text-white`}>
                      {group.iconText || group.icon || "👥"}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-base truncate group-hover:text-emerald-400 transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                      {group.name}
                    </h3>
                    <p className="text-xs text-slate-300 line-clamp-1 mt-0.5 font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                      {group.description || "Explore this public community."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative z-10 flex items-center justify-between text-xs text-slate-200 pt-4 border-t border-white/15 mt-6 font-medium">
                <span>{group.memberIds?.length || 1} member{group.memberIds?.length === 1 ? "" : "s"}</span>
                <span className="text-emerald-300 font-semibold group-hover:underline">View Page ↗</span>
              </div>
            </Link>
          ))}
        </div>

        {groups.length === 0 && (
          <div className="text-center py-16 fade-in-section">
            <p className="text-sm text-slate-400">No groups yet — create one or join with a code above.</p>
          </div>
        )}
      </main>
    </div>
  );
}