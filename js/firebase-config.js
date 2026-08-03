// Replace these values with your own Firebase project config.
// Firebase Console -> Project Settings -> General -> Your apps -> Web app
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCrAd_lBKbFysXwo_kCU1CsjqFA0RxJGIs",
  authDomain: "wct-firebase-final-assigment.firebaseapp.com",
  projectId: "wct-firebase-final-assigment",
  storageBucket: "wct-firebase-final-assigment.firebasestorage.app",
  messagingSenderId: "1066781330431",
  appId: "1:1066781330431:web:5e1ce1b4ab92a18f27b5ca",
};

// Firestore is intentionally NOT initialized here. The login page
// (index.html) only ever needs Auth — pulling in the full Firestore SDK
// there would be dead weight it never uses. tasks.js initializes
// Firestore itself, on demand, only on pages that actually import it
// (i.e. dashboard.html). This keeps the login page's first load lean.
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
