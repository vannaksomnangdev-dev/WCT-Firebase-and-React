import { useState, useEffect, useMemo } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useToast } from "../contexts/ToastContext.jsx";
import { usePublicFeed, useMyPosts, createPost } from "../hooks/usePosts.js";
import { useUserGroups } from "../hooks/useGroups.js";
import { getUserProfiles } from "../hooks/useUserProfile.js";
import { sortForYou } from "../utils/feedRanking.jsx";
import Navbar from "../components/Navbar.jsx";
import PostCard from "../components/home/PostCard.jsx";
import ComposerDrawer from "../components/home/ComposerDrawer.jsx";
import AdCard from "../components/home/AdCard.jsx";
import BackgroundBlobs from "../components/BackgroundBlobs.jsx";
import ActiveDock from "../components/home/ActiveDock.jsx";
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "../firebase.js";

const TABS = [
  { key: "forYou", label: "For You" },
  { key: "mine", label: "My Posts" },
];

// Fully Immersive Discovery Group Recommendation Card for FYP feed
function FypSuggestedGroupCard({ group, userId }) {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [memberIds, setMemberIds] = useState(group.memberIds || []);
  const [loading, setLoading] = useState(false);

  const isMember = memberIds.includes(userId);

  async function handleToggleJoin(e) {
    e.stopPropagation();
    if (!userId) return;
    setLoading(true);
    try {
      const groupRef = doc(db, "groups", group.id);
      if (isMember) {
        await updateDoc(groupRef, { memberIds: arrayRemove(userId) });
        setMemberIds((prev) => prev.filter((id) => id !== userId));
        showToast("Left group successfully", "info");
      } else {
        await updateDoc(groupRef, { memberIds: arrayUnion(userId) });
        setMemberIds((prev) => [...prev, userId]);
        showToast("Joined group successfully!");
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to update group membership.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      onClick={() => navigate(`/groups/${group.id}`)}
      className="group/card cursor-pointer rounded-3xl bg-slate-950 text-white shadow-2xl shadow-slate-950/40 hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)] transition-all relative overflow-hidden my-4 border border-white/20"
    >
      <div className="absolute inset-0 z-0">
        {group.bannerPhotoURL ? (
          <img src={group.bannerPhotoURL} alt="" className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-700 filter contrast-105" />
        ) : (
          <div className={`w-full h-full ${group.bannerColor || "bg-emerald-600"}`} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/60 to-slate-950/30 backdrop-blur-[0.5px]" />
      </div>

      <div className="relative z-10 p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-3 py-1 rounded-full shadow-lg backdrop-blur-md">
            ✨ Discover Community Recommendation ↗
          </span>
          <span className="text-xs text-slate-200 font-semibold bg-black/60 px-2.5 py-1 rounded-lg backdrop-blur-md shadow">
            {memberIds.length} member{memberIds.length === 1 ? "" : "s"} · {group.category || "General"}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {group.photoURL ? (
            <img src={group.photoURL} alt="" className="w-14 h-14 rounded-2xl object-cover shrink-0 ring-2 ring-white/40 shadow-xl" />
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

        <div className="flex items-center gap-3 pt-3 border-t border-white/15" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={handleToggleJoin}
            disabled={loading}
            className={`flex-1 text-xs font-bold py-2.5 rounded-xl transition-all shadow-lg ${
              isMember
                ? "bg-white/20 text-white hover:bg-red-600 hover:text-white backdrop-blur-md border border-white/20"
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50"
            }`}
          >
            {loading ? "Updating..." : isMember ? "Cancel / Leave Group" : "+ Join Group"}
          </button>

          <button
            onClick={() => navigate(`/groups/${group.id}`)}
            className="text-xs font-semibold px-4 py-2.5 rounded-xl bg-white/20 border border-white/20 text-white hover:bg-white/30 transition-colors shadow-lg backdrop-blur-md"
          >
            View Page ↗
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  
  const myGroups = useUserGroups(user?.uid);
  const publicPosts = usePublicFeed();
  const myPosts = useMyPosts(user?.uid);

  const [activeTab, setActiveTab] = useState("forYou");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profiles, setProfiles] = useState({});
  const [discoverGroups, setDiscoverGroups] = useState([]);

  useEffect(() => {
    async function fetchDiscoverGroups() {
      try {
        const q = query(collection(db, "groups"), where("isPublic", "==", true));
        const snap = await getDocs(q);
        setDiscoverGroups(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error(err);
      }
    }
    fetchDiscoverGroups();
  }, []);

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
  const profileList = useMemo(() => Object.values(profiles), [profiles]);

  if (!authLoading && !user) {
    return <Navigate to="/" replace />;
  }

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
      <BackgroundBlobs />
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
          
          {/* Center Feed Column */}
          <div className="w-full">
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

            {activeTab === "forYou" && discoverGroups.length > 0 && (
              <div className="mb-4">
                <FypSuggestedGroupCard group={discoverGroups[0]} userId={user?.uid} />
              </div>
            )}

            <div className="flex flex-col gap-3">
              {visiblePosts.map((post, index) => {
                const showSuggestion = activeTab === "forYou" && (index + 1) % 4 === 0 && discoverGroups.length > 1;
                const targetGroup = showSuggestion ? discoverGroups[Math.floor((index + 1) / 4) % discoverGroups.length] : null;

                return (
                  <div key={post.id} className="flex flex-col gap-3">
                    {showSuggestion && targetGroup && (
                      <FypSuggestedGroupCard group={targetGroup} userId={user?.uid} />
                    )}
                    <PostCard
                      post={post}
                      userId={user?.uid}
                      userName={myName}
                      userFriends={myFriends}
                      author={profiles[post.authorId]}
                      groupName={post.groupId ? groupNameById[post.groupId] : null}
                      canManage={post.authorId === user?.uid}
                    />
                  </div>
                );
              })}
              
              {visiblePosts.length === 0 && (
                <p className="text-sm text-slate-400 text-center mt-8">
                  {activeTab === "mine" ? "You haven't posted anything yet." : "No public posts yet."}
                </p>
              )}
            </div>
          </div>

          {/* Right Sidebar Widgets Column */}
          <div className="flex flex-col gap-6 sticky top-8">
            <ActiveDock profiles={profileList} groups={myGroups} />
            <div className="hidden xl:block">
              <AdCard />
            </div>
          </div>

        </div>
      </main>

      <ComposerDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} onSubmit={handleCreate} showVisibilityToggle />
    </div>
  );
}