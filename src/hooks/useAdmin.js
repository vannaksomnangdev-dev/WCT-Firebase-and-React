import { useEffect, useState } from "react";
import { collection, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase.js";

export function useAllUsers() {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    return onSnapshot(collection(db, "users"), (snap) => {
      setUsers(snap.docs.map((d) => ({ uid: d.id, ...d.data() })));
    });
  }, []);
  return users;
}

export function useAllGroupsAdmin() {
  const [groups, setGroups] = useState([]);
  useEffect(() => {
    return onSnapshot(collection(db, "groups"), (snap) => {
      setGroups(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, []);
  return groups;
}

export function useAllPostsAdmin() {
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    return onSnapshot(collection(db, "posts"), (snap) => {
      setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, []);
  return posts;
}

export function adminDeleteGroup(groupId) {
  return deleteDoc(doc(db, "groups", groupId));
}

export function adminDeletePost(postId) {
  return deleteDoc(doc(db, "posts", postId));
}

export function setUserAdmin(uid, isAdmin) {
  return updateDoc(doc(db, "users", uid), { isAdmin });
}

// ✅ NEW: Delete user profile document from Firestore
export function adminDeleteUser(uid) {
  return deleteDoc(doc(db, "users", uid));
}