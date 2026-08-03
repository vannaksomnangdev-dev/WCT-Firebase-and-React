import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useToast } from "../contexts/ToastContext.jsx";
import { usePublicFeed, useMyPosts, createPost } from "../hooks/usePosts.js";
import { useUserGroups } from "../hooks/useGroups.js";
import { getUserProfiles } from "../hooks/useUserProfile.js";
import { sortForYou } from "../utils/feedRanking.js";
import Navbar from "../components/Navbar.jsx";
import PostCard from "../components/home/PostCard.jsx";
import ComposerDrawer from "../components/home/ComposerDrawer.jsx";
import AdCard from "../components/home/AdCard.jsx";
import BackgroundBlobs from "../components/BackgroundBlobs.jsx";

const TABS = [
  { key: "forYou", label: "For You" },
  { key: "mine", label: "My Posts" },
];

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const myGroups = useUserGroups(user?.uid);

  const publicPosts = usePublicFeed();
  const myPosts = useMyPosts(user?.uid);

  const [activeTab, setActiveTab] = useState("forYou");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profiles, setProfiles] = useState({});

const forYouPosts = useMemo(() => sortForYou(publicPosts), [publicPosts]);
const visiblePosts = activeTab === "mine" ? myPosts : forYouPosts;

  useEffect(() => {
    const ids = [...new Set([user?.uid, ...visiblePosts.map((p) => p.authorId)])].filter((id) => id && !profiles[id]);
    if (ids.length === 0) return;
    getUserProfiles(ids).then((results) => {
      setProfiles((prev) => {
        const next = { ...prev };
        results.forEach((p) => (next[p.uid] = p));
        return next;
      });
    });
  }, [visiblePosts, user?.uid]);

  const groupNameById = useMemo(() => Object.fromEntries(myGroups.map((g) => [g.id, g.name])), [myGroups]);

  if (!authLoading && !user) return <Navigate to="/" replace />;

  async function handleCreate(data) {
    try {
      await createPost(user.uid, { groupId: null, ...data });
    } catch {
      showToast("Couldn't post that.", "error");
    }
  }

  const myName = profiles[user?.uid]?.displayName || user?.email?.split("@")[0] || "Member";
  const myFriends = profiles[user?.uid]?.friends || [];
  const myProfileColor = ["bg-emerald-500", "bg-sky-500", "bg-amber-500", "bg-fuchsia-500", "bg-indigo-500", "bg-violet-500"][
    (user?.uid || "").split("").reduce((s, c) => s + c.charCodeAt(0), 0) % 6
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-400/20 dark:bg-emerald-500/10 rounded-full blur-3xl animate-drift" />
        <div className="absolute top-1/3 -right-24 w-96 h-96 bg-sky-400/20 dark:bg-sky-500/10 rounded-full blur-3xl animate-drift-slow" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-400/10 dark:bg-amber-500/10 rounded-full blur-3xl animate-drift" style={{ animationDelay: "4s" }} />
      </div>

      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8 relative">
  <div className="flex gap-6 items-start">
    <div className="flex-1 max-w-3xl mx-auto">
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 fade-in-section">Home</h1>

        <button
          onClick={() => setDrawerOpen(true)}
          className="group w-full flex items-center gap-3 bg-white/70 dark:bg-slate-800/60 backdrop-blur-md border border-white/40 dark:border-slate-700/60 shadow-lg shadow-slate-200/40 dark:shadow-black/20 rounded-2xl px-4 py-3 mb-6 hover:shadow-xl hover:border-emerald-300 dark:hover:border-emerald-600 transition-all fade-in-section"
        >
          <div className={`w-8 h-8 rounded-full ${myProfileColor} flex items-center justify-center text-white text-xs font-semibold shrink-0 group-hover:scale-110 transition-transform`}>
            {myName.charAt(0).toUpperCase()}
          </div>
          <span className="flex-1 text-left text-sm text-slate-400">What's on your mind?</span>
          <span className="text-xs text-slate-300 group-hover:text-emerald-500 transition-colors">🖼️ 🎬 🗳️</span>
        </button>

        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 mb-6 w-fit fade-in-section">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`text-sm font-medium px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.key
                  ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
{visiblePosts.map((post) => (
  <PostCard
    key={post.id}
    post={post}
    userId={user.uid}
    userName={myName}
    userFriends={myFriends}
    author={profiles[post.authorId]}
    groupName={post.groupId ? groupNameById[post.groupId] : null}
    canManage={post.authorId === user.uid}
  />
))}
          {visiblePosts.length === 0 && (
            <p className="text-sm text-slate-400 text-center mt-8">
              {activeTab === "mine" ? "You haven't posted anything yet." : "No public posts yet."}
            </p>
          )}
        </div>
      </div>

    <aside className="hidden lg:block w-64 shrink-0 sticky top-8">
      <AdCard />
    </aside>
  </div>
</main>

<ComposerDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} onSubmit={handleCreate} showVisibilityToggle />
    </div>
  );
}