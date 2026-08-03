import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../firebase.js";
import { ensureUserProfile } from "../hooks/useUserProfile.js";

const AuthContext = createContext(null);

const ERROR_MAP = {
  "auth/invalid-email": "That email address doesn't look right.",
  "auth/user-not-found": "No account found with that email.",
  "auth/wrong-password": "Incorrect password.",
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/email-already-in-use": "An account already exists with that email.",
  "auth/weak-password": "Password should be at least 6 characters.",
};

export function friendlyAuthError(error) {
  return ERROR_MAP[error.code] || "Something went wrong. Please try again.";
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      if (u) {
        ensureUserProfile(u).catch((err) => console.error("ensureUserProfile error:", err));
      }
    });
    return unsubscribe;
  }, []);

  const value = {
    user,
    loading,
    signUp: (email, password) => createUserWithEmailAndPassword(auth, email, password),
    logIn: (email, password) => signInWithEmailAndPassword(auth, email, password),
    logOut: () => signOut(auth),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}