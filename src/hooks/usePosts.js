import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  deleteField,
  doc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase.js";

const COLLECTION = "posts";

function sortPinnedFirst(list) {
  return [...list].sort((a, b) => {
    if (!!b.pinned !== !!a.pinned) return b.pinned ? 1 : -1;
    return (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0);
  });
}

export function usePosts(groupId) {
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    if (!groupId) return setPosts([]);
    const q = query(collection(db, COLLECTION), where("groupId", "==", groupId));
    return onSnapshot(q, (snap) => {
      setPosts(sortPinnedFirst(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
    });
  }, [groupId]);
  return posts;
}

export function usePublicFeed() {
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    const q = query(collection(db, COLLECTION), where("visibility", "==", "public"));
    return onSnapshot(q, (snap) => {
      setPosts(sortPinnedFirst(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
    });
  }, []);
  return posts;
}

export function useMyPosts(userId) {
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    if (!userId) return setPosts([]);
    const q = query(collection(db, COLLECTION), where("authorId", "==", userId));
    return onSnapshot(q, (snap) => {
      setPosts(sortPinnedFirst(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
    });
  }, [userId]);
  return posts;
}

export function usePost(postId) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!postId) {
      setPost(null);
      setLoading(false);
      return;
    }
    return onSnapshot(doc(db, COLLECTION, postId), (snap) => {
      setPost(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      setLoading(false);
    });
  }, [postId]);
  return { post, loading };
}

export function createPost(authorId, { groupId = null, text, imageURL = "", videoURL = "", isPoll, pollOptions = [], isAnnouncement = false, visibility }) {
  const options = isPoll
    ? pollOptions.filter((t) => t.trim()).map((t, i) => ({ id: `opt${i}`, text: t.trim() }))
    : [];
  return addDoc(collection(db, COLLECTION), {
    groupId,
    authorId,
    text,
    imageURL: imageURL || "",
    videoURL: videoURL || "",
    isPoll: !!isPoll,
    pollOptions: options,
    isAnnouncement: !!isAnnouncement,
    visibility,
    pinned: false,
    votes: {},
    likes: {},
    comments: [],
    createdAt: serverTimestamp(),
    editedAt: null,
  });
}

export function editPost(postId, fields) {
  const update = { text: fields.text, editedAt: serverTimestamp() };
  if (fields.visibility) update.visibility = fields.visibility;
  if (fields.pollOptions) {
    update.pollOptions = fields.pollOptions.filter((o) => o.text.trim());
    update.votes = {};
  }
  return updateDoc(doc(db, COLLECTION, postId), update);
}

export function togglePin(postId, pinned) {
  return updateDoc(doc(db, COLLECTION, postId), { pinned: !pinned });
}

export function castVote(postId, userId, optionId) {
  return updateDoc(doc(db, COLLECTION, postId), { [`votes.${userId}`]: optionId });
}

export function toggleLike(postId, userId, isLiked) {
  return updateDoc(doc(db, COLLECTION, postId), { [`likes.${userId}`]: isLiked ? deleteField() : true });
}

export function setComments(postId, comments) {
  return updateDoc(doc(db, COLLECTION, postId), { comments });
}

export function deletePost(id) {
  return deleteDoc(doc(db, COLLECTION, id));
}
