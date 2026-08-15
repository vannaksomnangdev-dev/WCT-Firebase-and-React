// GroupDetail.jsx
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

// Cleaned tabs so "About" is an editable/rich intro section, and "Info" holds the settings/contact details
const TABS = [
  { key: "feed", label: "Posts" },
  { key: "about", label: "About" },
  { key: "members", label: "Members" },
  { key: "info", label: "Info" },
];

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
      <div className="relative min-h-screen bg-[#f0f2f5] dark:bg-slate-950">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-8 relative">
          <p className="text-sm text-slate-400 text-center mt-12">Loading group…</p>
        </main>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="relative min-h-screen bg-[#f0f2f5] dark:bg-slate-950">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-8 relative">
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
      <div className="relative min-h-screen bg-[#f0f2f5] dark:bg-slate-950">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-8 relative">
          <Link to="/discover" className="text-xs text-slate-500 hover:text-emerald-600 font-medium">
            &larr; Discover
          </Link>
          <p className="text-sm text-slate-500 text-center mt-12">
            This group is private. You'll need an invite code to join.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-12">
      <Navbar />

      {/* Facebook Style Header Container */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-6xl mx-auto">
          
          {/* Cover Photo */}
          <div className="h-48 sm:h-72 w-full relative overflow-hidden bg-slate-200 dark:bg-slate-800 rounded-b-xl">
            {group.bannerPhotoURL ? (
              <img src={group.bannerPhotoURL} alt="" className="w-full h-full object-cover object-center" />
            ) : (
              <div className={`w-full h-full ${group.bannerColor || "bg-emerald-600"}`} />
            )}
            
            <div className="absolute bottom-4 right-4 z-20">
              <InlineBannerEditor group={group} isOwner={isOwner} />
            </div>
          </div>

          {/* Group Header Info Row */}
          <div className="px-6 pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4 -mt-12 md:-mt-6 relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
              <div className="relative">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full p-1 bg-white dark:bg-slate-900 shadow-lg overflow-hidden flex items-center justify-center">
                  <InlineGroupHeader group={group} isOwner={isOwner} />
                </div>
              </div>

              <div className="mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    {group.name}
                  </h1>
                  {group.isPublic && (
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400">
                      Public group
                    </span>
                  )}
                </div>
                
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
                  {group.memberIds?.length || 1} member{group.memberIds?.length === 1 ? "" : "s"} · {group.category || "General"}
                </p>

                {group.description && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 max-w-xl line-clamp-2">
                    {group.description}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pb-2">
              {isMember ? (
                <>
                  {isOwner && (
                    <button 
                      onClick={() => setSettingsOpen(true)} 
                      className="flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors shadow-sm"
                    >
                      ⚙️ Manage Group
                    </button>
                  )}
                  {!isOwner && (
                    <button 
                      onClick={handleLeave} 
                      className="text-xs font-semibold px-4 py-2.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-red-50 hover:text-red-600 transition-colors shadow-sm"
                    >
                      Leave Group
                    </button>
                  )}
                </>
              ) : (
                <button
                  onClick={handleJoin}
                  disabled={joining}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-semibold px-6 py-2.5 rounded-lg shadow-sm transition-colors"
                >
                  Join Group
                </button>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-t border-slate-200 dark:border-slate-800 px-6 gap-2 overflow-x-auto">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-3 text-sm font-semibold transition-colors relative whitespace-nowrap ${
                    isActive
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-lg my-1"
                  }`}
                >
                  {tab.label}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-600 dark:bg-emerald-400 rounded-t-full" />
                  )}
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {/* Main Content Body Container */}
      <main className="max-w-6xl mx-auto px-4 pt-6">
        {!isMember && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 p-3 rounded-xl mb-6 text-xs text-amber-800 dark:text-amber-300">
            Viewing as a visitor — join the group to unlock posting, voting, and interacting.
          </div>
        )}

        {/* Tab Routing */}
        {activeTab === "feed" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">About</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                  {group.description || "No description provided."}
                </p>
                <div className="flex flex-col gap-2 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <div className="flex items-center gap-2">
                    <span>🌐</span>
                    <span>{group.isPublic ? "Public group" : "Private group"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>👥</span>
                    <span>{group.memberIds?.length || 1} members</span>
                  </div>
                  {isMember && group.inviteCode && (
                    <div className="flex items-center gap-2 font-mono text-emerald-600 dark:text-emerald-400">
                      <span>🔑</span>
                      <span>Invite Code: {group.inviteCode}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <Feed
                groupId={groupId}
                userId={user.uid}
                userName={profileMap[user.uid]?.displayName || user.email?.split("@")[0] || "Member"}
                isOwner={isOwner}
                profileMap={profileMap}
                canInteract={isMember}
                groupIsPublic={!!group.isPublic}
              />
            </div>
          </div>
        )}

        {/* 🌟 Dedicated Facebook-Style "About" Page Tab */}
        {activeTab === "about" && (
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">About this group</h3>
                <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
                  <div>
                    <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-1">Description</h4>
                    <p className="leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-lg border border-slate-100 dark:border-slate-800">
                      {group.description || "No description written yet for this group."}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-1">History & Details</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Created {group.createdAt ? group.createdAt.toDate().toLocaleDateString() : "Recently"}. Managed actively by group owner.
                    </p>
                  </div>

                  {isOwner && (
                    <div className="pt-2">
                      <button
                        onClick={() => setSettingsOpen(true)}
                        className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1.5"
                      >
                        ✏️ Edit group description & settings in modal
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Group Rules Section inside About tab */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Group Rules</h3>
                {group.rules && group.rules.length > 0 ? (
                  <ul className="space-y-3">
                    {group.rules.map((rule, idx) => (
                      <li key={idx} className="text-sm bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800 flex gap-3">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{idx + 1}.</span>
                        <span className="text-slate-700 dark:text-slate-300">{rule}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-400 italic">No specific rules set by the admins yet.</p>
                )}
              </div>
            </div>

            {/* Right sidebar for About Tab */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Quick Overview</h3>
                <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
                  <span className="text-base">🌐</span>
                  <div>
                    <p className="font-semibold">{group.isPublic ? "Public" : "Private"}</p>
                    <p className="text-slate-400">Anyone can see who's in the group and what they post.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
                  <span className="text-base">👁️</span>
                  <div>
                    <p className="font-semibold">Visible</p>
                    <p className="text-slate-400">Anyone can find this group.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "members" && (
          <div className="max-w-3xl mx-auto">
            <MemberList members={profiles} ownerId={group.ownerId} currentUserId={user.uid} />
          </div>
        )}

        {activeTab === "info" && (
          <div className="max-w-4xl mx-auto">
            <GroupInfoTab group={group} isOwner={isOwner} />
          </div>
        )}
      </main>

      {isOwner && (
        <GroupSettingsModal group={group} isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      )}
    </div>
  );
}