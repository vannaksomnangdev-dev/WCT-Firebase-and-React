import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc, collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase.js";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useToast } from "../contexts/ToastContext.jsx";
import Navbar from "../components/Navbar.jsx";
import BackgroundBlobs from "../components/BackgroundBlobs.jsx";
import PostCard from "../components/home/PostCard.jsx";
import React from "react";

const TABS = [
  { key: "posts", label: "My Posts" },
  { key: "media", label: "Media" },
  { key: "saved", label: "Saved Posts" },
  { key: "about", label: "About" },
];

export default function ProfilePage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");
  const [isEditingSettings, setIsEditingSettings] = useState(false); // Controls separate settings view state
  const [userPosts, setUserPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [postLimit, setPostLimit] = useState(5);

  // Edit profile form state
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [bannerPhotoURL, setBannerPhotoURL] = useState("");
  const [avatarURL, setAvatarURL] = useState("");

  // Upload progress indicators
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const [savedPostIds, setSavedPostIds] = useState([]);
  const [profileData, setProfileData] = useState({});

  useEffect(() => {
    async function fetchMyData() {
      if (!user?.uid) return;
      try {
        setLoading(true);
        const myDocRef = doc(db, "users", user.uid);
        const mySnap = await getDoc(myDocRef);

        if (mySnap.exists()) {
          const data = mySnap.data();
          setProfileData(data);
          setDisplayName(data.displayName || user.displayName || "");
          setUsername(data.username || "");
          setBio(data.bio || "");
          setLocation(data.location || "Phnom Penh, Cambodia");
          setWebsite(data.website || "");
          setBannerPhotoURL(data.bannerPhotoURL || "");
          setAvatarURL(data.avatarURL || user.photoURL || "");
          setSavedPostIds(data.savedPosts || []);

          // Fetch my posts
          const qPosts = query(
            collection(db, "posts"),
            where("authorId", "==", user.uid),
            orderBy("createdAt", "desc"),
            limit(20)
          );
          const postsSnap = await getDocs(qPosts);
          setUserPosts(postsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

          // Fetch saved posts if any
          if (data.savedPosts && data.savedPosts.length > 0) {
            const savedPromises = data.savedPosts.map(async (postId) => {
              const pSnap = await getDoc(doc(db, "posts", postId));
              return pSnap.exists() ? { id: pSnap.id, ...pSnap.data() } : null;
            });
            const resolvedSaved = (await Promise.all(savedPromises)).filter(Boolean);
            setSavedPosts(resolvedSaved);
          }
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMyData();
  }, [user?.uid, user?.displayName, user?.photoURL]);

  // Handle direct file uploads to Firebase Storage
  async function handleFileUpload(e, type) {
    const file = e.target.files?.[0];
    if (!file || !user?.uid) return;

    try {
      if (type === "avatar") setUploadingAvatar(true);
      else setUploadingBanner(true);

      const storageRef = ref(storage, `users/${user.uid}/${type}_${Date.now()}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      if (type === "avatar") {
        setAvatarURL(downloadURL);
        showToast("Avatar file uploaded successfully!");
      } else {
        setBannerPhotoURL(downloadURL);
        showToast("Cover photo file uploaded successfully!");
      }
    } catch (err) {
      console.error("Upload error:", err);
      showToast("Failed to upload image file.", "error");
    } finally {
      if (type === "avatar") setUploadingAvatar(false);
      else setUploadingBanner(false);
    }
  }

  async function handleSaveProfile(e) {
    e.preventDefault();
    if (!user?.uid) return;
    try {
      await updateDoc(doc(db, "users", user.uid), {
        displayName: displayName.trim(),
        username: username.toLowerCase().trim(),
        bio: bio.trim(),
        location: location.trim(),
        website: website.trim(),
        bannerPhotoURL: bannerPhotoURL.trim(),
        avatarURL: avatarURL.trim(),
      });
      showToast("Profile updated successfully!");
      setIsEditingSettings(false); // Return to standard profile view
    } catch (err) {
      console.error(err);
      showToast("Failed to update profile.", "error");
    }
  }

  if (loading) {
    return (
      <div className="relative min-h-screen bg-[#f0f2f5] dark:bg-slate-950">
        <BackgroundBlobs />
        <Navbar />
        <main className="max-w-xl mx-auto px-4 py-12 text-center text-slate-400">Loading profile...</main>
      </div>
    );
  }

  const mediaPosts = userPosts.filter((p) => p.imageURL || p.videoURL);

  return (
    <div className="relative min-h-screen pb-16 bg-[#f0f2f5] dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <BackgroundBlobs />
      <Navbar />

      {/* Profile Header Container */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-6xl mx-auto">
          
          {/* Cover Photo Banner */}
          <div className="h-48 sm:h-80 w-full relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-900 rounded-b-2xl shadow-inner">
            {bannerPhotoURL ? (
              <img src={bannerPhotoURL} alt="Cover" className="w-full h-full object-cover object-center" />
            ) : (
              <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
            )}
            
            {/* Hidden File Input & Functional Camera Button for Cover Photo */}
            <input 
              type="file" 
              id="coverPhotoFileInput" 
              className="hidden" 
              accept="image/*"
              onChange={(e) => handleFileUpload(e, "banner")}
            />
            <div className="absolute bottom-4 right-4 z-20">
              <label 
                htmlFor="coverPhotoFileInput"
                className="bg-black/50 hover:bg-black/70 text-white backdrop-blur-md text-xs font-semibold px-4 py-2 rounded-xl transition-all border border-white/20 shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <span>{uploadingBanner ? "⏳ Uploading..." : "📷"}</span> Edit Cover Photo
              </label>
            </div>
          </div>

          {/* Profile Identity Row */}
          <div className="px-6 pb-4 flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-16 md:-mt-10 relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
              
              {/* Avatar Ring Container */}
              <div className="relative group">
                <div className="w-36 h-36 md:w-44 md:h-44 rounded-full p-1.5 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden flex items-center justify-center ring-4 ring-white dark:ring-slate-900">
                  {avatarURL ? (
                    <img src={avatarURL} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <div className="w-full h-full rounded-full bg-emerald-600 text-white text-5xl font-extrabold flex items-center justify-center shadow-inner">
                      {(displayName || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                
                {/* Hidden File Input & Functional Camera Badge to Edit Avatar */}
                <input 
                  type="file" 
                  id="avatarFileInput" 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, "avatar")}
                />
                <label 
                  htmlFor="avatarFileInput"
                  className="absolute bottom-2 right-2 bg-slate-900/80 hover:bg-slate-900 text-white p-2.5 rounded-full shadow-lg backdrop-blur-md border border-white/20 transition-transform hover:scale-105 cursor-pointer flex items-center justify-center"
                  title="Change profile picture"
                >
                  {uploadingAvatar ? "⏳" : "📷"}
                </label>
              </div>

              {/* Name, Handle, and Bio Info */}
              <div className="mb-2 space-y-1.5">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    {displayName || "My Profile"}
                  </h1>
                  <span className="text-xs font-mono font-medium px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                    @{username || "username"}
                  </span>
                </div>

                <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed font-medium">
                  {bio || "No bio added yet."}
                </p>

                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1 flex-wrap font-medium">
                  <span>📅 Joined January 2026</span>
                  <span>📍 {location}</span>
                  {website && (
                    <a href={website} target="_blank" rel="noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">
                      🌐 {website.replace("https://", "").replace("http://", "")}
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Toggle Between Main Profile and Separate Settings View */}
            <div className="flex items-center gap-3 pb-2">
              <button 
                onClick={() => setIsEditingSettings(!isEditingSettings)}
                className={`text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer ${
                  isEditingSettings 
                    ? "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                }`}
              >
                <span>{isEditingSettings ? "⬅️ Back to Profile" : "⚙️"}</span> 
                {isEditingSettings ? "Cancel Settings" : "Edit Profile Settings"}
              </button>
            </div>
          </div>

          {/* Navigation Tabs (Only display if not in separate settings mode) */}
          {!isEditingSettings && (
            <div className="flex border-t border-slate-200 dark:border-slate-800 px-6 gap-2 overflow-x-auto mt-2">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-4 py-3 text-sm font-semibold transition-colors relative whitespace-nowrap cursor-pointer ${
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
          )}

        </div>
      </div>

      {/* Main Content Body Container */}
      <main className="max-w-6xl mx-auto px-4 pt-6">
        
        {/* Separate Settings Page View */}
        {isEditingSettings ? (
          <form onSubmit={handleSaveProfile} className="max-w-3xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-6">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Account Settings & Profile Editor</h2>
              <p className="text-xs text-slate-500 mt-0.5">Customize how your public identity appears across the platform, upload local images directly, or paste URLs.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Unique @ID (Username)</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">About / Bio</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell people a bit about yourself"
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Phnom Penh, Cambodia"
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Website URL</label>
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Media Upload Options Support (Both File Upload & URL Field) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Avatar Profile Image</label>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border shrink-0">
                    {avatarURL ? <img src={avatarURL} alt="" className="w-full h-full object-cover" /> : null}
                  </div>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, "avatar")}
                    className="text-xs text-slate-500 file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                  />
                </div>
                <input
                  type="text"
                  value={avatarURL}
                  onChange={(e) => setAvatarURL(e.target.value)}
                  placeholder="Or paste avatar image URL..."
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Cover Banner Photo</label>
                <div className="h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border flex items-center px-2">
                  {bannerPhotoURL ? <img src={bannerPhotoURL} alt="" className="w-full h-full object-cover rounded-lg" /> : <span className="text-[10px] text-slate-400">No banner selected</span>}
                </div>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, "banner")}
                  className="text-xs text-slate-500 file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                />
                <input
                  type="text"
                  value={bannerPhotoURL}
                  onChange={(e) => setBannerPhotoURL(e.target.value)}
                  placeholder="Or paste cover photo URL..."
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsEditingSettings(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-xl text-xs transition-colors shadow-md cursor-pointer"
              >
                Save Profile Changes
              </button>
            </div>
          </form>
        ) : (
          <>
            {/* Tab Content: Posts */}
            {activeTab === "posts" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-6">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Intro</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {bio || "No bio added yet."}
                    </p>
                    <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">💼</span>
                        <span>Active Community Contributor</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">📍</span>
                        <span>Lives in {location}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 flex flex-col gap-4">
                  {userPosts.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center shadow-sm">
                      <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl shadow-inner">
                        📝
                      </div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">No posts published yet</h3>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        When you share thoughts, updates, or creations in your groups or feed, they will show up right here.
                      </p>
                    </div>
                  ) : (
                    <>
                      {userPosts.slice(0, postLimit).map((post) => (
                        <PostCard
                          key={post.id}
                          post={post}
                          userId={user?.uid}
                          userName={displayName}
                          userFriends={profileData.friends || []}
                          author={{ uid: user.uid, displayName, username }}
                          canManage={true}
                          allowVisibilityToggle={true}
                          savedPostIds={savedPostIds}
                        />
                      ))}
                      {postLimit < userPosts.length && (
                        <button
                          onClick={() => setPostLimit((l) => l + 5)}
                          className="self-center text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 px-4 py-2 rounded-xl font-medium text-slate-700 dark:text-slate-200 transition-colors shadow-sm cursor-pointer"
                        >
                          Load More Posts
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Tab Content: Media */}
            {activeTab === "media" && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Media Gallery</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {mediaPosts.length === 0 ? (
                    <p className="text-xs text-slate-400 col-span-full text-center py-8">No media shared yet.</p>
                  ) : (
                    mediaPosts.map((post) => (
                      <div key={post.id} className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm relative group">
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
              </div>
            )}

            {/* Tab Content: Saved Posts */}
            {activeTab === "saved" && (
              <div className="max-w-2xl mx-auto flex flex-col gap-4">
                {savedPosts.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center shadow-sm">
                    <p className="text-xs text-slate-400">No saved posts yet. Click "Save Post" on any post menu to store it here!</p>
                  </div>
                ) : (
                  savedPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      userId={user?.uid}
                      userName={displayName}
                      userFriends={profileData.friends || []}
                      author={{ uid: post.authorId, displayName: "Member" }}
                      canManage={false}
                      savedPostIds={savedPostIds}
                    />
                  ))
                )}
              </div>
            )}

            {/* Tab Content: About */}
            {activeTab === "about" && (
              <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Overview & Details</h3>
                <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Bio</span>
                    {bio || "No bio added yet."}
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Contact Email</span>
                    {user?.email}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

      </main>
    </div>
  );
}