import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase.js";

const GROUPS_COLLECTION = "groups";

function generateInviteCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export function useUserGroups(userId) {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    if (!userId) {
      setGroups([]);
      return;
    }
    const q = query(collection(db, GROUPS_COLLECTION), where("memberIds", "array-contains", userId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const next = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      next.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
      setGroups(next);
    });
    return unsubscribe;
  }, [userId]);

  return groups;
}

export function useGroup(groupId) {
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!groupId) {
      setGroup(null);
      setLoading(false);
      return;
    }
    const unsubscribe = onSnapshot(doc(db, GROUPS_COLLECTION, groupId), (snap) => {
      setGroup(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      setLoading(false);
    });
    return unsubscribe;
  }, [groupId]);

  return { group, loading };
}

export function usePublicGroups() {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const q = query(collection(db, GROUPS_COLLECTION), where("isPublic", "==", true));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const next = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      next.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
      setGroups(next);
    });
    return unsubscribe;
  }, []);

  return groups;
}

export function createGroup(userId, { name, description, icon, photoURL, category, isPublic }) {
  return addDoc(collection(db, GROUPS_COLLECTION), {
    name,
    description: description || "",
    icon: icon || "👥",
    photoURL: photoURL || "",
    category: category || "Other",
    isPublic: !!isPublic,
    ownerId: userId,
    memberIds: [userId],
    inviteCode: generateInviteCode(),
    createdAt: serverTimestamp(),
  });
}

export function updateGroup(groupId, fields) {
  return updateDoc(doc(db, GROUPS_COLLECTION, groupId), fields);
}

export async function deleteGroup(groupId) {
  const postsQuery = query(collection(db, "posts"), where("groupId", "==", groupId));
  const postsSnapshot = await getDocs(postsQuery);

  const batch = writeBatch(db);
  postsSnapshot.docs.forEach((postDoc) => batch.delete(postDoc.ref));
  batch.delete(doc(db, GROUPS_COLLECTION, groupId));

  await batch.commit();
}

export async function joinGroupByCode(userId, code) {
  const q = query(collection(db, GROUPS_COLLECTION), where("inviteCode", "==", code.toUpperCase().trim()));
  const snapshot = await getDocs(q);

  if (snapshot.empty) throw new Error("No group found with that code.");

  const groupDoc = snapshot.docs[0];
  const data = groupDoc.data();

  if (data.memberIds?.includes(userId)) throw new Error("You're already in this group.");

  await updateDoc(doc(db, GROUPS_COLLECTION, groupDoc.id), {
    memberIds: arrayUnion(userId),
  });

  return { id: groupDoc.id, ...data };
}

export function joinPublicGroup(groupId, userId) {
  return updateDoc(doc(db, GROUPS_COLLECTION, groupId), {
    memberIds: arrayUnion(userId),
  });
}

export function leaveGroup(groupId, userId) {
  return updateDoc(doc(db, GROUPS_COLLECTION, groupId), {
    memberIds: arrayRemove(userId),
  });
}

// Public groups a specific user belongs to — used on their profile popover.
export async function getPublicGroupsForUser(uid) {
  const q = query(collection(db, GROUPS_COLLECTION), where("memberIds", "array-contains", uid), where("isPublic", "==", true));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}