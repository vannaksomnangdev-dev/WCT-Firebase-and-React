import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase.js";

const GROUP_TASKS_COLLECTION = "groupTasks";

export function useGroupTasks(groupId, onError) {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (!groupId) {
      setTasks([]);
      return;
    }

    const q = query(collection(db, GROUP_TASKS_COLLECTION), where("groupId", "==", groupId));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const next = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        next.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
        setTasks(next);
      },
      (error) => {
        console.error("Firestore watchGroupTasks error:", error);
        onError?.(error);
      }
    );

    return unsubscribe;
  }, [groupId]);

  return tasks;
}

export function addGroupTask(groupId, userId, { title, notes, status }) {
  return addDoc(collection(db, GROUP_TASKS_COLLECTION), {
    groupId,
    title,
    notes: notes || "",
    status: status || "todo",
    createdBy: userId,
    createdAt: serverTimestamp(),
  });
}

export function updateGroupTask(taskId, fields) {
  return updateDoc(doc(db, GROUP_TASKS_COLLECTION, taskId), fields);
}

export function deleteGroupTask(taskId) {
  return deleteDoc(doc(db, GROUP_TASKS_COLLECTION, taskId));
}