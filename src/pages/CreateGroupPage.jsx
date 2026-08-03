import { useState, useRef, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useToast } from "../contexts/ToastContext.jsx";
import { createGroup } from "../hooks/useGroups.js";
import Navbar from "../components/Navbar.jsx";

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

  // photoURL is the committed, "in use" value. urlDraft is what's being typed —
  // they're kept separate so an in-progress URL never shows an error mid-typing.
  const [photoURL, setPhotoURL] = useState("");
  const [urlDraft, setUrlDraft] = useState("");
  const [photoError, setPhotoError] = useState(false);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTab, setPickerTab] = useState("icon"); // "icon" | "url"
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

  function handleUrlKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      commitUrl();
      setPickerOpen(false);
    }
  }

  function pickIcon(i) {
    setIcon(i);
    setPhotoURL("");
    setUrlDraft("");
    setPhotoError(false);
    setPickerOpen(false);
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
      showToast("Group created");
      navigate(`/groups/${ref.id}`);
    } catch {
      showToast("Couldn't create group.", "error");
      setCreating(false);
    }
  }

  const showPhoto = photoURL && !photoError;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-8">
        <div className="fade-in-section" style={{ animationDelay: "0ms" }}>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">Create a Group</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Set up its profile — you can always change this later.
          </p>
        </div>

        <form
          onSubmit={handleCreate}
          className="bg-white/80 dark:bg-slate-800/70 backdrop-blur-sm border border-white/40 dark:border-slate-700/60 shadow-xl shadow-slate-200/50 dark:shadow-black/20 rounded-3xl p-6 flex flex-col gap-5 fade-in-section"
          style={{ animationDelay: "60ms" }}
        >
          {/* Profile picture / icon picker */}
          <div className="flex flex-col items-center gap-2 relative" ref={pickerRef}>
            <button
              type="button"
              onClick={() => setPickerOpen((o) => !o)}
              className={`w-24 h-24 rounded-2xl flex items-center justify-center text-4xl overflow-hidden shrink-0 ring-2 ring-transparent hover:ring-emerald-400 transition-all ${
                showPhoto ? "bg-slate-100 dark:bg-slate-700" : colorForIcon(icon)
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
                <span className="text-white">{icon}</span>
              )}
            </button>
            <span className="text-[11px] text-slate-400">Click to change</span>

            {pickerOpen && (
              <div className="absolute top-28 z-10 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl shadow-lg p-3">
                <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1 mb-3">
                  <button
                    type="button"
                    onClick={() => setPickerTab("icon")}
                    className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${
                      pickerTab === "icon"
                        ? "bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-white"
                        : "text-slate-500 dark:text-slate-300"
                    }`}
                  >
                    Choose icon
                  </button>
                  <button
                    type="button"
                    onClick={() => setPickerTab("url")}
                    className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${
                      pickerTab === "url"
                        ? "bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-white"
                        : "text-slate-500 dark:text-slate-300"
                    }`}
                  >
                    Image link
                  </button>
                </div>

                {pickerTab === "icon" ? (
                  <div className="grid grid-cols-4 gap-2">
                    {ICONS.map((i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => pickIcon(i)}
                        className={`w-12 h-12 rounded-lg text-xl flex items-center justify-center border transition-colors ${
                          icon === i && !showPhoto
                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30"
                            : "border-slate-200 dark:border-slate-600"
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
                      onKeyDown={handleUrlKeyDown}
                      placeholder="https://…"
                      autoFocus
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        commitUrl();
                        setPickerOpen(false);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors"
                    >
                      Use this image
                    </button>
                    <p className="text-[10px] text-slate-400 text-center">Leave blank and press this to go back to icons</p>
                  </div>
                )}
              </div>
            )}

            {photoError && (
              <p className="text-[11px] text-red-400">Couldn't load that image — showing the icon instead.</p>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Group name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Lane Defense Devs"
              className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Description (optional)</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this group about?"
              className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Category</label>
            <div className="flex gap-2 flex-wrap mt-1">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                    category === c
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-500 dark:text-slate-400">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="rounded border-slate-300 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500"
            />
            🌐 Make this group public (anyone can find and join, no code needed)
          </label>

          <button
            type="submit"
            disabled={creating}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
          >
            {creating ? "Creating…" : "Create Group"}
          </button>
        </form>
      </main>
    </div>
  );
}