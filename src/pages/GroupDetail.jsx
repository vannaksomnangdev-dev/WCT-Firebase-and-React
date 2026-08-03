import { useEffect, useState } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useToast } from "../contexts/ToastContext.jsx";
import { useGroup, leaveGroup, joinPublicGroup } from "../hooks/useGroups.js";
import { getUserProfiles } from "../hooks/useUserProfile.js";
import Navbar from "../components/Navbar.jsx";
import Feed from "../components/group/Feed.jsx";
import MemberList from "../components/group/MemberList.jsx";
import GroupSettingsModal from "../components/group/GroupSettingsModal.jsx";
import InlineGroupHeader from "../components/group/InlineGroupHeader.jsx";
import InlineBannerEditor from "../components/group/InlineBannerEditor.jsx";
import GroupInfoTab from "../components/group/GroupInfoTab.jsx";
import BackgroundBlobs from "../components/BackgroundBlobs.jsx";
import React from "react";
export default function GroupDetail() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">Group Detail Page</h1>
    </div>
  );
}
const TABS = [
  { key: "feed", label: "Feed" },
  { key: "members", label: "Members" },
  { key: "info", label: "Info" },
];

export default function GroupDetail() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">Group Detail</h1>
    </div>
  );
}

export default function GroupDetail() {
  const { groupId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const { group, loading: groupLoading } = useGroup(groupId);

  const [activeTab, setActiveTab] = useState("feed");
  const [profiles, setProfiles] = useState([]);
  const [joining, setJoining] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    if (!group?.memberIds?.length) return;
    getUserProfiles(group.memberIds).then(setProfiles).catch(() => {});
  }, [group?.memberIds]);

  if (!authLoading && !user) return <Navigate to="/" replace />;

  if (groupLoading) {
    return (
      <div className="relative min-h-screen">
        <BackgroundBlobs />
        <Navbar />
       <main className="max-w-3xl mx-auto px-4 py-8 relative">
          <p className="text-sm text-slate-400 text-center mt-12">Loading group…</p>
        </main>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="relative min-h-screen">
        <BackgroundBlobs />
        <Navbar />
       <main className="max-w-3xl mx-auto px-4 py-8 relative">
          <p className="text-sm text-slate-400 text-center mt-12">Group not found.</p>
        </main>
      </div>
    );
  }

  const isMember = group.memberIds?.includes(user.uid);
  const isOwner = group.ownerId === user.uid;
  const profileMap = Object.fromEntries(profiles.map((p) => [p.uid, p]));

  async function handleLeave() {
    if (!confirm(`Leave "${group.name}"?`)) return;
    try {
      await leaveGroup(groupId, user.uid);
      showToast("Left group", "info");
    } catch {
      showToast("Couldn't leave group.", "error");
    }
  }

  async function handleJoin() {
    setJoining(true);
    try {
      await joinPublicGroup(groupId, user.uid);
      showToast("Joined group");
    } catch {
      showToast("Couldn't join that group.", "error");
    } finally {
      setJoining(false);
    }
  }

  if (!isMember && !group.isPublic) {
    return (
      <div className="relative min-h-screen">
        <BackgroundBlobs />
        <Navbar />
       <main className="max-w-3xl mx-auto px-4 py-8 relative">
          <Link to="/discover" className="text-xs text-slate-400 hover:text-emerald-600">
            &larr; Discover
          </Link>
          <p className="text-sm text-slate-400 text-center mt-12">
            This group is private. You'll need an invite code to join.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <BackgroundBlobs />
      <Navbar />
     <main className="max-w-3xl mx-auto px-4 py-8 relative">
        <Link to={isMember ? "/groups" : "/discover"} className="text-xs text-slate-400 hover:text-emerald-600">
          &larr; {isMember ? "My groups" : "Discover"}
        </Link>

        <div className="relative overflow-hidden rounded-2xl bg-white/70 dark:bg-slate-800/60 backdrop-blur-md border border-white/40 dark:border-slate-700/60 shadow-lg shadow-slate-200/40 dark:shadow-black/20 mt-3 mb-6">
          <div className="h-16 relative">
            {group.bannerPhotoURL ? (
              <img src={group.bannerPhotoURL} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className={`w-full h-full ${group.bannerColor || "bg-emerald-500"} opacity-90`} />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            <InlineBannerEditor group={group} isOwner={isOwner} />
          </div>

          <div className="p-4 pt-0 -mt-8 relative">
            <div className="flex items-start gap-4">
              <InlineGroupHeader group={group} isOwner={isOwner} />

              {isMember ? (
                <div className="flex items-center gap-2 pt-1">
                  {isOwner && (
                    <button onClick={() => setSettingsOpen(true)} className="text-xs text-slate-400 hover:text-emerald-600 whitespace-nowrap">
                      ⚙️ Settings
                    </button>
                  )}
                  {!isOwner && (
                    <button onClick={handleLeave} className="text-xs text-red-400 hover:text-red-500 whitespace-nowrap">
                      Leave
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleJoin}
                  disabled={joining}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-semibold px-4 py-2 rounded-lg whitespace-nowrap transition-colors"
                >
                  Join Group
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 mt-2 text-xs text-slate-400 flex-wrap">
              <span>{group.memberIds?.length || 1} member{group.memberIds?.length === 1 ? "" : "s"}</span>
              {group.createdAt && <span>Started {group.createdAt.toDate().toLocaleDateString()}</span>}
              {isMember && <span className="font-mono text-emerald-600 dark:text-emerald-400">Code: {group.inviteCode}</span>}
            </div>
          </div>
        </div>

        {!isMember && (
          <p className="text-xs text-slate-400 mb-4">Viewing as a visitor — join to post, vote, and react.</p>
        )}

        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 text-sm font-medium px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.key
                  ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "feed" && (
          <Feed
            groupId={groupId}
            userId={user.uid}
            userName={profileMap[user.uid]?.displayName || user.email?.split("@")[0] || "Member"}
            isOwner={isOwner}
            profileMap={profileMap}
            canInteract={isMember}
            groupIsPublic={!!group.isPublic}
          />
        )}
        {activeTab === "members" && <MemberList members={profiles} ownerId={group.ownerId} />}
        {activeTab === "info" && <GroupInfoTab group={group} isOwner={isOwner} />}
      </main>

      {isOwner && (
        <GroupSettingsModal group={group} isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      )}
    </div>
  );
}