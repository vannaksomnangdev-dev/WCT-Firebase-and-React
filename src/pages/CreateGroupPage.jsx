import { useState, useRef, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useToast } from "../contexts/ToastContext.jsx";
import { createGroup } from "../hooks/useGroups.js";
import Navbar from "../components/Navbar.jsx";
import React from "react";

const ICONS = ["👥", "🎮", "🎨", "📚", "🏠", "💼", "🚀", "🎯"];
const CATEGORIES = ["Game Dev", "Web Dev", "Design", "School Project", "Study Group", "Other"];
const AVATAR_COLORS = ["bg-emerald-500", "bg-sky-500", "bg-amber-500", "bg-fuchsia-500", "bg-rose-500", "bg-indigo-500"];

function colorForIcon(icon) {
  let sum = 0;
  for (let i = 0; i < icon.length; i++) sum += icon.charCodeAt(i);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

export default function CreateGroupPage() {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState(ICONS[0]);

  const [photoURL, setPhotoURL] = useState("");
  const [urlDraft, setUrlDraft] = useState("");
  const [photoError, setPhotoError] = useState(false);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTab, setPickerTab] = useState("icon");
  const pickerRef = useRef(null);

  const [category, setCategory] = useState(CATEGORIES[0]);
  const [isPublic, setIsPublic] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    function handleClickOutside(e) {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setPickerOpen(false);
      }
    }
    if (pickerOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [pickerOpen]);

  if (!authLoading && !user) return <Navigate to="/" replace />;

  function commitUrl() {
    if (!urlDraft.trim()) {
      setPhotoURL("");
      setPhotoError(false);
      return;
    }
    setPhotoError(false);
    setPhotoURL(urlDraft.trim());
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) {
      showToast("Give your group a name first.", "error");
      return;
    }
    setCreating(true);
    try {
      const ref = await createGroup(user.uid, {
        name: name.trim(),
        description: description.trim(),
        icon,
        photoURL: photoError ? "" : photoURL,
        category,
        isPublic,
      });
      showToast("Group created successfully!");
      navigate(`/groups/${ref.id}`);
    } catch {
      showToast("Couldn't create group.", "error");
      setCreating(false);
    }
  }

  const showPhoto = photoURL && !photoError;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-12">
      <Navbar />
      <main className="max-w-lg mx-auto px-4 pt-10">
        <div className="mb-6 transition-all duration-500">
          <h1 className="text-2xl font-extrabold tracking-tight text-white mb-1">Create a Group</h1>
          <p className="text-sm text-slate-400">
            Shape your community space — customize it however you like.
          </p>
        </div>

        <form
          onSubmit={handleCreate}
          className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 shadow-2xl rounded-3xl p-6 flex flex-col gap-6 transition-all duration-300"
        >
          {/* Avatar / Icon picker */}
          <div className="flex flex-col items-center gap-2 relative" ref={pickerRef}>
            <button
              type="button"
              onClick={() => setPickerOpen((o) => !o)}
              className={`w-24 h-24 rounded-2xl flex items-center justify-center text-4xl overflow-hidden shrink-0 ring-4 ring-slate-800 hover:ring-emerald-500/50 transition-all shadow-inner ${
                showPhoto ? "bg-slate-800" : colorForIcon(icon)
              }`}
            >
              {showPhoto ? (
                <img
                  src={photoURL}
                  alt="Group"
                  className="w-full h-full object-cover"
                  onError={() => setPhotoError(true)}
                />
              ) : (
                <span className="text-white drop-shadow-md">{icon}</span>
              )}
            </button>
            <span className="text-xs text-emerald-400 font-medium cursor-pointer hover:underline">
              ✨ Click to change icon or image
            </span>

            {pickerOpen && (
              <div className="absolute top-28 z-20 w-72 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex bg-slate-800 rounded-xl p-1 mb-3">
                  <button
                    type="button"
                    onClick={() => setPickerTab("icon")}
                    className={`flex-1 text-xs font-semibold py-1.5 rounded-lg transition-all ${
                      pickerTab === "icon" ? "bg-emerald-600 text-white shadow" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Emojis
                  </button>
                  <button
                    type="button"
                    onClick={() => setPickerTab("url")}
                    className={`flex-1 text-xs font-semibold py-1.5 rounded-lg transition-all ${
                      pickerTab === "url" ? "bg-emerald-600 text-white shadow" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Image URL
                  </button>
                </div>

                {pickerTab === "icon" ? (
                  <div className="grid grid-cols-4 gap-2">
                    {ICONS.map((i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setIcon(i);
                          setPhotoURL("");
                          setPickerOpen(false);
                        }}
                        className={`w-12 h-12 rounded-xl text-xl flex items-center justify-center border transition-all ${
                          icon === i && !showPhoto
                            ? "border-emerald-500 bg-emerald-500/20 scale-105"
                            : "border-slate-800 bg-slate-800/50 hover:bg-slate-800"
                        }`}
                      >
                        {i}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      value={urlDraft}
                      onChange={(e) => setUrlDraft(e.target.value)}
                      placeholder="Paste image link..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        commitUrl();
                        setPickerOpen(false);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 rounded-xl transition-all"
                    >
                      Apply Image
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Group Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Cyberpunk Builders"
              className="w-full px-4 py-3 rounded-xl border border-slate-700/80 bg-slate-800/60 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this community all about?"
              className="w-full px-4 py-3 rounded-xl border border-slate-700/80 bg-slate-800/60 text-slate-100 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">Category</label>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`text-xs font-semibold px-3.5 py-2 rounded-xl transition-all duration-200 ${
                    category === c
                      ? "bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20 scale-105"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Glowing Public Toggle Card */}
          <div
            onClick={() => setIsPublic(!isPublic)}
            className={`cursor-pointer border rounded-2xl p-4 flex items-center justify-between transition-all duration-300 ${
              isPublic
                ? "bg-emerald-500/10 border-emerald-500/50 shadow-lg shadow-emerald-500/10"
                : "bg-slate-800/40 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">🌐</span>
              <div>
                <p className="text-sm font-bold text-slate-200">Public Community</p>
                <p className="text-xs text-slate-400">Anyone can discover and join without an invite code.</p>
              </div>
            </div>
            {/* Animated Switch Pill */}
            <div className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${isPublic ? "bg-emerald-500" : "bg-slate-700"}`}>
              <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${isPublic ? "translate-x-5" : "translate-x-0"}`} />
            </div>
          </div>

          <button
            type="submit"
            disabled={creating}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-sm py-3.5 rounded-xl shadow-xl shadow-emerald-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {creating ? "Launching Community…" : "Create Group 🚀"}
          </button>
        </form>
      </main>
    </div>
  );
}