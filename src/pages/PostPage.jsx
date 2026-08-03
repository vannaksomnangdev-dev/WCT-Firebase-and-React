import { Link, useParams, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { usePost } from "../hooks/usePosts.js";
import { useUserGroups } from "../hooks/useGroups.js";
import { getUserProfiles } from "../hooks/useUserProfile.js";
import Navbar from "../components/Navbar.jsx";
import PostCard from "../components/home/PostCard.jsx";

export default function PostPage() {
  const { postId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const { post, loading } = usePost(postId);
  const myGroups = useUserGroups(user?.uid);
  const [author, setAuthor] = useState(null);
  const [myProfile, setMyProfile] = useState(null);

  useEffect(() => {
    if (!post?.authorId) return;
    getUserProfiles([post.authorId]).then((results) => setAuthor(results[0]));
  }, [post?.authorId]);

  useEffect(() => {
    if (!user?.uid) return;
    getUserProfiles([user.uid]).then((results) => setMyProfile(results[0]));
  }, [user?.uid]);

  if (!authLoading && !user) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen">
      <Navbar />
<main className="max-w-3xl mx-auto px-4 py-8">
        <Link to="/home" className="text-xs text-slate-400 hover:text-emerald-600">
          &larr; Home
        </Link>
        <div className="mt-4">
          {loading && <p className="text-sm text-slate-400 text-center mt-12">Loading…</p>}
          {!loading && !post && (
            <p className="text-sm text-slate-400 text-center mt-12">This post doesn't exist, or you don't have access.</p>
          )}
          {!loading && post && (
            <PostCard
              post={post}
              userId={user.uid}
              userName={myProfile?.displayName || user.email?.split("@")[0] || "Member"}
              userFriends={myProfile?.friends || []}
              author={author}
              groupName={post.groupId ? myGroups.find((g) => g.id === post.groupId)?.name : null}
              canManage={post.authorId === user.uid}
            />
          )}
        </div>
      </main>
    </div>
  );
}