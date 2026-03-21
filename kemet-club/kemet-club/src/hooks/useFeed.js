// src/hooks/useFeed.js
import { useState, useEffect, useRef, useCallback } from "react";
import {
  collection, query, orderBy, limit,
  startAfter, getDocs, doc, updateDoc, increment,
  arrayUnion, arrayRemove, addDoc, serverTimestamp, getDoc,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";

const PAGE_SIZE = 10;

export function useFeed() {
  const [posts,       setPosts]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore,     setHasMore]     = useState(true);
  const lastDocRef = useRef(null);

  useEffect(() => { loadInitial(); }, []);

  async function loadInitial() {
    setLoading(true);
    try {
      const db   = getDb();
      const q    = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(PAGE_SIZE));
      const snap = await getDocs(q);
      lastDocRef.current = snap.docs[snap.docs.length - 1] || null;
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setHasMore(snap.docs.length === PAGE_SIZE);
    } catch (e) {
      console.error("[Feed]", e);
    } finally {
      setLoading(false);
    }
  }

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !lastDocRef.current) return;
    setLoadingMore(true);
    try {
      const db   = getDb();
      const q    = query(collection(db, "posts"), orderBy("createdAt", "desc"), startAfter(lastDocRef.current), limit(PAGE_SIZE));
      const snap = await getDocs(q);
      lastDocRef.current = snap.docs[snap.docs.length - 1] || null;
      setPosts(prev => [...prev, ...snap.docs.map(d => ({ id: d.id, ...d.data() }))]);
      setHasMore(snap.docs.length === PAGE_SIZE);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore]);

  async function toggleLike(postId, userId) {
    if (!userId) return;
    const db    = getDb();
    const ref   = doc(db, "posts", postId);
    const snap  = await getDoc(ref);
    if (!snap.exists()) return;
    const liked = (snap.data()?.likedBy || []).includes(userId);
    const delta = liked ? -1 : 1;
    setPosts(prev => prev.map(p =>
      p.id !== postId ? p : {
        ...p,
        likes:   (p.likes  || 0) + delta,
        likedBy: liked
          ? (p.likedBy || []).filter(id => id !== userId)
          : [...(p.likedBy || []), userId],
      }
    ));
    try {
      await updateDoc(ref, {
        likes:   increment(delta),
        likedBy: liked ? arrayRemove(userId) : arrayUnion(userId),
      });
    } catch {
      setPosts(prev => prev.map(p =>
        p.id !== postId ? p : {
          ...p,
          likes:   (p.likes  || 0) - delta,
          likedBy: liked
            ? [...(p.likedBy || []), userId]
            : (p.likedBy || []).filter(id => id !== userId),
        }
      ));
    }
  }

  async function toggleSave(postId, userId) {
    if (!userId) return;
    const db    = getDb();
    const ref   = doc(db, "users", userId);
    const snap  = await getDoc(ref);
    const saved = (snap.data()?.savedPosts || []).includes(postId);
    await updateDoc(ref, { savedPosts: saved ? arrayRemove(postId) : arrayUnion(postId) });
    return !saved;
  }

  async function addComment(postId, { userId, name, avatar, text }) {
    const db = getDb();
    await addDoc(collection(db, "posts", postId, "comments"), {
      userId, name, avatar, text, createdAt: serverTimestamp(), likes: 0,
    });
    await updateDoc(doc(db, "posts", postId), { comments: increment(1) });
  }

  return { posts, loading, loadingMore, hasMore, loadMore, toggleLike, toggleSave, addComment, reload: loadInitial };
}
