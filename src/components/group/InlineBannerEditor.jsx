import { useState } from "react";
import { createPost, usePosts } from "../../hooks/usePosts.js";
import { useToast } from "../../contexts/ToastContext.jsx";
import ComposerDrawer from "../home/ComposerDrawer.jsx";
import PostCard from "../home/PostCard.jsx";

export default function Feed({ groupId, userId, userName, isOwner, profileMap, canInteract = true, groupIsPublic = false }) {
  const posts = usePosts(groupId);
  const { showToast } = useToast();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filterTab, setFilterTab] = useState("all");

  async function handleCreate(data) {
    try {
      const visibility = groupIsPublic && data?.visibility === "public" ? "public" : "private";
      await createPost(userId, { groupId, ...data, visibility });
      showToast("Post published successfully! 🎉");
    } catch {
      showToast("Couldn't post that.", "error");
    }
  }

  const safeProfileMap = profileMap || {};
  const myFriends = (userId && safeProfileMap[userId]?.friends) || [];
  const currentUserProfile = userId ? safeProfileMap[userId] : null;

  const filteredPosts = (posts || []).filter((post) => {
    if (!post) return false;
    if (filterTab === "media") return post.imageURL || post.videoURL;
    if (filterTab === "text") return !post.imageURL && !post.videoURL;
    return true;
  });

  return (
    <div className="flex flex-col gap-5 max-w-2xl mx-auto w-full pb-20">
      
      {canInteract && (
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/60 shadow-lg rounded-3xl p-4 flex items-center gap-3 overflow-x-auto no-scrollbar">
          <div className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group" onClick={() => setDrawerOpen(true)}>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-md group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[14px] flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-xl font-bold">
                +
              </div>
            </div>
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">New Story</span>
          </div>

          {myFriends.slice(0, 6).map((friendId) => {
            const friend = safeProfileMap[friendId];
            if (!friend) return null;
            return (
              <div key={friendId} className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-500 p-0.5 shadow-md group-hover:scale-105 transition-transform">
                  <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[14px] overflow-hidden p-0.5">
                    {friend?.avatarURL ? (
                      <img src={friend.avatarURL} alt="" className="w-full h-full object-cover rounded-[10px]" />
                    ) : (
                      <div className="w-full h-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center rounded-[10px]">
                        {(friend?.displayName || "U").charAt(0)}
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate w-16 text-center">
                  {friend?.displayName?.split(" ")[0] || "Friend"}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {canInteract && (
        <div
          onClick={() => setDrawerOpen(true)}
          className="group cursor-pointer bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700/70 shadow-xl shadow-slate-200/50 dark:shadow-black/30 rounded-3xl p-4 flex items-center gap-4 hover:border-emerald-500/50 transition-all"
        >
          {currentUserProfile?.avatarURL ? (
            <img src={currentUserProfile.avatarURL} alt="" className="w-11 h-11 rounded-2xl object-cover shadow-md shrink-0 group-hover:scale-105 transition-transform" />
          ) : (
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-base flex items-center justify-center shadow-md shrink-0 group-hover:scale-105 transition-transform">
              {(userName || "U").charAt(0).toUpperCase()}
            </div>
          )}

          <div className="flex-1 bg-slate-100 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-sm text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors flex items-center justify-between">
            <span>What's on your mind today, {userName?.split(" ")[0] || "there"}?</span>
            <span className="text-xs">✨</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium text-xs px-3 py-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl">
            📷 Media
          </div>
        </div>
      )}

      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 bg-slate-200/60 dark:bg-slate-800/60 p-1 rounded-2xl backdrop-blur-md">
          <button
            onClick={() => setFilterTab("all")}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterTab === "all" ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            🔥 All Posts
          </button>
          <button
            onClick={() => setFilterTab("media")}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterTab === "media" ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            🖼️ Media
          </button>
          <button
            onClick={() => setFilterTab("text")}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterTab === "text" ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            💬 Discussions
          </button>
        </div>

        <span className="text-xs font-semibold text-slate-400 pr-1">
          {filteredPosts.length} post{filteredPosts.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {filteredPosts.map((post, index) => (
          <PostCard
            key={post?.id || index}
            post={post}
            userId={userId}
            userName={userName}
            userFriends={myFriends}
            author={post?.authorId ? safeProfileMap[post.authorId] : null}
            canManage={canInteract && (post?.authorId === userId || isOwner)}
            canInteract={canInteract}
            allowVisibilityToggle={groupIsPublic}
          />
        ))}

        {filteredPosts.length === 0 && (
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/60 rounded-3xl p-12 text-center shadow-lg my-6">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-3 text-2xl shadow-inner">
              📭
            </div>
            <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">No posts found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Be the first one to kick off the conversation or share an update with the community!
            </p>
          </div>
        )}
      </div>

      <ComposerDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSubmit={handleCreate}
        title="Create New Post"
        placeholder="What's on your mind? Share thoughts, photos, or polls..."
        showVisibilityToggle={groupIsPublic}
        showAnnouncementToggle
        visibilityLabels={{ public: "🌐 Public Feed", private: "🔒 Group Members Only" }}
      />
    </div>
  );
}