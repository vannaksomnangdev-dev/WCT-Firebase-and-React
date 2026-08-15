import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase.js";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useToast } from "../contexts/ToastContext.jsx";
import { getUserProfiles } from "../hooks/useUserProfile.js";
import { 
  useAllUsers, 
  useAllGroupsAdmin, 
  useAllPostsAdmin, 
  adminDeleteGroup, 
  adminDeletePost, 
  setUserAdmin,
  adminDeleteUser 
} from "../hooks/useAdmin.js";
import Navbar from "../components/Navbar.jsx";
import BackgroundBlobs from "../components/BackgroundBlobs.jsx";

const TABS = [
  { key: "users", label: "Users" },
  { key: "groups", label: "Groups" },
  { key: "posts", label: "Posts" },
];

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  
  const [myProfile, setMyProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("users");
  const [selectedUser, setSelectedUser] = useState(null);
  
  const [managingGroup, setManagingGroup] = useState(null);
  const [groupMembersData, setGroupMembersData] = useState([]);

  // ✅ States for Admin Direct Content Preview Modals
  const [previewGroup, setPreviewGroup] = useState(null);
  const [previewGroupPosts, setPreviewGroupPosts] = useState([]);
  const [previewPost, setPreviewPost] = useState(null);

  const users = useAllUsers();
  const groups = useAllGroupsAdmin();
  const posts = useAllPostsAdmin();

  useEffect(() => {
    if (!user?.uid) {
      setProfileLoading(false);
      return;
    }
    getUserProfiles([user.uid])
      .then((r) => {
        setMyProfile(r[0] || null);
      })
      .finally(() => {
        setProfileLoading(false);
      });
  }, [user?.uid]);

  if (!authLoading && !user) return <Navigate to="/" replace />;

  if (authLoading || profileLoading) {
    return (
      <div className="relative min-h-screen">
        <BackgroundBlobs />
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 py-8 relative">
          <p className="text-sm text-slate-400 text-center mt-12">Checking access…</p>
        </main>
      </div>
    );
  }

  if (!myProfile || !myProfile.isAdmin) return <Navigate to="/home" replace />;

  async function toggleAdmin(uid, current) {
    try {
      await setUserAdmin(uid, !current);
      showToast(current ? "Admin removed" : "Made admin");
    } catch {
      showToast("Couldn't update.", "error");
    }
  }

  async function handleDeleteGroup(id, name) {
    if (!window.confirm(`Are you sure you want to delete the group "${name || id}"?`)) return;
    if (!window.confirm(`FINAL WARNING: Click OK to permanently delete this group.`)) return;

    try {
      await adminDeleteGroup(id);
      showToast("Group deleted", "info");
    } catch {
      showToast("Couldn't delete group.", "error");
    }
  }

  async function handleDeletePost(id) {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    if (!window.confirm("FINAL WARNING: Click OK to permanently delete this post.")) return;

    try {
      await adminDeletePost(id);
      showToast("Post deleted", "info");
    } catch {
      showToast("Couldn't delete post.", "error");
    }
  }

  async function handleDeleteUser(uid, name) {
    if (!window.confirm(`Are you sure you want to delete user account "${name || uid}"?`)) return;
    if (!window.confirm("FINAL WARNING: This account and its profile records will be permanently removed.")) return;

    try {
      await adminDeleteUser(uid);
      setSelectedUser(null);
      showToast("User profile deleted", "info");
    } catch {
      showToast("Couldn't delete user.", "error");
    }
  }

  // ✅ Open group preview modal and fetch its posts securely as an admin
  async function handleOpenGroupPreview(group) {
    setPreviewGroup(group);
    try {
      const qPosts = query(collection(db, "posts"), where("groupId", "==", group.id));
      const snap = await getDocs(qPosts);
      setPreviewGroupPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
      setPreviewGroupPosts([]);
    }
  }

  async function openGroupManager(group) {
    setManagingGroup(group);
    try {
      const memberDocs = await Promise.all(
        (group.memberIds || []).map(async (uid) => {
          const uSnap = await getDoc(doc(db, "users", uid));
          return uSnap.exists() ? { uid: uSnap.id, ...uSnap.data() } : null;
        })
      );
      setGroupMembersData(memberDocs.filter(Boolean));
    } catch (err) {
      console.error(err);
      showToast("Failed to load group members", "error");
    }
  }

  async function handleAdminRemoveMember(uidToRemove) {
    if (!managingGroup) return;
    const updatedMembers = managingGroup.memberIds.filter((id) => id !== uidToRemove);
    
    try {
      await updateDoc(doc(db, "groups", managingGroup.id), {
        memberIds: updatedMembers,
        ownerId: managingGroup.ownerId === uidToRemove ? null : managingGroup.ownerId,
      });

      setManagingGroup((prev) => ({
        ...prev,
        memberIds: updatedMembers,
        ownerId: prev.ownerId === uidToRemove ? null : prev.ownerId,
      }));
      setGroupMembersData((prev) => prev.filter((m) => m.uid !== uidToRemove));
      showToast("Member removed from group by admin");
    } catch (err) {
      console.error(err);
      showToast("Failed to remove member", "error");
    }
  }

  const getUserStats = (uid) => {
    const userPosts = posts.filter((p) => p.authorId === uid);
    const userGroups = groups.filter((g) => g.memberIds?.includes(uid) || g.ownerId === uid);
    return { postsCount: userPosts.length, groupsCount: userGroups.length };
  };

  return (
    <div className="relative min-h-screen pb-12">
      <BackgroundBlobs />
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8 relative">
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">Admin Dashboard</h1>
        <p className="text-xs text-slate-400 mb-6">Manage users, groups, and posts across FlowGroup.</p>

        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 mb-6 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`text-sm font-medium px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.key ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"
              }`}
            >
              {tab.label} ({tab.key === "users" ? users.length : tab.key === "groups" ? groups.length : posts.length})
            </button>
          ))}
        </div>

        {activeTab === "users" && (
          <div className="flex flex-col gap-2">
            {users.map((u) => {
              const stats = getUserStats(u.uid);
              return (
                <div key={u.uid} className="flex items-center justify-between bg-white/70 dark:bg-slate-800/60 border border-white/40 dark:border-slate-700/60 rounded-xl p-3">
                  <div className="cursor-pointer flex-1 pr-4" onClick={() => setSelectedUser(u)}>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100 hover:underline">{u.displayName || "Member"}</p>
                    <p className="text-xs text-slate-400">{u.email} · <span className="text-emerald-600 font-medium">{stats.postsCount} posts</span> · <span className="text-sky-600 font-medium">{stats.groupsCount} groups</span></p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleAdmin(u.uid, u.isAdmin)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                        u.isAdmin ? "bg-emerald-600 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {u.isAdmin ? "✓ Admin" : "Make Admin"}
                    </button>
                    <button
                      onClick={() => setSelectedUser(u)}
                      className="text-xs bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 px-3 py-1.5 rounded-lg font-medium text-slate-700 dark:text-slate-200"
                    >
                      Summary
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "groups" && (
          <div className="flex flex-col gap-2">
            {groups.map((g) => (
              <div key={g.id} className="flex items-center justify-between bg-white/70 dark:bg-slate-800/60 border border-white/40 dark:border-slate-700/60 rounded-xl p-3">
                {/* ✅ Clickable group name to view group preview modal */}
                <div className="cursor-pointer flex-1 pr-4" onClick={() => handleOpenGroupPreview(g)} title="Click to view group content">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100 hover:text-emerald-600 hover:underline flex items-center gap-1">
                    {g.name} <span className="text-[10px] text-emerald-600">(Preview Group 🔍)</span>
                  </p>
                  <p className="text-xs text-slate-400">{g.memberIds?.length || 0} members · {g.isPublic ? "Public" : "Private"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openGroupManager(g)}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg bg-sky-500/10 text-sky-500 hover:bg-sky-500/20 transition-colors"
                  >
                    ⚙️ Manage
                  </button>
                  <button onClick={() => handleDeleteGroup(g.id, g.name)} className="text-xs font-semibold text-red-500 hover:text-red-600 px-3 py-1.5">
                    Delete Group
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "posts" && (
          <div className="flex flex-col gap-2">
            {posts.map((p) => (
              <div key={p.id} className="flex items-center justify-between bg-white/70 dark:bg-slate-800/60 border border-white/40 dark:border-slate-700/60 rounded-xl p-3">
                {/* ✅ Clickable post text preview to open post view modal */}
                <div className="cursor-pointer flex-1 pr-4 mr-3" onClick={() => setPreviewPost(p)} title="Click to view post">
                  <p className="text-sm text-slate-600 dark:text-slate-300 truncate hover:text-emerald-600 hover:underline">
                    {p.text || "(empty post)"}
                  </p>
                  <span className="text-[10px] text-emerald-600">Preview post 🔍</span>
                </div>
                <button onClick={() => handleDeletePost(p.id)} className="text-xs font-semibold text-red-500 hover:text-red-600 px-3 py-1.5 shrink-0">
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* User Summary Card Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-full max-w-md rounded-2xl shadow-xl p-6 relative flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">User Summary Card</h3>
              <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
            </div>

            <div className="flex flex-col gap-2 text-sm text-slate-600 dark:text-slate-300">
              <p><strong className="text-slate-800 dark:text-slate-100">Name:</strong> {selectedUser.displayName || "N/A"}</p>
              <p><strong className="text-slate-800 dark:text-slate-100">Email:</strong> {selectedUser.email || "N/A"}</p>
              <p><strong className="text-slate-800 dark:text-slate-100">UID:</strong> <span className="text-xs font-mono bg-slate-100 dark:bg-slate-700 p-1 rounded">{selectedUser.uid}</span></p>
              <p><strong className="text-slate-800 dark:text-slate-100">Bio:</strong> {selectedUser.bio || "No bio added."}</p>
              <p><strong className="text-slate-800 dark:text-slate-100">Role:</strong> {selectedUser.isAdmin ? "👑 Admin" : "Member"}</p>
              
              <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl mt-2 flex justify-around text-center">
                <div>
                  <p className="text-lg font-bold text-emerald-600">{getUserStats(selectedUser.uid).postsCount}</p>
                  <p className="text-xs text-slate-400">Posts</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-sky-600">{getUserStats(selectedUser.uid).groupsCount}</p>
                  <p className="text-xs text-slate-400">Groups</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-amber-600">{selectedUser.friends?.length || 0}</p>
                  <p className="text-xs text-slate-400">Friends</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
              <button
                onClick={() => handleDeleteUser(selectedUser.uid, selectedUser.displayName)}
                className="text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-lg transition-colors"
              >
                Delete User Account
              </button>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-xs bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 px-4 py-2 rounded-lg font-medium text-slate-700 dark:text-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Admin Group Preview Modal (Allows admin to view private/public group details and posts) */}
      {previewGroup && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl flex flex-col gap-4 max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  🔍 Group Preview: {previewGroup.name}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {previewGroup.isPublic ? "Public Group" : "🔒 Private Group"} · {previewGroup.memberIds?.length || 0} members
                </p>
              </div>
              <button onClick={() => setPreviewGroup(null)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-3 overflow-y-auto pr-1">
              <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Description</p>
                <p className="text-xs text-slate-700 dark:text-slate-200">{previewGroup.description || "No description provided."}</p>
              </div>

              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">Group Posts ({previewGroupPosts.length})</p>
              {previewGroupPosts.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6 bg-slate-50 dark:bg-slate-900/30 rounded-xl">No posts found in this group.</p>
              ) : (
                previewGroupPosts.map((p) => (
                  <div key={p.id} className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-col gap-2">
                    <p className="text-xs text-slate-800 dark:text-slate-100 font-medium">{p.text}</p>
                    {p.imageURL && <img src={p.imageURL} alt="" className="h-32 object-cover rounded-lg w-full" />}
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setPreviewGroup(null)}
              className="w-full mt-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-2 rounded-xl text-xs transition-colors"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}

      {/* ✅ Admin Post Preview Modal */}
      {previewPost && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                🔍 Post Preview
              </h3>
              <button onClick={() => setPreviewPost(null)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-col gap-3">
                <p className="text-sm text-slate-800 dark:text-slate-100 leading-relaxed">{previewPost.text || "(empty post)"}</p>
                {previewPost.imageURL && (
                  <img src={previewPost.imageURL} alt="" className="rounded-lg max-h-60 object-cover w-full" />
                )}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span>Likes: {Object.values(previewPost.likes || {}).filter(Boolean).length}</span>
                  <span>Comments: {(previewPost.comments || []).length}</span>
                  <span>Visibility: {previewPost.visibility || "public"}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setPreviewPost(null)}
              className="w-full mt-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-2 rounded-xl text-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Admin Group Members Management Modal */}
      {managingGroup && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Manage Group: {managingGroup.name}
              </h3>
              <button onClick={() => setManagingGroup(null)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              As an Admin, you can remove any member or group owner/leader from this group.
            </p>

            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
              {groupMembersData.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No members loaded.</p>
              ) : (
                groupMembersData.map((member) => {
                  const isOwner = member.uid === managingGroup.ownerId;
                  return (
                    <div key={member.uid} className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700">
                      <div>
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{member.displayName || "Member"}</p>
                        <p className="text-[10px] text-slate-400 font-mono">@{member.username || "no_username"} {isOwner && "👑 (Owner)"}</p>
                      </div>
                      <button
                        onClick={() => handleAdminRemoveMember(member.uid)}
                        className="text-xs font-medium px-2.5 py-1 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <button
              onClick={() => setManagingGroup(null)}
              className="w-full mt-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-2 rounded-xl text-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}