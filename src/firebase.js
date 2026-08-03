// Replace these values with your own Firebase project config if needed.
// Firebase Console -> Project Settings -> General -> Your apps -> Web app
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCrAd_lBKbFysXwo_kCU1CsjqFA0RxJGIs",
  authDomain: "wct-firebase-final-assigment.firebaseapp.com",
  projectId: "wct-firebase-final-assigment",
  storageBucket: "wct-firebase-final-assigment.firebasestorage.app",
  messagingSenderId: "1066781330431",
  appId: "1:1066781330431:web:5e1ce1b4ab92a18f27b5ca",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
