import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useToast } from "../contexts/ToastContext.jsx";
import { getUserProfiles, updateMyProfile } from "../hooks/useUserProfile.js";
import Navbar from "../components/Navbar.jsx";
import BackgroundBlobs from "../components/BackgroundBlobs.jsx";
import ImageDropInput from "../components/ImageDropInput.jsx";

const AVATAR_COLORS = ["bg-emerald-500", "bg-sky-500", "bg-amber-500", "bg-fuchsia-500", "bg-indigo-500", "bg-violet-500"];

function colorFor(uid) {
  let sum = 0;
  for (let i = 0; i < uid.length; i++) sum += uid.charCodeAt(i);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

function EditableField({ label, value, placeholder, onSave, type = "text", multiline = false }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || "");

  useEffect(() => setDraft(value || ""), [value]);

  async function save() {
    setEditing(false);
    if (draft.trim() === (value || "")) return;
    await onSave(draft.trim());
  }

  return (
    <div>
      <label className="text-xs font-medium text-slate-400">{label}</label>
      {editing ? (
        multiline ? (
          <textarea
            rows={3}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={save}
            autoFocus
            className="mt-1 w-full px-3 py-2 rounded-lg border border-emerald-400 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm resize-none focus:outline-none"
          />
        ) : (
          <input
            type={type}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={save}
            onKeyDown={(e) => e.key === "Enter" && save()}
            autoFocus
            className="mt-1 w-full px-3 py-2 rounded-lg border border-emerald-400 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm focus:outline-none"
          />
        )
      ) : (
        <p
          onClick={() => setEditing(true)}
          className="mt-1 text-sm text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg px-3 py-2 border border-transparent hover:border-slate-200 dark:hover:border-slate-600 transition-colors"
        >
          {value || <span className="text-slate-400 italic">{placeholder}</span>}
        </p>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!user?.uid) return;
    getUserProfiles([user.uid]).then((results) => setProfile(results[0]));
  }, [user?.uid]);

  if (!authLoading && !user) return <Navigate to="/" replace />;
  if (!profile) {
    return (
      <div className="relative min-h-screen">
        <BackgroundBlobs />
        <Navbar />
        <main className="max-w-lg mx-auto px-4 py-8 relative">
          <p className="text-sm text-slate-400 text-center mt-12">Loading profile…</p>
        </main>
      </div>
    );
  }

  async function saveField(field, value) {
    try {
      await updateMyProfile(user.uid, { [field]: value });
      setProfile((p) => ({ ...p, [field]: value }));
      showToast("Profile updated");
    } catch {
      showToast("Couldn't save that.", "error");
    }
  }

  async function setPhoto(url) {
    try {
      await updateMyProfile(user.uid, { photoURL: url });
      setProfile((p) => ({ ...p, photoURL: url }));
      if (url) showToast("Photo updated");
    } catch {
      showToast("Couldn't update photo.", "error");
    }
  }

  const [photoPickerOpen, setPhotoPickerOpen] = useState?.(false); // placeholder to avoid hook-order issues, replaced below

  return (
    <div className="relative min-h-screen">
      <BackgroundBlobs />
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-8 relative">
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">My Profile</h1>

        <div className="bg-white/70 dark:bg-slate-800/60 backdrop-blur-md border border-white/40 dark:border-slate-700/60 shadow-lg shadow-slate-200/40 dark:shadow-black/20 rounded-2xl p-6 flex flex-col gap-5">
          <ProfilePhoto profile={profile} userId={user.uid} onChange={setPhoto} />

          <EditableField
            label="Display name"
            value={profile.displayName}
            placeholder="Add your name"
            onSave={(v) => saveField("displayName", v)}
          />

          <EditableField
            label="About / Bio"
            value={profile.bio}
            placeholder="Tell people a bit about yourself"
            multiline
            onSave={(v) => saveField("bio", v)}
          />

          <div className="grid grid-cols-2 gap-4">
            <EditableField
              label="Age"
              value={profile.age}
              placeholder="Add age"
              type="number"
              onSave={(v) => saveField("age", v)}
            />
            <EditableField
              label="Phone"
              value={profile.phone}
              placeholder="Add phone"
              type="tel"
              onSave={(v) => saveField("phone", v)}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400">Email</label>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 px-3 py-2">{user.email}</p>
            <p className="text-[11px] text-slate-400 px-3">Email can't be changed here.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

function ProfilePhoto({ profile, userId, onChange }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const bgColor = colorFor(userId);

  return (
    <div className="flex flex-col items-center gap-2">
      <button onClick={() => setPickerOpen((o) => !o)} className="relative group">
        {profile.photoURL ? (
          <img src={profile.photoURL} alt="" className="w-20 h-20 rounded-full object-cover" />
        ) : (
          <div className={`w-20 h-20 rounded-full ${bgColor} text-white text-2xl font-semibold flex items-center justify-center`}>
            {(profile.displayName || "?").charAt(0).toUpperCase()}
          </div>
        )}
        <span className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/30 flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-all">
          Change
        </span>
      </button>

      {pickerOpen && (
        <div className="w-full max-w-xs">
          <ImageDropInput value={profile.photoURL || ""} onChange={(url) => { onChange(url); setPickerOpen(false); }} onError={() => {}} />
        </div>
      )}
    </div>
  );
}