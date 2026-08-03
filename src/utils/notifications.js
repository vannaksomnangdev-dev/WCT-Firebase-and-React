import { db } from "../firebase.js";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function sendNotification({ recipientId, senderId, type, message, postId }) {
  if (!recipientId || !senderId || recipientId === senderId) return;

  try {
    await addDoc(collection(db, "notifications"), {
      recipientId,
      senderId,
      type,
      message,
      postId: postId || null,
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error sending notification:", error);
  }
}