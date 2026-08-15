import { useState, useEffect } from "react";
import { db } from "../firebase.js";
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, writeBatch } from "firebase/firestore";

export function useNotifications(userId) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "notifications"),
      where("recipientId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setNotifications(list);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching notifications:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  // Mark a single notification as read
  const markAsRead = async (notificationId) => {
    try {
      const docRef = doc(db, "notifications", notificationId);
      await updateDoc(docRef, { read: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all as read helper
  const markAllAsRead = async () => {
    try {
      const batch = writeBatch(db);
      notifications.forEach((item) => {
        if (!item.read) {
          const docRef = doc(db, "notifications", item.id);
          batch.update(docRef, { read: true });
        }
      });
      await batch.commit();
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  return { notifications, loading, markAsRead, markAllAsRead };
}