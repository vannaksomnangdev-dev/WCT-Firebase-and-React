import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPublicGroupsForUser } from "../hooks/useGroups.js";
import { addFriend, removeFriend } from "../hooks/useUserProfile.js";
import { useToast } from "../contexts/ToastContext.jsx";

const AVATAR_COLORS = ["bg-emerald-500", "bg-sky-500", "bg-amber-500", "bg-fuchsia-500", "bg-indigo-500", "bg-violet-500"];

function colorFor(uid) {
  let sum = 0;
  for (let i = 0; i < uid.length; i++) sum += uid.charCodeAt(i);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

export default function UserProfilePopover({ profile, currentUserId, currentUserFriends = [], onClose }) {
  const { showToast } = useToast();
  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [busy, setBusy] = useState(false);

  const isSelf = profile.uid === currentUserId;
  const isFriend = currentUserFriends.includes(profile.uid);

  useEffect(() => {
    getPublicGroupsForUser(profile.uid)
      .then(setGroups)
      .finally(() => setLoadingGroups(false));
  }, [profile.uid]);

  async function handleFriendToggle() {
    setBusy(true);
    try {
      if (isFriend) {
        await removeFriend(currentUserId, profile.uid);
        showToast("Removed friend", "info");
      } else {
        await addFriend(currentUserId, profile.uid);
        showToast("Friend added");
      }
    } catch {
      showToast("Couldn't update friend status.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-white/40 dark:border-slate-700/60 shadow-2xl rounded-2xl w-full max-w-xs p-5">
        <div className="flex justify-end">
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl leading-none -mt-2 -mr-2">
            &times;
          </button>
        </div>

        <div className="flex flex-col items-center gap-2 -mt-4 mb-4">
          <div className={`w-16 h-16 rounded-full ${colorFor(profile.uid)} text-white text-2xl font-semibold flex items-center justify-center`}>
            {(profile.displayName || "?").charAt(0).toUpperCase()}
          </div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{profile.displayName}</p>
          {profile.email && <p className="text-xs text-slate-400">{profile.email}</p>}
        </div>

        {!isSelf && (
          <button
            onClick={handleFriendToggle}
            disabled={busy}
            className={`w-full text-sm font-semibold py-2 rounded-lg mb-4 transition-colors disabled:opacity-60 ${
              isFriend
                ? "border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }`}
          >
            {isFriend ? "✓ Friends" : "+ Add Friend"}
          </button>
        )}

        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Public groups</p>
          {loadingGroups && <p className="text-xs text-slate-400">Loading…</p>}
          {!loadingGroups && groups.length === 0 && <p className="text-xs text-slate-400">No public groups.</p>}
          <div className="flex flex-col gap-1.5">
            {groups.map((g) => (
              <Link
                key={g.id}
                to={`/groups/${g.id}`}
                onClick={onClose}
                className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                <span>{g.icon || "👥"}</span>
                <span className="truncate">{g.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}