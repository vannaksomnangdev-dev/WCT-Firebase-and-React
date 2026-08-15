import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, arrayRemove, getDoc, addDoc, serverTimestamp, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase.js";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useToast } from "../contexts/ToastContext.jsx";
import Navbar from "../components/Navbar.jsx";
import BackgroundBlobs from "../components/BackgroundBlobs.jsx";
import PostCard from "../components/home/PostCard.jsx";

const TABS = [
  { key: "posts", label: "Posts" },
  { key: "media", label: "Media" },
  { key: "info", label: "Info" },
];

export default function PublicProfilePage() {
  const { username } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [profileUser, setProfileUser] = useState(null);
  const [currentUserData, setCurrentUserData] = useState({});
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");
  const [postLimit, setPostLimit] = useState(5);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const qUser = query(collection(db, "users"), where("username", "==", username.toLowerCase()));
        const userSnap = await getDocs(qUser);
        if (userSnap.empty) {
          setLoading(false);
          return;
        }
        const foundUser = { uid: userSnap.docs[0].id, ...userSnap.docs[0].data() };
        setProfileUser(foundUser);

        if (user?.uid) {
          const mySnap = await getDoc(doc(db, "users", user.uid));
          if (mySnap.exists()) {
            setCurrentUserData(mySnap.data());
          }
        }

        const qPosts = query(
          collection(db, "posts"),
          where("authorId", "==", foundUser.uid),
          orderBy("createdAt", "desc"),
          limit(20)
        );
        const postsSnap = await getDocs(qPosts);
        setUserPosts(postsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [username, user?.uid]);

  const friends = currentUserData.friends || [];
  const sentRequests = currentUserData.sentFriendRequests || [];
  const receivedRequests = currentUserData.receivedFriendRequests || [];

  const isFriend = profileUser && friends.includes(profileUser.uid);
  const hasSentRequest = profileUser && sentRequests.includes(profileUser.uid);
  const hasReceivedRequest = profileUser && receivedRequests.includes(profileUser.uid);
  const isSelf = user?.uid === profileUser?.uid;

  async function handleSendRequest() {
    if (!user?.uid || !profileUser) return;
    try {
      await updateDoc(doc(db, "users", user.uid), { sentFriendRequests: arrayUnion(profileUser.uid) });
      await updateDoc(doc(db, "users", profileUser.uid), { receivedFriendRequests: arrayUnion(user.uid) });
      setCurrentUserData((prev) => ({ ...prev, sentFriendRequests: [...sentRequests, profileUser.uid] }));
      showToast("Friend request sent!");
    } catch (err) {
      console.error(err);
      showToast("Couldn't send friend request.", "error");
    }
  }

  async function handleCancelRequest() {
    if (!user?.uid || !profileUser) return;
    try {
      await updateDoc(doc(db, "users", user.uid), { sentFriendRequests: arrayRemove(profileUser.uid) });
      await updateDoc(doc(db, "users", profileUser.uid), { receivedFriendRequests: arrayRemove(user.uid) });
      setCurrentUserData((prev) => ({ ...prev, sentFriendRequests: sentRequests.filter((id) => id !== profileUser.uid) }));
      showToast("Friend request cancelled", "info");
    } catch (err) {
      console.error(err);
      showToast("Couldn't cancel request.", "error");
    }
  }

  async function handleConfirmRequest() {
    if (!user?.uid || !profileUser) return;
    try {
      await updateDoc(doc(db, "users", user.uid), {
        friends: arrayUnion(profileUser.uid),
        receivedFriendRequests: arrayRemove(profileUser.uid),
      });
      await updateDoc(doc(db, "users", profileUser.uid), {
        friends: arrayUnion(user.uid),
        sentFriendRequests: arrayRemove(user.uid),
      });

      setCurrentUserData((prev) => ({
        ...prev,
        friends: [...friends, profileUser.uid],
        receivedFriendRequests: receivedRequests.filter((id) => id !== profileUser.uid),
      }));
      showToast("Friend request accepted!");
    } catch (err) {
      console.error(err);
      showToast("Couldn't accept request.", "error");
    }
  }

  async function handleDeleteRequest() {
    if (!user?.uid || !profileUser) return;
    try {
      await updateDoc(doc(db, "users", user.uid), { receivedFriendRequests: arrayRemove(profileUser.uid) });
      await updateDoc(doc(db, "users", profileUser.uid), { sentFriendRequests: arrayRemove(user.uid) });
      setCurrentUserData((prev) => ({
        ...prev,
        receivedFriendRequests: receivedRequests.filter((id) => id !== profileUser.uid),
      }));
      showToast("Friend request declined", "info");
    } catch (err) {
      console.error(err);
      showToast("Couldn't decline request.", "error");
    }
  }

  async function handleUnfriend() {
    if (!user?.uid || !profileUser) return;
    try {
      await updateDoc(doc(db, "users", user.uid), { friends: arrayRemove(profileUser.uid) });
      await updateDoc(doc(db, "users", profileUser.uid), { friends: arrayRemove(user.uid) });
      setCurrentUserData((prev) => ({ ...prev, friends: friends.filter((id) => id !== profileUser.uid) }));
      showToast("Unfriended successfully", "info");
    } catch (err) {
      console.error(err);
      showToast("Couldn't unfriend.", "error");
    }
  }

  async function handleReportUser() {
    if (!user?.uid || !profileUser) return;
    const reason = window.prompt("Reason for reporting this user:");
    if (!reason) return;

    try {
      await addDoc(collection(db, "reports"), {
        reporterId: user.uid,
        targetUserId: profileUser.uid,
        targetUsername: profileUser.username,
        reason: reason.trim(),
        createdAt: serverTimestamp(),
      });
      showToast("User reported. Admins will review this.");
    } catch (err) {
      console.error(err);
      showToast("Failed to submit report.", "error");
    }
  }

  if (loading) {
    return (
      <div className="relative min-h-screen">
        <BackgroundBlobs />
        <Navbar />
        <main className="max-w-xl mx-auto px-4 py-12 text-center text-slate-400">Loading profile...</main>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="relative min-h-screen">
        <BackgroundBlobs />
        <Navbar />
        <main className="max-w-xl mx-auto px-4 py-12 text-center">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">User not found</h2>
          <p className="text-xs text-slate-400 mt-1">No user exists with the handle @{username}</p>
        </main>
      </div>
    );
  }

  const visiblePosts = userPosts.filter((p) => isSelf || p.visibility !== "private");
  const mediaPosts = visiblePosts.filter((p) => p.imageURL || p.videoURL);

  return (
    <div className="relative min-h-screen pb-12">
      <BackgroundBlobs />
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8 relative flex flex-col gap-6">
        
        {/* Profile Header */}
        <div className="bg-white/70 dark:bg-slate-800/70 border border-white/40 dark:border-slate-700/60 rounded-2xl p-6 shadow-xl backdrop-blur-md flex flex-col gap-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700 flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-emerald-600 text-white font-bold text-2xl flex items-center justify-center shadow-md">
                {(profileUser.displayName || "U").charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">{profileUser.displayName}</h2>
                <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400">@{profileUser.username}</p>
              </div>
            </div>

            {!isSelf && user && (
              <div className="flex items-center gap-2">
                {isFriend ? (
                  <button
                    onClick={handleUnfriend}
                    className="text-xs font-semibold px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-red-100 hover:text-red-600 transition-all shadow-md"
                  >
                    ✓ Friends (Unfriend)
                  </button>
                ) : hasSentRequest ? (
                  <button
                    onClick={handleCancelRequest}
                    className="text-xs font-semibold px-4 py-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-red-50 hover:text-red-500 transition-all shadow-md"
                  >
                    Cancel Request
                  </button>
                ) : hasReceivedRequest ? (
                  <div className="flex gap-2">
                    <button
                      onClick={handleConfirmRequest}
                      className="text-xs font-semibold px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={handleDeleteRequest}
                      className="text-xs font-semibold px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-red-100 hover:text-red-600 transition-all shadow-md"
                    >
                      Delete
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleSendRequest}
                    className="text-xs font-semibold px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md"
                  >
                    + Add Friend
                  </button>
                )}

                <button
                  onClick={handleReportUser}
                  className="text-xs font-medium px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                  title="Report user"
                >
                  🚩
                </button>
              </div>
            )}
          </div>

          <p className="text-sm text-slate-700 dark:text-slate-200">{profileUser.bio || "No bio added yet."}</p>
        </div>

        {/* Tabs Navigation */}
        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 w-fit shadow-inner">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`text-xs font-medium px-5 py-2 rounded-lg transition-colors ${
                activeTab === tab.key ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content: Posts */}
        {activeTab === "posts" && (
          <div className="flex flex-col gap-4">
            {visiblePosts.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No posts to display.</p>
            ) : (
              <>
                {visiblePosts.slice(0, postLimit).map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    userId={user?.uid}
                    userName={user?.email?.split("@")[0]}
                    userFriends={friends}
                    author={profileUser}
                    canManage={isSelf}
                  />
                ))}
                {postLimit < visiblePosts.length && (
                  <button
                    onClick={() => setPostLimit((l) => l + 5)}
                    className="self-center text-xs bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 px-4 py-2 rounded-xl font-medium text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    Load More Posts
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* Tab Content: Media */}
        {activeTab === "media" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {mediaPosts.length === 0 ? (
              <p className="text-xs text-slate-400 col-span-full text-center py-8">No media shared yet.</p>
            ) : (
              mediaPosts.map((post) => (
                <div key={post.id} className="aspect-square bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden shadow-md relative group">
                  {post.imageURL ? (
                    <img src={post.imageURL} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-medium text-slate-400 bg-slate-800">
                      🎬 Video Post
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab Content: Info */}
        {activeTab === "info" && (
          <div className="bg-white/70 dark:bg-slate-800/70 border border-white/40 dark:border-slate-700/60 rounded-2xl p-6 shadow-xl backdrop-blur-md flex flex-col gap-4 text-sm text-slate-600 dark:text-slate-300">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account Details</h3>
            <p><strong className="text-slate-800 dark:text-slate-100">Display Name:</strong> {profileUser.displayName}</p>
            <p><strong className="text-slate-800 dark:text-slate-100">Username:</strong> @{profileUser.username}</p>
            {isSelf && <p><strong className="text-slate-800 dark:text-slate-100">Email:</strong> {profileUser.email}</p>}
            {profileUser.age && <p><strong className="text-slate-800 dark:text-slate-100">Age:</strong> {profileUser.age}</p>}
            {profileUser.phone && <p><strong className="text-slate-800 dark:text-slate-100">Phone:</strong> {profileUser.phone}</p>}

            {profileUser.socials && Object.values(profileUser.socials).some(Boolean) && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex flex-col gap-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Social Links</h3>
                <div className="flex flex-wrap gap-2">
                  {profileUser.socials.youtube && (
                    <a href={profileUser.socials.youtube} target="_blank" rel="noopener noreferrer" className="text-xs bg-red-500/10 text-red-500 font-medium px-3 py-1.5 rounded-lg hover:underline">
                      YouTube
                    </a>
                  )}
                  {profileUser.socials.facebook && (
                    <a href={profileUser.socials.facebook} target="_blank" rel="noopener noreferrer" className="text-xs bg-blue-500/10 text-blue-500 font-medium px-3 py-1.5 rounded-lg hover:underline">
                      Facebook
                    </a>
                  )}
                  {profileUser.socials.tiktok && (
                    <a href={profileUser.socials.tiktok} target="_blank" rel="noopener noreferrer" className="text-xs bg-slate-500/10 text-slate-800 dark:text-slate-200 font-medium px-3 py-1.5 rounded-lg hover:underline">
                      TikTok
                    </a>
                  )}
                  {profileUser.socials.telegram && (
                    <a href={profileUser.socials.telegram} target="_blank" rel="noopener noreferrer" className="text-xs bg-sky-500/10 text-sky-500 font-medium px-3 py-1.5 rounded-lg hover:underline">
                      Telegram
                    </a>
                  )}
                  {profileUser.socials.messenger && (
                    <a href={profileUser.socials.messenger} target="_blank" rel="noopener noreferrer" className="text-xs bg-indigo-500/10 text-indigo-500 font-medium px-3 py-1.5 rounded-lg hover:underline">
                      Messenger
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}