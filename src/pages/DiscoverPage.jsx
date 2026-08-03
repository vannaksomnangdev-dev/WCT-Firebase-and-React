import { useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { usePublicGroups } from "../hooks/useGroups.js";
import Navbar from "../components/Navbar.jsx";
import BackgroundBlobs from "../components/BackgroundBlobs.jsx";


const CATEGORIES = ["All", "Game Dev", "Web Dev", "Design", "School Project", "Study Group", "Other"];

export default function DiscoverPage() {
  const { user, loading: authLoading } = useAuth();
  const groups = usePublicGroups();
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  if (!authLoading && !user) return <Navigate to="/" replace />;

  const filtered = useMemo(() => {
    return groups.filter((g) => {
      const matchesCategory = category === "All" || g.category === category;
      const matchesSearch = !search.trim() || g.name.toLowerCase().includes(search.trim().toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [groups, category, search]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-400/20 dark:bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-96 h-96 bg-sky-400/20 dark:bg-sky-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-400/10 dark:bg-amber-500/10 rounded-full blur-3xl" />
      </div>

      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8 relative">
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 fade-in-section">Discover Groups</h1>

        <div className="flex flex-col gap-3 mb-6 fade-in-section" style={{ animationDelay: "40ms" }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search groups by name…"
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 max-w-sm"
          />
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                  category === c ? "bg-emerald-600 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((group, index) => {
            const alreadyMember = group.memberIds?.includes(user?.uid);
            return (
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
  {alreadyMember && (
    <span className="absolute top-2 right-2 text-[10px] font-semibold text-white bg-emerald-600/90 px-2 py-1 rounded-full">
      Joined
    </span>
  )}
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

                  <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm truncate mb-1">{group.name}</h3>

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
            );
          })}
        </div>

        {filtered.length === 0 && (
          <p className="text-sm text-slate-400 text-center mt-12 fade-in-section">No public groups match that yet.</p>
        )}
      </main>
    </div>
  );
}