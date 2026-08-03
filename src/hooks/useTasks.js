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

const TASKS_COLLECTION = "tasks";

export function useTasks(userId, onError) {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (!userId) {
      setTasks([]);
      return;
    }

    // Note: intentionally no orderBy() here. Combining where() + orderBy()
    // on different fields requires a Firestore composite index to be
    // created manually in the console. Sorting client-side avoids that
    // extra setup step entirely.
    const q = query(collection(db, TASKS_COLLECTION), where("userId", "==", userId));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const next = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));

        next.sort((a, b) => {
          const aTime = a.createdAt?.toMillis?.() ?? 0;
          const bTime = b.createdAt?.toMillis?.() ?? 0;
          return bTime - aTime;
        });

        setTasks(next);
      },
      (error) => {
        console.error("Firestore watchTasks error:", error);
        onError?.(error);
      }
    );

    return unsubscribe;
  }, [userId]);

  return tasks;
}

export function addTask(userId, { title, notes, status }) {
  return addDoc(collection(db, TASKS_COLLECTION), {
    userId,
    title,
    notes: notes || "",
    status: status || "todo",
    createdAt: serverTimestamp(),
  });
}

export function updateTask(taskId, fields) {
  return updateDoc(doc(db, TASKS_COLLECTION, taskId), fields);
}

export function deleteTask(taskId) {
  return deleteDoc(doc(db, TASKS_COLLECTION, taskId));
}
