import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from "firebase/firestore";
import { useState, useEffect } from "react";
import { db } from "../firebase.js";

const USERS_COLLECTION = "users";

export async function ensureUserProfile(user) {
  if (!user) return;
  const ref = doc(db, USERS_COLLECTION, user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      email: user.email,
      displayName: user.email.split("@")[0],
      photoURL: "",
      bio: "",
      age: "",
      phone: "",
      friends: [],
      createdAt: serverTimestamp(),
    });
  }
}

export function updateMyProfile(uid, fields) {
  return updateDoc(doc(db, USERS_COLLECTION, uid), fields);
}

export async function getUserProfiles(uids) {
  const results = await Promise.all(
    uids.map(async (uid) => {
      const snap = await getDoc(doc(db, USERS_COLLECTION, uid));
      return snap.exists() ? { uid, ...snap.data() } : { uid, displayName: "Member", email: "", friends: [] };
    })
  );
  return results;
}

// Instant mutual friend — no request/accept step, keeps this simple.
export async function addFriend(currentUid, targetUid) {
  await updateDoc(doc(db, USERS_COLLECTION, currentUid), { friends: arrayUnion(targetUid) });
  await updateDoc(doc(db, USERS_COLLECTION, targetUid), { friends: arrayUnion(currentUid) });
}

export async function removeFriend(currentUid, targetUid) {
  await updateDoc(doc(db, USERS_COLLECTION, currentUid), { friends: arrayRemove(targetUid) });
  await updateDoc(doc(db, USERS_COLLECTION, targetUid), { friends: arrayRemove(currentUid) });
}