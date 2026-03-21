// src/lib/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore }                    from "firebase/firestore";
import { getStorage }                      from "firebase/storage";
import { getAuth }                         from "firebase/auth";

const firebaseConfig = {
  apiKey:            "AIzaSyDYGw2l3DAsD63veGjDlqxAYO6d_U1OuM4",
  authDomain:        "kemet-club-e8ddd.firebaseapp.com",
  projectId:         "kemet-club-e8ddd",
  storageBucket:     "kemet-club-e8ddd.firebasestorage.app",
  messagingSenderId: "803724173841",
  appId:             "1:803724173841:web:2f8366833609e189b487b0",
};

function getFirebaseApp() {
  if (getApps().length > 0) return getApp();
  return initializeApp(firebaseConfig);
}

let _db = null;
export function getDb() {
  if (!_db) _db = getFirestore(getFirebaseApp());
  return _db;
}

let _storage = null;
export function getFirebaseStorage() {
  if (!_storage) _storage = getStorage(getFirebaseApp());
  return _storage;
}

let _auth = null;
export function getClientAuth() {
  if (typeof window === "undefined") return null;
  if (!_auth) _auth = getAuth(getFirebaseApp());
  return _auth;
}

export { getFirebaseApp };
