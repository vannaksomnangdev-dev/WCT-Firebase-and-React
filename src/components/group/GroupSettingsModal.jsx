import { useEffect, useState } from "react";
import { updateGroup, deleteGroup } from "../../hooks/useGroups.js";
import { useToast } from "../../contexts/ToastContext.jsx";
import { useNavigate } from "react-router-dom";

const CATEGORIES = ["Game Dev", "Web Dev", "Design", "School Project", "Study Group", "Other"];

export default function GroupSettingsModal({ group, isOpen, onClose }) {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [category, setCategory] = useState(group.category || CATEGORIES[0]);
  const [isPublic, setIsPublic] = useState(!!group.isPublic);
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCategory(group.category || CATEGORIES[0]);
      setIsPublic(!!group.isPublic);
      setConfirmingDelete(false);
    }
  }, [isOpen, group]);

  if (!isOpen) return null;

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateGroup(group.id, { category, isPublic });
      showToast("Group updated successfully! ✨");
      onClose();
    } catch {
      showToast("Couldn't save changes.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      await deleteGroup(group.id);
      showToast("Group deleted", "info");
      navigate("/groups");
    } catch {
      showToast("Couldn't delete group.", "error");
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xl rounded-3xl w-full max-w-md p-6 flex flex-col gap-5">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚙️</span>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Group Settings</h2>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            &times;
          </button>
        </div>

        <p className="text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 leading-relaxed">
          💡 Name, description, icon, and banner can be edited directly on the group page — click on any of them.[cite: 7]
        </p>

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          
          {/* Category Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Category</label>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-sm ${
                    category === c 
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-500/20 scale-[1.02]" 
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Public Group Toggle Button */}
          <button
            type="button"
            onClick={() => setIsPublic((p) => !p)}
            className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/40 hover:border-emerald-500/50 transition-all cursor-pointer group"
          >
            <div className="text-left">
              <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                🌐 Public group
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Anyone can find and join, no code needed</p>
            </div>
            <div className={`w-12 h-7 rounded-full relative transition-colors shrink-0 shadow-inner ${isPublic ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"}`}>
              <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${isPublic ? "translate-x-5" : "translate-x-0"}`} />
            </div>
          </button>

          {/* Submit Save Button */}
          <button
            type="submit"
            disabled={saving}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-60 text-white text-sm font-extrabold py-3.5 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 cursor-pointer mt-1"
          >
            {saving ? "Saving Changes…" : "Save Changes ✨"}
          </button>

          {/* Delete Section */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            {confirmingDelete ? (
              <div className="flex flex-col gap-3 bg-red-50 dark:bg-red-950/30 p-4 rounded-2xl border border-red-200 dark:border-red-900/50 animate-fadeIn">
                <p className="text-xs font-bold text-red-600 dark:text-red-400">
                  Delete this group permanently? This can't be undone.[cite: 7]
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-2.5 rounded-xl transition-colors shadow-md shadow-red-500/20 cursor-pointer"
                  >
                    Yes, delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingDelete(false)}
                    className="flex-1 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button 
                type="button" 
                onClick={() => setConfirmingDelete(true)} 
                className="text-xs font-bold text-red-400 hover:text-red-500 transition-colors p-1 cursor-pointer flex items-center gap-1.5"
              >
                <span>🗑️</span> Delete group
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
