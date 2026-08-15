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
      <BackgroundBlobs />
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8 relative">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6 fade-in-section">Discover Groups</h1>

        <div className="flex flex-col gap-3 mb-8 fade-in-section" style={{ animationDelay: "40ms" }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search groups by name…"
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white/90 dark:bg-slate-700/90 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 max-w-sm shadow-inner"
          />
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`text-xs font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm ${
                  category === c ? "bg-emerald-600 text-white shadow-emerald-950/40" : "bg-white/70 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((group, index) => {
            const alreadyMember = group.memberIds?.includes(user?.uid);
            return (
              <Link
                key={group.id}
                to={`/groups/${group.id}`}
                className="group/card cursor-pointer rounded-3xl bg-slate-950 text-white shadow-2xl shadow-slate-950/40 hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)] hover:-translate-y-1 transition-all relative overflow-hidden fade-in-section border border-white/20 p-6 flex flex-col justify-between"
                style={{ animationDelay: `${80 + index * 40}ms` }}
              >
                {/* 🌟 100% Full Card Immersive Background Layer */}
                <div className="absolute inset-0 z-0">
                  {group.bannerPhotoURL ? (
                    <img src={group.bannerPhotoURL} alt="" className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-700 filter contrast-105" />
                  ) : (
                    <div className={`w-full h-full ${group.bannerColor || "bg-emerald-600"}`} />
                  )}
                  {/* Cinematic glass gradient overlay for ultimate text clarity and contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/60 to-slate-950/30 backdrop-blur-[0.5px]" />
                </div>

                {/* Card Content Layer */}
                <div className="relative z-10 flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-3 py-1 rounded-full shadow-lg backdrop-blur-md">
                      {group.category || "General"}
                    </span>
                    {alreadyMember && (
                      <span className="text-[10px] font-bold text-white bg-emerald-600/90 px-3 py-1 rounded-full shadow-md backdrop-blur-md">
                        ✓ Joined
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3.5">
                    {group.photoURL ? (
                      <img
                        src={group.photoURL}
                        alt=""
                        className="w-14 h-14 rounded-2xl object-cover ring-2 ring-white/40 shadow-xl shrink-0"
                      />
                    ) : (
                      <div className={`w-14 h-14 rounded-2xl ${group.iconBgColor || "bg-emerald-600"} text-white text-xl font-bold flex items-center justify-center shrink-0 shadow-xl ring-2 ring-white/30`}>
                        {group.iconText || group.icon || "👥"}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-white truncate group-hover/card:text-emerald-400 transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
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
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 fade-in-section">
            <p className="text-sm text-slate-400">No public groups match that yet.</p>
          </div>
        )}
      </main>
    </div>
  );
}