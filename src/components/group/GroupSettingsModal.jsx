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
      showToast("Group updated");
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
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-white/40 dark:border-slate-700/60 shadow-2xl rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Group Settings</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl leading-none">
            &times;
          </button>
        </div>

        <p className="text-xs text-slate-400 mb-4">
          Name, description, icon, and banner can be edited directly on the group page — click on any of them.
        </p>

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Category</label>
            <div className="flex gap-2 flex-wrap mt-1">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                    category === c ? "bg-emerald-600 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsPublic((p) => !p)}
            className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 transition-colors"
          >
            <div className="text-left">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">🌐 Public group</p>
              <p className="text-[11px] text-slate-400">Anyone can find and join, no code needed</p>
            </div>
            <div className={`w-11 h-6 rounded-full relative transition-colors shrink-0 ${isPublic ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"}`}>
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${isPublic ? "translate-x-5" : "translate-x-0"}`} />
            </div>
          </button>

          <button
            type="submit"
            disabled={saving}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-700">
            {confirmingDelete ? (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-red-500">Delete this group permanently? This can't be undone.</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold py-2 rounded-lg transition-colors"
                  >
                    Yes, delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingDelete(false)}
                    className="flex-1 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-xs font-medium py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => setConfirmingDelete(true)} className="text-xs text-red-400 hover:text-red-500">
                Delete group
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}