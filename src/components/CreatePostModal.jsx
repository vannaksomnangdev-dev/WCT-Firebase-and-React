import { useState, useRef, useEffect } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase.js";
import { useToast } from "../../contexts/ToastContext.jsx";

export default function CreatePostModal({ isOpen, onClose, userId, userName, userGroups = [], defaultGroupId = null }) {
    
  const { showToast } = useToast();
  const [text, setText] = useState("");
  const [visibility, setVisibility] = useState("public");
  
  // Media & Poll states
  const [showImageInput, setShowImageInput] = useState(false);
  const [imageURL, setImageURL] = useState("");
  const [showVideoInput, setShowVideoInput] = useState(false);
  const [videoURL, setVideoURL] = useState("");
  const [isPoll, setIsPoll] = useState(false);
  const [pollOptions, setPollOptions] = useState(["", ""]);

  // Group recommendation / attachment state
  const [selectedGroupId, setSelectedGroupId] = useState(defaultGroupId || "");
  const [showGroupSelector, setShowGroupSelector] = useState(false);

  const groupDropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (groupDropdownRef.current && !groupDropdownRef.current.contains(e.target)) {
        setShowGroupSelector(false);
      }
    }
    if (showGroupSelector) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showGroupSelector]);

  if (!isOpen) return null;

  const selectedGroup = userGroups.find((g) => g.id === selectedGroupId);

  async function handleCreatePost(e) {
    e.preventDefault();
    if (!text.trim() && !imageURL.trim()) {
      showToast("Please write something or add an image.", "error");
      return;
    }

    try {
      const postData = {
        authorId: userId,
        text: text.trim(),
        visibility,
        createdAt: serverTimestamp(),
        imageURL: imageURL.trim() || null,
        videoURL: videoURL.trim() || null,
        isPoll,
        pollOptions: isPoll
          ? pollOptions.filter((opt) => opt.trim()).map((opt, i) => ({ id: `opt${i}`, text: opt.trim() }))
          : null,
        groupId: selectedGroupId || null,
        groupName: selectedGroup ? selectedGroup.name : null,
      };

      await addDoc(collection(db, "posts"), postData);
      showToast("Post created successfully!");
      onClose();
    } catch (err) {
      console.error(err);
      showToast("Failed to create post.", "error");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">New Post</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleCreatePost} className="p-6 flex flex-col gap-4">
          
          {/* Main Text Area */}
          <textarea
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />

          {/* Attached Group Recommendation Banner Preview (if selected) */}
          {selectedGroup && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-600 to-violet-600 text-white shadow-md">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center text-base font-bold">
                  👥
                </span>
                <div>
                  <span className="block text-[9px] uppercase tracking-wider font-extrabold text-sky-200">
                    Recommended Community Group
                  </span>
                  <span className="text-sm font-black tracking-wide underline underline-offset-2">
                    {selectedGroup.name} ↗
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedGroupId("")}
                className="text-xs bg-white/20 hover:bg-white/30 px-2.5 py-1.5 rounded-lg backdrop-blur-md transition-colors"
              >
                Remove ✕
              </button>
            </div>
          )}

          {/* Conditional Image Input */}
          {showImageInput && (
            <div className="flex gap-2 items-center">
              <input
                type="url"
                value={imageURL}
                onChange={(e) => setImageURL(e.target.value)}
                placeholder="Paste Image URL..."
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => { setShowImageInput(false); setImageURL(""); }}
                className="text-slate-400 hover:text-red-500 text-xs px-2 py-1"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Conditional Video Input */}
          {showVideoInput && (
            <div className="flex gap-2 items-center">
              <input
                type="url"
                value={videoURL}
                onChange={(e) => setVideoURL(e.target.value)}
                placeholder="Paste YouTube / Video URL..."
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => { setShowVideoInput(false); setVideoURL(""); }}
                className="text-slate-400 hover:text-red-500 text-xs px-2 py-1"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Poll Creator */}
          {isPoll && (
            <div className="flex flex-col gap-2 bg-slate-50 dark:bg-slate-900/40 rounded-xl p-3 border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Create a Poll</span>
                <button
                  type="button"
                  onClick={() => { setIsPoll(false); setPollOptions(["", ""]); }}
                  className="text-xs text-red-500 hover:underline"
                >
                  Remove Poll
                </button>
              </div>
              {pollOptions.map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const next = [...pollOptions];
                      next[i] = e.target.value;
                      setPollOptions(next);
                    }}
                    placeholder={`Option ${i + 1}`}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {pollOptions.length > 2 && (
                    <button
                      type="button"
                      onClick={() => setPollOptions(pollOptions.filter((_, idx) => idx !== i))}
                      className="text-slate-400 hover:text-red-500 text-xs px-1.5"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              {pollOptions.length < 6 && (
                <button
                  type="button"
                  onClick={() => setPollOptions([...pollOptions, ""])}
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline self-start mt-1"
                >
                  + Add Option
                </button>
              )}
            </div>
          )}

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setShowImageInput((s) => !s)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors"
            >
              🖼️ Image
            </button>

            <button
              type="button"
              onClick={() => setShowVideoInput((s) => !s)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors"
            >
              📹 Video
            </button>

            {!isPoll && (
              <button
                type="button"
                onClick={() => setIsPoll(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors"
              >
                📊 Poll
              </button>
            )}

            {/* Group Recommendation Toggle / Dropdown */}
            <div className="relative" ref={groupDropdownRef}>
              <button
                type="button"
                onClick={() => setShowGroupSelector((s) => !s)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedGroupId
                    ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 font-semibold"
                    : "bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                }`}
              >
                👥 Recommend Group
              </button>

              {showGroupSelector && (
                <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1.5 z-20">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Select Group to Feature
                  </div>
                  {userGroups.length === 0 ? (
                    <div className="px-3 py-2 text-xs text-slate-400">No groups available.</div>
                  ) : (
                    userGroups.map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => {
                          setSelectedGroupId(g.id);
                          setShowGroupSelector(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
                          selectedGroupId === g.id ? "text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50/50 dark:bg-indigo-900/20" : "text-slate-700 dark:text-slate-200"
                        }`}
                      >
                        <span className="truncate">{g.name}</span>
                        {selectedGroupId === g.id && <span>✓</span>}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Visibility Toggles */}
            <div className="flex bg-slate-100 dark:bg-slate-700/60 rounded-full p-0.5 ml-auto">
              <button
                type="button"
                onClick={() => setVisibility("public")}
                className={`text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
                  visibility === "public"
                    ? "bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-white"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                🌐 Public
              </button>
              <button
                type="button"
                onClick={() => setVisibility("private")}
                className={`text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
                  visibility === "private"
                    ? "bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-white"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                🔒 Private
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-lg shadow-emerald-600/20 transition-all"
            >
              Post
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}