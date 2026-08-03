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
      showToast("Name updated");
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
      showToast("Description updated");
    } catch {
      showToast("Couldn't save description.", "error");
      setDescDraft(group.description || "");
    }
  }

  async function pickIcon(icon) {
    try {
      await updateGroup(group.id, { icon, iconText: "", photoURL: "" });
      showToast("Icon updated");
    } catch {
      showToast("Couldn't update icon.", "error");
    }
  }

  async function saveText() {
    if (!textDraft.trim()) return;
    try {
      await updateGroup(group.id, { iconText: textDraft.trim().slice(0, 2), icon: "", photoURL: "" });
      showToast("Icon updated");
      setPickerOpen(false);
    } catch {
      showToast("Couldn't update icon.", "error");
    }
  }

  async function pickIconColor(colorClass) {
    try {
      await updateGroup(group.id, { iconBgColor: colorClass });
    } catch {
      showToast("Couldn't update color.", "error");
    }
  }

  async function setPhoto(url) {
    try {
      await updateGroup(group.id, { photoURL: url });
      if (url) {
        showToast("Photo updated");
        setPickerOpen(false);
      }
    } catch {
      showToast("Couldn't update photo.", "error");
    }
  }

  const bgColor = group.iconBgColor || "bg-emerald-600";

  return (
    <>
      <div>
        <button onClick={() => isOwner && setPickerOpen(true)} className={isOwner ? "cursor-pointer" : "cursor-default"}>
          {group.photoURL ? (
            <img
              src={group.photoURL}
              alt={group.name}
              className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white/80 dark:ring-slate-800 shrink-0 hover:opacity-90 transition-opacity"
            />
          ) : (
            <div className={`w-16 h-16 rounded-2xl ${bgColor} text-white text-2xl font-bold flex items-center justify-center ring-4 ring-white/80 dark:ring-slate-800 shrink-0 hover:opacity-90 transition-opacity`}>
              {group.iconText || group.icon || "👥"}
            </div>
          )}
        </button>

        {pickerOpen &&
          createPortal(
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={(e) => e.target === e.currentTarget && setPickerOpen(false)}
            >
              <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-white/40 dark:border-slate-700/60 shadow-2xl rounded-2xl w-full max-w-xs p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Change icon</h3>
                  <button onClick={() => setPickerOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl leading-none">
                    &times;
                  </button>
                </div>

                <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1 mb-3">
                  <button
                    onClick={() => setPickerTab("icon")}
                    className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${
                      pickerTab === "icon" ? "bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-300"
                    }`}
                  >
                    Icon
                  </button>
                  <button
                    onClick={() => setPickerTab("text")}
                    className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${
                      pickerTab === "text" ? "bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-300"
                    }`}
                  >
                    Text
                  </button>
                  <button
                    onClick={() => setPickerTab("photo")}
                    className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${
                      pickerTab === "photo" ? "bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-300"
                    }`}
                  >
                    Photo
                  </button>
                </div>

                {pickerTab === "icon" && (
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {ICONS.map((i) => (
                      <button
                        key={i}
                        onClick={() => pickIcon(i)}
                        className="w-12 h-12 rounded-lg text-xl flex items-center justify-center border border-slate-200 dark:border-slate-600 hover:border-emerald-400 transition-colors"
                      >
                        {i}
                      </button>
                    ))}
                  </div>
                )}

                {pickerTab === "text" && (
                  <div className="flex flex-col gap-2 mb-4">
                    <p className="text-[11px] text-slate-400">Up to 2 characters, e.g. initials</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={textDraft}
                        onChange={(e) => setTextDraft(e.target.value)}
                        maxLength={2}
                        placeholder="TP"
                        className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm text-center font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <button onClick={saveText} className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-3 rounded-lg transition-colors">
                        Use
                      </button>
                    </div>
                  </div>
                )}

                {pickerTab === "photo" && (
                  <div className="mb-4">
                    <ImageDropInput value={group.photoURL || ""} onChange={setPhoto} onError={(msg) => showToast(msg, "error")} />
                  </div>
                )}

                {pickerTab !== "photo" && (
                  <div>
                    <p className="text-[11px] text-slate-400 mb-2">Background color</p>
                    <div className="grid grid-cols-6 gap-2">
                      {ICON_COLORS.map((c) => (
                        <button
                          key={c.value}
                          onClick={() => pickIconColor(c.value)}
                          className={`h-8 rounded-lg ${c.value} border-2 transition-all ${
                            bgColor === c.value ? "border-white ring-2 ring-emerald-400" : "border-transparent"
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

      <div className="flex-1 min-w-0 pt-1">
        <div className="flex items-center gap-2 flex-wrap">
          {editingName ? (
            <input
              type="text"
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onBlur={saveName}
              onKeyDown={(e) => e.key === "Enter" && saveName()}
              autoFocus
              className="text-xl font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-700 border border-emerald-400 rounded-lg px-2 py-0.5 focus:outline-none"
            />
          ) : (
            <h1
              onClick={() => isOwner && setEditingName(true)}
              className={`text-xl font-bold text-slate-800 dark:text-slate-100 ${isOwner ? "cursor-pointer hover:underline decoration-dashed decoration-slate-300" : ""}`}
            >
              {group.name}
            </h1>
          )}
          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
            {group.category}
          </span>
          {group.isPublic && (
            <span className="text-[10px] font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/30 px-2 py-0.5 rounded-full">
              🌐 Public
            </span>
          )}
        </div>

        {editingDesc ? (
          <textarea
            rows={2}
            value={descDraft}
            onChange={(e) => setDescDraft(e.target.value)}
            onBlur={saveDescription}
            autoFocus
            className="mt-1 w-full text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 border border-emerald-400 rounded-lg px-2 py-1 resize-none focus:outline-none"
          />
        ) : (
          <p
            onClick={() => isOwner && setEditingDesc(true)}
            className={`text-sm text-slate-500 dark:text-slate-400 mt-0.5 ${isOwner ? "cursor-pointer hover:underline decoration-dashed decoration-slate-300" : ""}`}
          >
            {group.description || (isOwner ? "Add a description…" : "")}
          </p>
        )}
      </div>
    </>
  );
}