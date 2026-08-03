import { useState } from "react";
import { createPost, usePosts } from "../../hooks/usePosts.js";
import { useToast } from "../../contexts/ToastContext.jsx";
import ComposerDrawer from "../home/ComposerDrawer.jsx";
import PostCard from "../home/PostCard.jsx";

export default function Feed({ groupId, userId, userName, isOwner, profileMap, canInteract = true, groupIsPublic = false }) {
  const posts = usePosts(groupId);
  const { showToast } = useToast();
  const [drawerOpen, setDrawerOpen] = useState(false);

  async function handleCreate(data) {
    try {
      const visibility = groupIsPublic && data.visibility === "public" ? "public" : "private";
      await createPost(userId, { groupId, ...data, visibility });
    } catch {
      showToast("Couldn't post that.", "error");
    }
  }

  const myFriends = profileMap[userId]?.friends || [];

  return (
    <div className="flex flex-col gap-4">
{canInteract && (
  <button
    onClick={() => setDrawerOpen(true)}
    className="group w-full flex items-center gap-3 bg-white/70 dark:bg-slate-800/60 backdrop-blur-md border border-white/40 dark:border-slate-700/60 shadow-lg shadow-slate-200/40 dark:shadow-black/20 rounded-2xl px-4 py-3 hover:shadow-xl hover:border-emerald-300 dark:hover:border-emerald-600 transition-all"
  >
    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-sm shrink-0 group-hover:scale-110 transition-transform">
      ✏️
    </div>
    <span className="flex-1 text-left text-sm text-slate-400">Share an update with the group…</span>
    <span className="text-xs text-slate-300 group-hover:text-emerald-500 transition-colors">🖼️ 🗳️</span>
  </button>
)}

      <div className="flex flex-col gap-3">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            userId={userId}
            userName={userName}
            userFriends={myFriends}
            author={profileMap[post.authorId]}
            canManage={canInteract && (post.authorId === userId || isOwner)}
            canInteract={canInteract}
            allowVisibilityToggle={groupIsPublic}
          />
        ))}
        {posts.length === 0 && <p className="text-sm text-slate-400 text-center mt-8">Nothing posted yet.</p>}
      </div>

<ComposerDrawer
  isOpen={drawerOpen}
  onClose={() => setDrawerOpen(false)}
  onSubmit={handleCreate}
  title="New Post"
  placeholder="Share an update with the group…"
  showVisibilityToggle={groupIsPublic}
  showAnnouncementToggle
  visibilityLabels={{ public: "🌐 Also on Home", private: "🔒 Group only" }}
/>
    </div>
  );
}