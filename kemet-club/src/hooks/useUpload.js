// src/hooks/useUpload.js
import { useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { addDoc, collection, serverTimestamp, doc, updateDoc, increment } from "firebase/firestore";
import { getDb, getFirebaseStorage } from "@/lib/firebase";

export function useUpload() {
  const [progress,  setProgress]  = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error,     setError]     = useState(null);

  async function uploadPost({ file, title, desc, location, userId, userName, userAvatar, onSuccess }) {
    if (!file || !userId) { setError("ملف أو مستخدم غير صحيح"); return; }
    setUploading(true); setProgress(0); setError(null);
    try {
      const storage  = getFirebaseStorage();
      const db       = getDb();
      const ext      = file.name.split(".").pop().toLowerCase();
      const filename = `posts/${userId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const stRef    = ref(storage, filename);
      const task     = uploadBytesResumable(stRef, file, { contentType: file.type });

      await new Promise((resolve, reject) => {
        task.on("state_changed",
          snap => setProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
          reject, resolve
        );
      });

      const url      = await getDownloadURL(task.snapshot.ref);
      const fileType = file.type.startsWith("video") ? "video" : "image";
      const now      = new Date();
      const week     = Math.ceil(((now - new Date(now.getFullYear(), 0, 1)) / 86400000 + new Date(now.getFullYear(), 0, 1).getDay() + 1) / 7);

      const postRef = await addDoc(collection(db, "posts"), {
        userId, userName: userName || "", userAvatar: userAvatar || "",
        title: title || "", desc: desc || "", location: location || "",
        media: url, storagePath: filename, fileType,
        likes: 0, likedBy: [], comments: 0, shares: 0, saves: 0, views: 0,
        weeklyVotes: 0,
        weekCode: `${now.getFullYear()}-${String(week).padStart(2, "0")}`,
        createdAt: serverTimestamp(),
      });

      await updateDoc(doc(db, "users", userId), { stories: increment(1), points: increment(50) });
      setProgress(100);
      onSuccess?.({ id: postRef.id, url, fileType });
      return postRef.id;
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  return { uploadPost, progress, uploading, error };
}
