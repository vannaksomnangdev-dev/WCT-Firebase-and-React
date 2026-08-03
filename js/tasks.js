import { app } from "./firebase-config.js";
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const db = getFirestore(app);
const TASKS_COLLECTION = "tasks";

export function watchTasks(userId, callback, onError) {
  // Note: intentionally no orderBy() here. Combining where() + orderBy()
  // on different fields requires a Firestore composite index to be
  // created manually in the console. Sorting client-side avoids that
  // extra setup step entirely.
  const q = query(
    collection(db, TASKS_COLLECTION),
    where("userId", "==", userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const tasks = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      tasks.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() ?? 0;
        const bTime = b.createdAt?.toMillis?.() ?? 0;
        return bTime - aTime;
      });

      callback(tasks);
    },
    (error) => {
      console.error("Firestore watchTasks error:", error);
      onError?.(error);
    }
  );
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
