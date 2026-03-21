// src/hooks/useShare.js
import { useCallback } from "react";
import { doc, updateDoc, increment } from "firebase/firestore";
import { getDb } from "@/lib/firebase";

export function useShare() {
  const sharePost = useCallback(async ({ postId, title, desc, url }) => {
    if (typeof window === "undefined") return { success: false };
    const shareUrl   = url || `${window.location.origin}/post/${postId}`;
    const shareTitle = title || "Kemet Club";
    const shareText  = desc  || "شوف رحلتي في مصر 🔥 | Kemet Club";

    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
        _track(postId);
        return { success: true, method: "native" };
      } catch (err) {
        if (err.name === "AbortError") return { success: false, method: "abort" };
      }
    }
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        _track(postId);
        return { success: true, method: "clipboard" };
      } catch {}
    }
    const ta = document.createElement("textarea");
    ta.value = shareUrl;
    ta.style.cssText = "position:fixed;opacity:0;top:0;left:0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      _track(postId);
      document.body.removeChild(ta);
      return { success: true, method: "execCommand" };
    } catch {
      document.body.removeChild(ta);
      return { success: false, url: shareUrl };
    }
  }, []);

  async function _track(postId) {
    if (!postId) return;
    try {
      const db = getDb();
      await updateDoc(doc(db, "posts", postId), { shares: increment(1) });
    } catch {}
  }

  function getShareLinks({ postId, title }) {
    if (typeof window === "undefined") return {};
    const url  = `${window.location.origin}/post/${postId}`;
    const text = encodeURIComponent(`${title || "قصتي في مصر"} 🔥 | Kemet Club`);
    const enc  = encodeURIComponent(url);
    return {
      whatsapp: `https://wa.me/?text=${text}%20${enc}`,
      facebook: `https://facebook.com/sharer/sharer.php?u=${enc}`,
      twitter:  `https://twitter.com/intent/tweet?text=${text}&url=${enc}`,
    };
  }

  return { sharePost, getShareLinks };
}
