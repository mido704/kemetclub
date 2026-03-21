// src/hooks/useAuth.js
import { useState, useEffect, createContext, useContext }                     from "react";
import { onAuthStateChanged, createUserWithEmailAndPassword,
         signInWithEmailAndPassword, signOut, updateProfile }                 from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp }                               from "firebase/firestore";
import { getDb, getClientAuth }                                                from "@/lib/firebase";

const AuthContext = createContext(null);

const ERRORS = {
  "auth/email-already-in-use":   "⚠ الإيميل مسجّل قبل كده",
  "auth/invalid-email":          "⚠ إيميل غير صحيح",
  "auth/weak-password":          "⚠ الباسورد 6 حروف على الأقل",
  "auth/user-not-found":         "⚠ مفيش حساب بالإيميل ده",
  "auth/wrong-password":         "⚠ الباسورد غلط",
  "auth/invalid-credential":     "⚠ الإيميل أو الباسورد غلط",
  "auth/network-request-failed": "⚠ مشكلة في الاتصال",
  "auth/too-many-requests":      "⚠ محاولات كتير، استنى شوية",
};

// جيب أو أنشئ profile من Firestore
async function getOrCreateProfile(firebaseUser) {
  const db   = getDb();
  const ref  = doc(db, "users", firebaseUser.uid);
  const snap = await getDoc(ref);

  if (snap.exists()) return snap.data();

  // مفيش doc — أنشئ واحد تلقائياً من بيانات Firebase Auth
  const userData = {
    uid:       firebaseUser.uid,
    name:      firebaseUser.displayName || firebaseUser.email.split("@")[0],
    email:     firebaseUser.email,
    city:      "",
    bio:       "",
    avatar:    firebaseUser.photoURL || "",
    badge:     "EXPLORER",
    tier:      "free",
    points:    0,
    stories:   0,
    followers: 0,
    following: 0,
    joinedAt:  serverTimestamp(),
  };
  await setDoc(ref, userData);
  return userData;
}

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getClientAuth();
    if (!auth) { setLoading(false); return; }

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const p = await getOrCreateProfile(firebaseUser);
          setProfile(p);
        } catch (e) {
          console.error("[Auth] profile error:", e);
          setProfile(null);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // ── Signup ────────────────────────────────────────────────
  async function signup({ name, email, password, city = "" }) {
    const auth = getClientAuth();
    if (!auth) throw new Error("Auth غير متاح");
    const { user: u } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(u, { displayName: name });
    const db = getDb();
    const userData = {
      uid: u.uid, name, email, city,
      bio: "", avatar: "", badge: "EXPLORER", tier: "free",
      points: 0, stories: 0, followers: 0, following: 0,
      joinedAt: serverTimestamp(),
    };
    await setDoc(doc(db, "users", u.uid), userData);
    setProfile(userData);
    return u;
  }

  // ── Login ─────────────────────────────────────────────────
  async function login({ email, password }) {
    const auth = getClientAuth();
    if (!auth) throw new Error("Auth غير متاح");
    const { user: u } = await signInWithEmailAndPassword(auth, email, password);
    // getOrCreateProfile: لو مفيش doc هينشئه تلقائياً
    try {
      const p = await getOrCreateProfile(u);
      setProfile(p);
    } catch (e) {
      console.error("[Login] profile error:", e);
    }
    return u;
  }

  // ── Logout ────────────────────────────────────────────────
  async function logout() {
    const auth = getClientAuth();
    if (auth) await signOut(auth);
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signup, login, logout, ERRORS }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    return {
      user: null, profile: null, loading: true,
      signup: async () => {}, login: async () => {}, logout: async () => {},
      ERRORS: {},
    };
  }
  return ctx;
}
