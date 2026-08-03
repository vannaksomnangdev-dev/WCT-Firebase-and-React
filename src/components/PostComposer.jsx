import { useState } from "react";
import ImageDropInput from "./ImageDropInput.jsx";
import { getEmbedUrl } from "../utils/videoEmbed.js";

export default function PostComposer({ onSubmit, showVisibilityToggle = false, visibilityLabels, placeholder = "What's on your mind?", showAnnouncementToggle = false }) {
  const [text, setText] = useState("");
  const [imageURL, setImageURL] = useState("");
  const [showImageField, setShowImageField] = useState(false);
  const [isPoll, setIsPoll] = useState(false);
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [visibility, setVisibility] = useState("public");
  const [posting, setPosting] = useState(false);
  const [videoURL, setVideoURL] = useState("");
  const [isAnnouncement, setIsAnnouncement] = useState(false);

const [showVideoField, setShowVideoField] = useState(false);

  function updateOption(i, value) {
    setPollOptions((opts) => opts.map((o, idx) => (idx === i ? value : o)));
  }

  function addOption() {
    if (pollOptions.length < 6) setPollOptions((opts) => [...opts, ""]);
  }

  function removeOption(i) {
    if (pollOptions.length > 2) setPollOptions((opts) => opts.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    if (isPoll && pollOptions.filter((o) => o.trim()).length < 2) return;
    setPosting(true);
    try {
await onSubmit({
  text: text.trim(),
  imageURL,
  videoURL: videoURL.trim(),
  isPoll,
  pollOptions: isPoll ? pollOptions : [],
  isAnnouncement,
  visibility,
});
setText("");
setImageURL("");
setShowImageField(false);
setVideoURL("");
setShowVideoField(false);
setIsPoll(false);
setPollOptions(["", ""]);
setIsAnnouncement(false);
    } finally {
      setPosting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <textarea
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        autoFocus
        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />

      {showImageField && <ImageDropInput value={imageURL} onChange={setImageURL} onError={() => {}} />}
{showVideoField && (
  <div className="flex flex-col gap-1">
    <input
      type="text"
      value={videoURL}
      onChange={(e) => setVideoURL(e.target.value)}
      placeholder="Paste a YouTube or Vimeo link…"
      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
    />
    {videoURL.trim() && !getEmbedUrl(videoURL) && (
      <p className="text-[11px] text-amber-500">Only YouTube and Vimeo links are supported right now.</p>
    )}
  </div>
)}

      {isPoll && (
        <div className="flex flex-col gap-2 bg-slate-50 dark:bg-slate-900/40 rounded-xl p-3">
          <p className="text-[11px] text-slate-400">Poll options</p>
          {pollOptions.map((opt, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={opt}
                onChange={(e) => updateOption(i, e.target.value)}
                placeholder={`Option ${i + 1}`}
                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {pollOptions.length > 2 && (
                <button type="button" onClick={() => removeOption(i)} className="text-slate-300 hover:text-red-400 text-xs px-1">
                  ✕
                </button>
              )}
            </div>
          ))}
          {pollOptions.length < 6 && (
            <button type="button" onClick={addOption} className="text-xs font-medium text-emerald-600 hover:text-emerald-700 self-start">
              + Add option
            </button>
          )}
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowImageField((s) => !s)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
              showImageField ? "bg-emerald-600 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
            }`}
          >
            🖼️ Image
          </button>

          <button
  type="button"
  onClick={() => setShowVideoField((s) => !s)}
  className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
    showVideoField ? "bg-emerald-600 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
  }`}
>
  🎬 Video
</button>


          <button
            type="button"
            onClick={() => setIsPoll((p) => !p)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
              isPoll ? "bg-amber-500 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
            }`}
          >
            🗳️ Poll
          </button>
          {showAnnouncementToggle && (
  <button
    type="button"
    onClick={() => setIsAnnouncement((a) => !a)}
    className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
      isAnnouncement ? "bg-rose-500 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
    }`}
  >
    📣 Announcement
  </button>
)}

          {showVisibilityToggle && (
            <div className="flex bg-slate-100 dark:bg-slate-700 rounded-full p-0.5">
              <button
                type="button"
                onClick={() => setVisibility("public")}
                className={`text-xs font-medium px-3 py-1 rounded-full transition-colors ${
                  visibility === "public" ? "bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {visibilityLabels?.public || "🌐 Public"}
              </button>
              <button
                type="button"
                onClick={() => setVisibility("private")}
                className={`text-xs font-medium px-3 py-1 rounded-full transition-colors ${
                  visibility === "private" ? "bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {visibilityLabels?.private || "🔒 Private"}
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={posting}
          className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          Post
        </button>
      </div>
    </form>
  );
}