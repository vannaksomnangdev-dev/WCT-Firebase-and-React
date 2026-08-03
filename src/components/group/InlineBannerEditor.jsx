import { useState } from "react";
import { updateGroup } from "../../hooks/useGroups.js";
import { useToast } from "../../contexts/ToastContext.jsx";
import ImageDropInput from "../ImageDropInput.jsx";
import { createPortal } from "react-dom";

const COLORS = [
  { name: "Emerald", value: "bg-emerald-500" },
  { name: "Sky", value: "bg-sky-500" },
  { name: "Amber", value: "bg-amber-500" },
  { name: "Rose", value: "bg-rose-500" },
  { name: "Violet", value: "bg-violet-500" },
  { name: "Slate", value: "bg-slate-500" },
];

export default function InlineBannerEditor({ group, isOwner }) {
  const { showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [tab, setTab] = useState("color");

  async function pickColor(colorClass) {
    try {
      await updateGroup(group.id, { bannerColor: colorClass, bannerPhotoURL: "" });
      showToast("Banner updated");
      setModalOpen(false);
    } catch {
      showToast("Couldn't update banner.", "error");
    }
  }

  async function setBannerPhoto(url) {
    try {
      await updateGroup(group.id, { bannerPhotoURL: url });
      if (url) {
        showToast("Banner updated");
        setModalOpen(false);
      }
    } catch {
      showToast("Couldn't update banner.", "error");
    }
  }

  if (!isOwner) return null;

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="absolute inset-0 group cursor-pointer"
        aria-label="Change banner"
      >
        <span className="absolute top-2 right-2 text-[10px] font-medium text-white bg-black/40 px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          Change banner
        </span>
      </button>

{modalOpen && createPortal(
  <div
    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}
  >
          <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-white/40 dark:border-slate-700/60 shadow-2xl rounded-2xl w-full max-w-xs p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Change banner</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl leading-none">
                &times;
              </button>
            </div>

            <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1 mb-3">
              <button
                onClick={() => setTab("color")}
                className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${
                  tab === "color" ? "bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-300"
                }`}
              >
                Color
              </button>
              <button
                onClick={() => setTab("photo")}
                className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${
                  tab === "photo" ? "bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-300"
                }`}
              >
                Photo
              </button>
            </div>

            {tab === "color" ? (
              <div className="grid grid-cols-3 gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => pickColor(c.value)}
                    className={`h-12 rounded-lg ${c.value} border-2 transition-all ${
                      group.bannerColor === c.value && !group.bannerPhotoURL ? "border-white ring-2 ring-emerald-400" : "border-transparent"
                    }`}
                    title={c.name}
                  />
                ))}
              </div>
            ) : (
              <ImageDropInput value={group.bannerPhotoURL || ""} onChange={setBannerPhoto} onError={(msg) => showToast(msg, "error")} />
            )}
</div>
        </div>,
        document.body
      )}
    </>
  );
}