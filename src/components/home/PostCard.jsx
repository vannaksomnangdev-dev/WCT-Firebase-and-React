import { useEffect, useRef, useState } from "react";
import { castVote, toggleLike, editPost, deletePost, setComments, togglePin } from "../../hooks/usePosts.js";
import { useToast } from "../../contexts/ToastContext.jsx";
import UserProfilePopover from "../UserProfilePopover.jsx";
import { sendNotification } from "../../utils/notifications.js";

import VideoEmbed from "../VideoEmbed.jsx";

const AVATAR_COLORS = ["bg-emerald-500", "bg-sky-500", "bg-amber-500", "bg-fuchsia-500", "bg-indigo-500", "bg-violet-500"];

function colorFor(uid) {
  let sum = 0;
  for (let i = 0; i < uid.length; i++) sum += uid.charCodeAt(i);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

function timeAgo(ms) {
  if (!ms) return "just now";
  const mins = Math.floor((Date.now() - ms) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function PostCard({ post, userId, userName, userFriends = [], author, groupName, canManage, canInteract = true, allowVisibilityToggle = false }) {
  const { showToast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(post.text);
  const [editVisibility, setEditVisibility] = useState(post.visibility);
  const [editPollOptions, setEditPollOptions] = useState((post.pollOptions || []).map((o) => o.text));
  const [commentDraft, setCommentDraft] = useState("");
  const [replyDraft, setReplyDraft] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [viewingProfile, setViewingProfile] = useState(null);

  const [imageFit, setImageFit] = useState("cover");


  const [commentMenuOpenId, setCommentMenuOpenId] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState("");

  const menuRef = useRef(null);
  const commentMenuRef = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
      if (commentMenuRef.current && !commentMenuRef.current.contains(e.target)) setCommentMenuOpenId(null);
    }
    if (menuOpen || commentMenuOpenId) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [menuOpen, commentMenuOpenId]);

  function guard(fn) {
    return (...args) => {
      if (!canInteract) {
        showToast("Join this group to do that.", "info");
        return;
      }
      return fn(...args);
    };
  }

  const initial = (author?.displayName || "?").charAt(0).toUpperCase();
  const likes = post.likes || {};
  const likeCount = Object.values(likes).filter(Boolean).length;
  const iLiked = !!likes[userId];
  const allComments = post.comments || [];
  const topLevelComments = allComments.filter((c) => !c.parentId);

  const votes = post.votes || {};
  const options = post.pollOptions || [];
  const totalVotes = Object.keys(votes).length;
  const myVote = votes[userId];

  const handleVote = guard(async (optionId) => {
    try {
      await castVote(post.id, userId, optionId);
    } catch {
      showToast("Couldn't record your vote.", "error");
    }
  });

  const handleLike = guard(async () => {
    try {
      await toggleLike(post.id, userId, iLiked);
    } catch {
      showToast("Couldn't react to that.", "error");
    }
  });

  const handleAddComment = guard(async (parentId = null) => {
    const draft = parentId ? replyDraft : commentDraft;
    if (!draft.trim()) return;
    const next = [
      ...allComments,
      { id: `c${Date.now()}`, authorId: userId, authorName: userName || "Member", text: draft.trim(), createdAt: Date.now(), parentId },
    ];
    try {
      await setComments(post.id, next);
      if (parentId) {
        setReplyDraft("");
        setReplyingTo(null);
      } else {
        setCommentDraft("");
      }
      setShowComments(true);
    } catch {
      showToast("Couldn't add comment.", "error");
    }
  });



  async function handleDeleteComment(commentId) {
    const next = allComments.filter((c) => c.id !== commentId && c.parentId !== commentId);
    try {
      await setComments(post.id, next);
    } catch {
      showToast("Couldn't remove comment.", "error");
    }
  }

  function startEditComment(comment) {
    setEditingCommentId(comment.id);
    setEditingCommentText(comment.text);
    setCommentMenuOpenId(null);
  }

  async function saveEditComment(commentId) {
    if (!editingCommentText.trim()) return;
    const next = allComments.map((c) =>
      c.id === commentId ? { ...c, text: editingCommentText.trim(), editedAt: Date.now() } : c
    );
    try {
      await setComments(post.id, next);
      setEditingCommentId(null);
    } catch {
      showToast("Couldn't save comment edit.", "error");
    }
  }

  function startEdit() {
    setEditText(post.text);
    setEditVisibility(post.visibility);
    setEditPollOptions((post.pollOptions || []).map((o) => o.text));
    setIsEditing(true);
  }

  function updateEditOption(i, value) {
    setEditPollOptions((opts) => opts.map((o, idx) => (idx === i ? value : o)));
  }

  function addEditOption() {
    if (editPollOptions.length < 6) setEditPollOptions((opts) => [...opts, ""]);
  }

  function removeEditOption(i) {
    if (editPollOptions.length > 2) setEditPollOptions((opts) => opts.filter((_, idx) => idx !== i));
  }

  async function saveEdit() {
    if (!editText.trim()) return;
    const pollOptionsChanged =
      post.isPoll && JSON.stringify((post.pollOptions || []).map((o) => o.text)) !== JSON.stringify(editPollOptions);

    try {
      await editPost(post.id, {
        text: editText.trim(),
        visibility: allowVisibilityToggle ? editVisibility : undefined,
        pollOptions: pollOptionsChanged
          ? editPollOptions.filter((t) => t.trim()).map((t, i) => ({ id: `opt${i}`, text: t.trim() }))
          : undefined,
      });
      if (pollOptionsChanged) showToast("Poll updated — votes were reset since the options changed.", "info");
      setIsEditing(false);
    } catch {
      showToast("Couldn't save edit.", "error");
    }
  }

  async function handleDelete() {
    try {
      await deletePost(post.id);
    } catch {
      showToast("Couldn't delete that.", "error");
    }
  }

  function handleCopyLink() {
    navigator.clipboard
      .writeText(`${window.location.origin}/post/${post.id}`)
      .then(() => showToast("Link copied"))
      .catch(() => showToast("Couldn't copy link", "error"));
  }

  function openProfile(uid, name, email) {
    setViewingProfile({ uid, displayName: name, email });
  }

  function CommentAvatar({ uid, name }) {
    return (
      <button
        onClick={() => openProfile(uid, name)}
        className={`w-6 h-6 rounded-full ${colorFor(uid)} text-white flex items-center justify-center shrink-0 font-semibold text-[11px] hover:ring-2 hover:ring-emerald-400 transition-all`}
      >
        {(name || "?").charAt(0).toUpperCase()}
      </button>
    );
  }

  function CommentRow({ comment, indent }) {
    const isMine = comment.authorId === userId;
    const isEditingThis = editingCommentId === comment.id;

    return (
      <div className={`flex items-start gap-2 text-xs ${indent ? "ml-8" : ""}`}>
        <CommentAvatar uid={comment.authorId} name={comment.authorName} />
        <div className="flex-1 min-w-0">
          {isEditingThis ? (
            <div className="flex flex-col gap-1.5">
              <input
                type="text"
                value={editingCommentText}
                onChange={(e) => setEditingCommentText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveEditComment(comment.id)}
                autoFocus
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <div className="flex gap-2">
                <button onClick={() => saveEditComment(comment.id)} className="text-[11px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1 rounded-md transition-colors">
                  Save
                </button>
                <button onClick={() => setEditingCommentId(null)} className="text-[11px] font-medium text-slate-500 dark:text-slate-400 px-2.5 py-1">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-slate-50 dark:bg-slate-900/40 rounded-lg px-2.5 py-1.5">
                <button onClick={() => openProfile(comment.authorId, comment.authorName)} className="font-medium text-slate-700 dark:text-slate-200 mr-1.5 hover:text-emerald-600">
                  {comment.authorName}
                </button>
                <span className="text-slate-500 dark:text-slate-400">{comment.text}</span>
                {comment.editedAt && <span className="text-slate-300 dark:text-slate-500 text-[10px] ml-1.5">(edited)</span>}
              </div>
              <div className="flex items-center gap-2 mt-1 ml-1">
                {canInteract && !indent && (
                  <button onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)} className="text-[10px] text-slate-400 hover:text-emerald-600">
                    Reply
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {isMine && !isEditingThis && (
          <div className="relative" ref={commentMenuOpenId === comment.id ? commentMenuRef : null}>
            <button onClick={() => setCommentMenuOpenId(commentMenuOpenId === comment.id ? null : comment.id)} className="text-slate-300 hover:text-slate-500 dark:hover:text-slate-300 px-1 text-xs">
              ⋮
            </button>
            {commentMenuOpenId === comment.id && (
              <div className="absolute right-0 top-5 z-10 w-24 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg py-1">
                <button onClick={() => startEditComment(comment)} className="w-full text-left px-2.5 py-1 text-[11px] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
                  ✏️ Edit
                </button>
                <button
                  onClick={() => {
                    setCommentMenuOpenId(null);
                    handleDeleteComment(comment.id);
                  }}
                  className="w-full text-left px-2.5 py-1 text-[11px] text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  🗑️ Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
   <div
  className={`bg-white/70 dark:bg-slate-800/60 backdrop-blur-md shadow-lg shadow-slate-200/40 dark:shadow-black/20 rounded-2xl p-6 hover:shadow-xl transition-shadow ${
    post.isAnnouncement
      ? "border-2 border-rose-300 dark:border-rose-700"
      : "border border-white/40 dark:border-slate-700/60"
  }`}
>
      <div className="flex items-center gap-3 mb-3">
        <button onClick={() => openProfile(post.authorId, author?.displayName, author?.email)}>
          <div className={`w-9 h-9 rounded-full ${colorFor(post.authorId)} text-white text-sm font-semibold flex items-center justify-center shrink-0 hover:ring-2 hover:ring-emerald-400 transition-all`}>
            {initial}
          </div>
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => openProfile(post.authorId, author?.displayName, author?.email)}
              className="text-sm font-medium text-slate-800 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              {author?.displayName || "Member"}
            </button>
            {groupName && (
              <span className="text-[10px] font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/30 px-2 py-0.5 rounded-full">
                {groupName}
              </span>
            )}
            {post.pinned && (
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
                📌 Pinned
              </span>
            )}
            {post.isAnnouncement && (
  <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 px-2 py-0.5 rounded-full">
    📣 Announcement
  </span>
)}

            {post.isPoll && (
              <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">
                Poll
              </span>
            )}
            {post.visibility === "private" && (
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                🔒 Private
              </span>
            )}
          </div>
        </div>
        <span className="text-[11px] text-slate-400 whitespace-nowrap">
          {timeAgo(post.createdAt?.toMillis?.())}
          {post.editedAt && " · edited"}
        </span>

        {canManage && !isEditing && (
          <div className="relative" ref={menuRef}>
            <button onClick={() => setMenuOpen((o) => !o)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-1">
              ⋮
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-6 z-10 w-32 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg py-1">
                <button
                  onClick={async () => {
                    setMenuOpen(false);
                    try {
                      await togglePin(post.id, post.pinned);
                    } catch {
                      showToast("Couldn't update pin.", "error");
                    }
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  📌 {post.pinned ? "Unpin" : "Pin"}
                </button>
                <button
                  onClick={() => {
                    startEdit();
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    handleDelete();
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  🗑️ Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="flex flex-col gap-3 mb-3">
          <textarea
            rows={2}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          {allowVisibilityToggle && (
            <div className="flex bg-slate-100 dark:bg-slate-700 rounded-full p-0.5 w-fit">
              <button
                type="button"
                onClick={() => setEditVisibility("public")}
                className={`text-xs font-medium px-3 py-1 rounded-full transition-colors ${
                  editVisibility === "public" ? "bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"
                }`}
              >
                🌐 Public
              </button>
              <button
                type="button"
                onClick={() => setEditVisibility("private")}
                className={`text-xs font-medium px-3 py-1 rounded-full transition-colors ${
                  editVisibility === "private" ? "bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"
                }`}
              >
                🔒 Private
              </button>
            </div>
          )}

          {post.isPoll && (
            <div className="flex flex-col gap-2 bg-slate-50 dark:bg-slate-900/40 rounded-xl p-3">
              <p className="text-[11px] text-slate-400">Poll options — changing these resets all votes</p>
              {editPollOptions.map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => updateEditOption(i, e.target.value)}
                    placeholder={`Option ${i + 1}`}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {editPollOptions.length > 2 && (
                    <button type="button" onClick={() => removeEditOption(i)} className="text-slate-300 hover:text-red-400 text-xs px-1">
                      ✕
                    </button>
                  )}
                </div>
              ))}
              {editPollOptions.length < 6 && (
                <button type="button" onClick={addEditOption} className="text-xs font-medium text-emerald-600 hover:text-emerald-700 self-start">
                  + Add option
                </button>
              )}
            </div>
          )}

          <div className="flex gap-2 self-end">
            <button onClick={saveEdit} className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg transition-colors">
              Save
            </button>
            <button onClick={() => setIsEditing(false)} className="text-xs font-medium text-slate-500 dark:text-slate-400 px-3 py-1.5">
              Cancel
            </button>
          </div>
        </div>
      ) : (
<p className="text-base text-slate-700 dark:text-slate-200 mb-4 leading-relaxed">{post.text}</p>
      )}

{post.imageURL && !isEditing && (
  <div className="w-full mb-3 rounded-xl overflow-hidden relative group/img">
{post.videoURL && !isEditing && <VideoEmbed url={post.videoURL} />}
    <img
      src={post.imageURL}
      alt=""
      className={`w-full ${imageFit === "cover" ? "h-[560px] object-cover" : "max-h-[640px] object-contain bg-slate-100 dark:bg-slate-900/40"}`}
    />
    <button
      type="button"
      onClick={() => setImageFit((f) => (f === "cover" ? "contain" : "cover"))}
      title={imageFit === "cover" ? "Show full image" : "Fill frame"}
      className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/70 text-white text-xs flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
    >
      {imageFit === "cover" ? "⤢" : "⤡"}
    </button>
  </div>
)}

      {post.isPoll && !isEditing && options.length > 0 && (
        <div className="mb-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {options.map((opt) => {
            const count = Object.values(votes).filter((v) => v === opt.id).length;
            const pct = totalVotes ? Math.round((count / totalVotes) * 100) : 0;
            const selected = myVote === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => handleVote(opt.id)}
                className={`relative w-full text-left rounded-lg border-2 overflow-hidden transition-all ${
                  selected ? "border-emerald-500" : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500"
                }`}
              >
                <div
                  className={`absolute inset-y-0 left-0 transition-all duration-300 ${selected ? "bg-emerald-100 dark:bg-emerald-900/40" : "bg-slate-100 dark:bg-slate-700/50"}`}
                  style={{ width: `${pct}%` }}
                />
                <div className="relative flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200">
                  <span className="flex items-center gap-1.5">
                    {selected && <span>✓</span>} {opt.text}
                  </span>
                  <span className="text-slate-400">{pct}% ({count})</span>
                </div>
              </button>
            );
          })}
          <p className="text-[11px] text-slate-400 text-right col-span-full">{totalVotes} vote{totalVotes === 1 ? "" : "s"}</p>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${iLiked ? "text-rose-500" : "text-slate-400 hover:text-rose-400"}`}
          >
            <span>{iLiked ? "❤️" : "🤍"}</span>
            <span>{likeCount > 0 ? likeCount : "Like"}</span>
          </button>

          <button
            onClick={() => setShowComments((s) => !s)}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-emerald-600 transition-colors"
          >
            <span>💬</span>
            <span>{allComments.length > 0 ? allComments.length : "Comment"}</span>
          </button>

          {post.visibility === "public" && (
            <button onClick={handleCopyLink} className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-emerald-600 transition-colors">
              <span>🔗</span>
              <span>Copy link</span>
            </button>
          )}
        </div>
      </div>

      {showComments && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex flex-col gap-3">
          {topLevelComments.map((c) => {
            const replies = allComments.filter((r) => r.parentId === c.id);
            return (
              <div key={c.id} className="flex flex-col gap-2">
                <CommentRow comment={c} indent={false} />

                {replies.map((r) => (
                  <CommentRow key={r.id} comment={r} indent={true} />
                ))}

                {replyingTo === c.id && (
                  <div className="flex gap-2 ml-8">
                    <input
                      type="text"
                      value={replyDraft}
                      onChange={(e) => setReplyDraft(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddComment(c.id)}
                      placeholder={`Reply to ${c.authorName}…`}
                      autoFocus
                      className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button onClick={() => handleAddComment(c.id)} className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-3 rounded-lg transition-colors">
                      Send
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {canInteract && (
            <div className="flex gap-2">
              <input
                type="text"
                value={commentDraft}
                onChange={(e) => setCommentDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                placeholder="Write a comment…"
                className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button onClick={() => handleAddComment()} className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-3 rounded-lg transition-colors">
                Send
              </button>
            </div>
          )}
        </div>
      )}

      {viewingProfile && (
        <UserProfilePopover
          profile={viewingProfile}
          currentUserId={userId}
          currentUserFriends={userFriends}
          onClose={() => setViewingProfile(null)}
        />
      )}
    </div>
  );
}