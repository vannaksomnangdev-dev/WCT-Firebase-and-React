import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useToast } from "../contexts/ToastContext.jsx";

export default function SwitchAccountModal({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [savedAccounts, setSavedAccounts] = useState([]);

  useEffect(() => {
    if (!isOpen) return;
    try {
      const stored = JSON.parse(localStorage.getItem("flowgroup_saved_accounts") || "[]");
      setSavedAccounts(stored);
    } catch {
      setSavedAccounts([]);
    }

    if (user?.email) {
      const stored = JSON.parse(localStorage.getItem("flowgroup_saved_accounts") || "[]");
      if (!stored.some((acc) => acc.uid === user.uid)) {
        const updated = [...stored, { uid: user.uid, email: user.email, name: user.displayName || user.email.split("@")[0] }];
        localStorage.setItem("flowgroup_saved_accounts", JSON.stringify(updated));
        setSavedAccounts(updated);
      }
    }
  }, [isOpen, user]);

  async function handleSwitch(accountEmail) {
    try {
      showToast(`Switching to ${accountEmail}...`, "info");
      if (typeof logout === "function") {
        await logout();
      }
      onClose();
      showToast("Please sign in to the selected account.", "info");
    } catch {
      showToast("Couldn't switch account.", "error");
    }
  }

  async function handleAddAccount() {
    try {
      if (typeof logout === "function") {
        await logout();
      }
      onClose();
    } catch (err) {
      console.error(err);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Switch Account</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
        </div>

        <p className="text-xs text-slate-400">Select an account or add another one to manage.</p>

        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
          {savedAccounts.map((acc) => {
            const isCurrent = acc.uid === user?.uid;
            return (
              <div key={acc.uid} className={`flex items-center justify-between p-3 rounded-xl border ${isCurrent ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500" : "bg-slate-50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-700"}`}>
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{acc.name}</p>
                  <p className="text-[10px] text-slate-400">{acc.email} {isCurrent && "· (Active)"}</p>
                </div>
                {!isCurrent && (
                  <button
                    onClick={() => handleSwitch(acc.email)}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                  >
                    Switch
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={handleAddAccount}
          className="w-full mt-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold py-2.5 rounded-xl text-xs transition-colors"
        >
          + Add Another Account / Sign In
        </button>
      </div>
    </div>
  );
}