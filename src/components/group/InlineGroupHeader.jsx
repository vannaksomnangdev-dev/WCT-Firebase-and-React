import { useState } from "react";
import { createPortal } from "react-dom";
import { updateGroup } from "../../hooks/useGroups.js";
import { useToast } from "../../contexts/ToastContext.jsx";
import ImageDropInput from "../ImageDropInput.jsx";

const ICONS = ["👥", "🎮", "🎨", "📚", "🏠", "💼", "🚀", "🎯"];
const ICON_COLORS = [
  { name: "Emerald", value: "bg-emerald-600" },
  { name: "Sky", value: "bg-sky-600" },
  { name: "Amber", value: "bg-amber-600" },
  { name: "Rose", value: "bg-rose-600" },
  { name: "Violet", value: "bg-violet-600" },
  { name: "Slate", value: "bg-slate-600" },
];

export default function InlineGroupHeader({ group, isOwner }) {
  const { showToast } = useToast();

  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(group.name);

  const [editingDesc, setEditingDesc] = useState(false);
  const [descDraft, setDescDraft] = useState(group.description || "");

  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTab, setPickerTab] = useState("icon"); // icon | text | photo
  const [textDraft, setTextDraft] = useState(group.iconText || "");

  async function saveName() {
    setEditingName(false);
    if (!nameDraft.trim() || nameDraft.trim() === group.name) {
      setNameDraft(group.name);
      return;
    }
    try {
      await updateGroup(group.id, { name: nameDraft.trim() });
      showToast("Name updated successfully! ✨");
    } catch {
      showToast("Couldn't save name.", "error");
      setNameDraft(group.name);
    }
  }

  async function saveDescription() {
    setEditingDesc(false);
    if (descDraft.trim() === (group.description || "")) return;
    try {
      await updateGroup(group.id, { description: descDraft.trim() });
      showToast("Description updated successfully! ✨");
    } catch {
      showToast("Couldn't save description.", "error");
      setDescDraft(group.description || "");
    }
  }

  async function pickIcon(icon) {
    try {
      await updateGroup(group.id, { icon, iconText: "", photoURL: "" });
      showToast("Community icon updated! 🚀");
    } catch {
      showToast("Couldn't update icon.", "error");
    }
  }

  async function saveText() {
    if (!textDraft.trim()) return;
    try {
      await updateGroup(group.id, { iconText: textDraft.trim().slice(0, 2), icon: "", photoURL: "" });
      showToast("Community initials updated! 🚀");
      setPickerOpen(false);
    } catch {
      showToast("Couldn't update icon.", "error");
    }
  }

  async function pickIconColor(colorClass) {
    try {
      await updateGroup(group.id, { iconBgColor: colorClass });
      showToast("Brand color updated! 🎨");
    } catch {
      showToast("Couldn't update color.", "error");
    }
  }

  async function setPhoto(url) {
    try {
      await updateGroup(group.id, { photoURL: url });
      if (url) {
        showToast("Community photo updated successfully! 📸");
        setPickerOpen(false);
      }
    } catch {
      showToast("Couldn't update photo.", "error");
    }
  }

  const bgColor = group.iconBgColor || "bg-emerald-600";

  return (
    <>
      <div className="relative group/avatar">
        <button 
          onClick={() => isOwner && setPickerOpen(true)} 
          className={`relative rounded-3xl overflow-hidden transition-transform duration-300 ${isOwner ? "cursor-pointer hover:scale-105" : "cursor-default"}`}
          title={isOwner ? "Click to change group avatar/icon" : ""}
        >
          {group.photoURL ? (
            <img
              src={group.photoURL}
              alt={group.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover ring-4 ring-white/90 dark:ring-slate-800 shadow-xl shrink-0 transition-all"
            />
          ) : (
            <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl ${bgColor} text-white text-3xl font-extrabold flex items-center justify-center ring-4 ring-white/90 dark:ring-slate-800 shadow-xl shrink-0 transition-all`}>
              {group.iconText || group.icon || "👥"}
            </div>
          )}

          {isOwner && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold rounded-3xl">
              📷 Edit
            </div>
          )}
        </button>

        {pickerOpen &&
          createPortal(
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn"
              onClick={(e) => e.target === e.currentTarget && setPickerOpen(false)}
            >
              <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xl rounded-3xl w-full max-w-sm p-6 flex flex-col gap-4">
                
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🎨</span>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Customize Community Icon</h3>
                  </div>
                  <button 
                    onClick={() => setPickerOpen(false)} 
                    className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
                  >
                    &times;
                  </button>
                </div>

                {/* Tabs Switcher */}
                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-2xl p-1 gap-1">
                  <button
                    onClick={() => setPickerTab("icon")}
                    className={`flex-1 text-xs font-bold py-2 rounded-xl transition-all ${
                      pickerTab === "icon" ? "bg-white dark:bg-slate-700 shadow-md text-emerald-600 dark:text-emerald-400" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    ✨ Emoji
                  </button>
                  <button
                    onClick={() => setPickerTab("text")}
                    className={`flex-1 text-xs font-bold py-2 rounded-xl transition-all ${
                      pickerTab === "text" ? "bg-white dark:bg-slate-700 shadow-md text-emerald-600 dark:text-emerald-400" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    🔤 Initials
                  </button>
                  <button
                    onClick={() => setPickerTab("photo")}
                    className={`flex-1 text-xs font-bold py-2 rounded-xl transition-all ${
                      pickerTab === "photo" ? "bg-white dark:bg-slate-700 shadow-md text-emerald-600 dark:text-emerald-400" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    🖼️ Photo
                  </button>
                </div>

                {/* Tab: Emojis */}
                {pickerTab === "icon" && (
                  <div className="grid grid-cols-4 gap-2.5 py-2">
                    {ICONS.map((i) => (
                      <button
                        key={i}
                        onClick={() => pickIcon(i)}
                        className="h-14 rounded-2xl text-2xl flex items-center justify-center bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700 hover:border-emerald-500 hover:scale-105 transition-all shadow-sm"
                      >
                        {i}
                      </button>
                    ))}
                  </div>
                )}

                {/* Tab: Text Initials */}
                {pickerTab === "text" && (
                  <div className="flex flex-col gap-3 py-2">
                    <p className="text-xs text-slate-400 font-medium">Type up to 2 characters for your badge initials:</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={textDraft}
                        onChange={(e) => setTextDraft(e.target.value)}
                        maxLength={2}
                        placeholder="TP"
                        className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-base text-center font-extrabold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
                      />
                      <button 
                        onClick={saveText} 
                        className="text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-5 rounded-2xl transition-all shadow-md shadow-emerald-500/20"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}

                {/* Tab: Photo Drop */}
                {pickerTab === "photo" && (
                  <div className="py-2">
                    <ImageDropInput value={group.photoURL || ""} onChange={setPhoto} onError={(msg) => showToast(msg, "error")} />
                  </div>
                )}

                {/* Background Colors Selection (for emojis/text) */}
                {pickerTab !== "photo" && (
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                    <p className="text-xs font-semibold text-slate-400 mb-2">Background Color Theme</p>
                    <div className="grid grid-cols-6 gap-2">
                      {ICON_COLORS.map((c) => (
                        <button
                          key={c.value}
                          onClick={() => pickIconColor(c.value)}
                          className={`h-9 rounded-xl ${c.value} border-2 transition-all shadow-sm hover:scale-105 ${
                            bgColor === c.value ? "border-white ring-2 ring-emerald-500 scale-105" : "border-transparent"
                          }`}
                          title={c.name}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>,
            document.body
          )}
      </div>

      {/* Header Info details text */}
      <div className="flex-1 min-w-0 pt-1 flex flex-col gap-1">
        <div className="flex items-center gap-2.5 flex-wrap">
          {editingName ? (
            <input
              type="text"
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onBlur={saveName}
              onKeyDown={(e) => e.key === "Enter" && saveName()}
              autoFocus
              className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white bg-white dark:bg-slate-800 border-2 border-emerald-500 rounded-2xl px-3 py-1 focus:outline-none shadow-md w-full max-w-md"
            />
          ) : (
            <h1
              onClick={() => isOwner && setEditingName(true)}
              className={`text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight ${
                isOwner ? "cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group/title flex items-center gap-2" : ""
              }`}
              title={isOwner ? "Click to edit community name" : ""}
            >
              {group.name}
              {isOwner && <span className="text-xs opacity-0 group-hover/title:opacity-100 transition-opacity">✏️</span>}
            </h1>
          )}

          <div className="flex items-center gap-1.5 flex-wrap">
            {group.category && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full shadow-sm">
                🏷️ {group.category}
              </span>
            )}
            {group.isPublic && (
              <span className="text-xs font-bold text-sky-600 dark:text-sky-400 bg-sky-500/10 border border-sky-500/20 px-3 py-1 rounded-full shadow-sm">
                🌐 Public Community
              </span>
            )}
          </div>
        </div>

        {editingDesc ? (
          <textarea
            rows={2}
            value={descDraft}
            onChange={(e) => setDescDraft(e.target.value)}
            onBlur={saveDescription}
            autoFocus
            className="mt-1 w-full text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border-2 border-emerald-500 rounded-2xl p-3 resize-none focus:outline-none shadow-md"
          />
        ) : (
          <p
            onClick={() => isOwner && setEditingDesc(true)}
            className={`text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl ${
              isOwner ? "cursor-pointer hover:text-slate-800 dark:hover:text-slate-200 transition-colors group/desc" : ""
            }`}
            title={isOwner ? "Click to edit description" : ""}
          >
            {group.description || (isOwner ? "✨ Click here to add a catching description for your community..." : "Explore this community and join discussions.")}
          </p>
        )}
      </div>
    </>
  );
}