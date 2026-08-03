import { useEffect } from "react";
import PostComposer from "../PostComposer.jsx";

export default function ComposerDrawer({ isOpen, onClose, onSubmit, title = "New Post", placeholder, showVisibilityToggle = false, visibilityLabels, showAnnouncementToggle = false }) {
  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", isOpen);
    return () => document.body.classList.remove("overflow-hidden");
  }, [isOpen]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-200 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-l border-white/40 dark:border-slate-700/60 shadow-2xl z-50 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl leading-none">
            &times;
          </button>
        </div>
        <div className="p-5">
       <PostComposer
  placeholder={placeholder}
  showVisibilityToggle={showVisibilityToggle}
  showAnnouncementToggle={showAnnouncementToggle}
  visibilityLabels={visibilityLabels}
  onSubmit={async (data) => {
    await onSubmit(data);
    onClose();
  }}
/>
        </div>
      </div>
    </>
  );
}