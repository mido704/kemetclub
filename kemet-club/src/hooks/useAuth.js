import { initializeApp, getApps, getApp } from "firebase/app";

const firebaseConfig = {
  apiKey:            "AIzaSyDYGw2l3DAsD63veGjDlqxAYO6d_U1OuM4",
  authDomain:        "kemet-club-e8ddd.firebaseapp.com",
  projectId:         "kemet-club-e8ddd",
  storageBucket:     "kemet-club-e8ddd.firebasestorage.app",
  messagingSenderId: "803724173841",
  appId:             "1:803724173841:web:2f8366833609e189b487b0",
};

export function getFirebaseApp() {
  if (getApps().length > 0) return getApp();
  return initializeApp(firebaseConfig);
}

export function getDb() {
  const { getFirestore } = require("firebase/firestore");
  return getFirestore(getFirebaseApp());
}

export function getFirebaseStorage() {
  const { getStorage } = require("firebase/storage");
  return getStorage(getFirebaseApp());
}

export function getClientAuth() {
  if (typeof window === "undefined") return null;
  const { getAuth } = require("firebase/auth");
  return getAuth(getFirebaseApp());
}
