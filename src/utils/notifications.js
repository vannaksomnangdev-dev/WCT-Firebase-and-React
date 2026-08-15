import { db } from "../firebase.js";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function sendNotification({ recipientId, senderId, type, message, postId }) {
  // Don't send a notification if the user interacts with their own post
  if (!recipientId || !senderId || recipientId === senderId) return;

  try {
    await addDoc(collection(db, "notifications"), {
      recipientId,
      senderId,
      type, // e.g., "like" or "comment"
      message,
      postId: postId || null,
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error sending notification:", error);
  }
}