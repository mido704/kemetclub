import { useState, useEffect, createContext, useContext } from "react";
import { onAuthStateChanged, createUserWithEmailAndPassword,
         signInWithEmailAndPassword, signOut, updateProfile } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { getDb, getClientAuth } from "@/lib/firebase";

const AuthContext = createContext(null);

async function getOrCreateProfile(firebaseUser) {
  const db  = getDb();
  const ref = doc(db, "users", firebaseUser.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data();
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
        } catch { setProfile(null); }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  async function signup({ name, email, password, city = "" }) {
    const auth = getClientAuth();
    if (!auth) throw new Error("Auth غير متاح");
    const { user: u } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(u, { displayName: name });
    const db = getDb();
    const userData = { uid: u.uid, name, email, city, bio: "", avatar: "", badge: "EXPLORER", tier: "free", points: 0, stories: 0, followers: 0, following: 0, joinedAt: serverTimestamp() };
    await setDoc(doc(db, "users", u.uid), userData);
    setProfile(userData);
    return u;
  }

  async function login({ email, password }) {
    const auth = getClientAuth();
    if (!auth) throw new Error("Auth غير متاح");
    const { user: u } = await signInWithEmailAndPassword(auth, email, password);
    try { const p = await getOrCreateProfile(u); setProfile(p); } catch { setProfile(null); }
    return u;
  }

  async function logout() {
    const auth = getClientAuth();
    if (auth) await signOut(auth);
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) return { user: null, profile: null, loading: true, signup: async()=>{}, login: async()=>{}, logout: async()=>{} };
  return ctx;
}// src/hooks/useAuth.js
import { useState, useEffect, createContext, useContext }                        from "react";
import { onAuthStateChanged, createUserWithEmailAndPassword,
         signInWithEmailAndPassword, signOut, updateProfile }                    from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp }                                  from "firebase/firestore";
import { getDb, getClientAuth }                                                   from "@/lib/firebase";

const AuthContext = createContext(null);

const ERRORS = {
  "auth/email-already-in-use":   "⚠ الإيميل ده مسجل قبل كده",
  "auth/invalid-email":          "⚠ إيميل مش صحيح",
  "auth/weak-password":          "⚠ الباسورد لازم 6 حروف على الأقل",
  "auth/user-not-found":         "⚠ مفيش حساب بالإيميل ده",
  "auth/wrong-password":         "⚠ الباسورد غلط",
  "auth/network-request-failed": "⚠ مشكلة في الاتصال",
  "auth/too-many-requests":      "⚠ محاولات كتير، استنى شوية",
  "auth/invalid-api-key":        "⚠ تأكد من Firebase config في Netlify",
};

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // getClientAuth() returns null on server — safe
    const auth = getClientAuth();
    if (!auth) { setLoading(false); return; }

    // onAuthStateChanged is already imported at top — no race condition
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const db   = getDb();
          const snap = await getDoc(doc(db, "users", firebaseUser.uid));
          setProfile(snap.exists() ? snap.data() : null);
        } catch {
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
    const db           = getDb();
    const { user: u }  = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(u, { displayName: name });
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
    const auth        = getClientAuth();
    if (!auth) throw new Error("Auth غير متاح");
    const db          = getDb();
    const { user: u } = await signInWithEmailAndPassword(auth, email, password);
    try {
      const snap = await getDoc(doc(db, "users", u.uid));
      setProfile(snap.exists() ? snap.data() : null);
    } catch { setProfile(null); }
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

// Safe hook — returns defaults when context not yet mounted
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
