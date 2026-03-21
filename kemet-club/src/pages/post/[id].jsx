// src/pages/post/[id].jsx
import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { doc, onSnapshot, collection, query, orderBy, addDoc, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useShare } from "@/hooks/useShare";
import { useFeed } from "@/hooks/useFeed";

const G = "#D4AF37";

function timeAgo(ts) {
  if (!ts) return "";
  const sec = Math.floor((Date.now() - (ts?.toDate?.() || new Date(ts))) / 1000);
  if (sec < 60)    return "الآن";
  if (sec < 3600)  return `${Math.floor(sec/60)} دقيقة`;
  if (sec < 86400) return `${Math.floor(sec/3600)} ساعة`;
  return `${Math.floor(sec/86400)} يوم`;
}

export default function PostPage() {
  const router        = useRouter();
  const { id }        = router.query;
  const { user }      = useAuth();
  const { sharePost } = useShare();
  const { toggleLike } = useFeed();

  const [post,     setPost]     = useState(null);
  const [comments, setComments] = useState([]);
  const [cmtTxt,   setCmtTxt]   = useState("");
  const [loading,  setLoading]  = useState(true);
  const [toast,    setToast]    = useState(null);

  function notify(msg) { setToast(msg); setTimeout(() => setToast(null), 3000); }

  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(getDb(), "posts", id), snap => {
      if (snap.exists()) setPost({ id: snap.id, ...snap.data() });
      setLoading(false);
    });
    return unsub;
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const q = query(collection(getDb(), "posts", id, "comments"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, snap => {
      setComments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [id]);

  async function handleComment(e) {
    e.preventDefault();
    if (!user || !cmtTxt.trim()) return;
    await addDoc(collection(getDb(), "posts", id, "comments"), {
      text: cmtTxt.trim(), userId: user.uid,
      name: user.displayName || "مستخدم", avatar: user.photoURL || "",
      createdAt: serverTimestamp(),
    });
    await updateDoc(doc(getDb(), "posts", id), { comments: increment(1) });
    setCmtTxt(""); notify("✦ تم إضافة تعليقك");
  }

  async function handleShare() {
    const r = await sharePost({ postId: id, title: post?.title, desc: post?.desc });
    if (r?.success) notify(r.method === "native" ? "تم المشاركة ✦" : "تم نسخ الرابط 📋");
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#000" }}>
      <div style={{ width: 40, height: 40, border: `2px solid rgba(212,175,55,0.3)`, borderTopColor: G, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!post) return (
    <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <div style={{ fontSize: "3rem" }}>🔍</div>
      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2rem", color: "rgba(255,255,255,0.5)" }}>القصة غير موجودة</div>
    </div>
  );

  const liked  = user && (post.likedBy || []).includes(user.uid);
  const pageUrl = typeof window !== "undefined" ? `${window.location.origin}/post/${id}` : `/post/${id}`;

  return (
    <>
      <Head>
        <title>{post.title || "Kemet Story"} | Kemet Club</title>
        <meta name="description" content={post.desc?.slice(0, 160) || "تجربة سياحية في مصر"} />
        <meta property="og:title"       content={post.title || "Kemet Story"} />
        <meta property="og:description" content={post.desc?.slice(0, 200) || ""} />
        <meta property="og:image"       content={post.fileType === "image" ? post.media : "/og-image.jpg"} />
        <meta property="og:url"         content={pageUrl} />
        <meta property="og:type"        content="article" />
        <meta name="twitter:card"       content="summary_large_image" />
        <meta name="twitter:image"      content={post.fileType === "image" ? post.media : "/og-image.jpg"} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org", "@type": "TouristAttraction",
          "name": post.title || "Egypt Experience",
          "description": post.desc || "",
          "image": post.media,
          "author": { "@type": "Person", "name": post.userName || "Kemet Member" },
          "contentLocation": { "@type": "Place", "name": post.location || "Egypt" },
        })}} />
      </Head>

      <main style={{ minHeight: "100vh", background: "#000", paddingTop: 80 }}>
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 24px 0" }}>
          <button onClick={() => router.back()} style={{ background: "none", border: "none", color: G, fontSize: "0.82rem", letterSpacing: "0.12em", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontFamily: "'Cairo',sans-serif" }}>
            ← العودة
          </button>
        </div>

        <article style={{ maxWidth: 860, margin: "0 auto", padding: "32px 24px" }}>
          {/* Media */}
          <div style={{ borderRadius: 20, overflow: "hidden", marginBottom: 32, border: `1px solid ${G}`, boxShadow: "0 0 40px rgba(212,175,55,0.2)" }}>
            {post.fileType === "video"
              ? <video src={post.media} controls style={{ width: "100%", maxHeight: 520, objectFit: "cover", display: "block" }} />
              : <img src={post.media} alt={post.title} style={{ width: "100%", maxHeight: 520, objectFit: "cover", display: "block" }} />
            }
          </div>

          {/* Meta */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 46, height: 46, borderRadius: "50%", background: `linear-gradient(135deg,${G},#a08020)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", border: "2px solid rgba(212,175,55,0.4)", overflow: "hidden" }}>
                {post.userAvatar ? <img src={post.userAvatar} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} alt="" /> : "👤"}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: "#fff", fontSize: "0.9rem" }}>{post.userName || "مستخدم"}</div>
                <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.5)" }}>{timeAgo(post.createdAt)}</div>
              </div>
            </div>
            {post.location && (
              <div style={{ fontSize: "0.72rem", letterSpacing: "0.12em", color: G, background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.2)", padding: "6px 14px", borderRadius: 20 }}>
                📍 {post.location}
              </div>
            )}
          </div>

          {post.title && <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 300, color: "#fff", marginBottom: 16, lineHeight: 1.25 }}>{post.title}</h1>}
          {post.desc  && <p  style={{ fontSize: "1rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.9, fontWeight: 300, marginBottom: 28 }}>{post.desc}</p>}

          {/* Engagement */}
          <div style={{ display: "flex", gap: 12, alignItems: "center", padding: "18px 0", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 36, flexWrap: "wrap" }}>
            {[
              { icon: liked ? "❤️" : "🤍", label: `${post.likes||0} إعجاب`, action: () => toggleLike(post.id, user?.uid), active: liked },
              { icon: "💬", label: `${comments.length} تعليق` },
              { icon: "📤", label: "مشاركة", action: handleShare },
            ].map((btn, i) => (
              <button key={i} onClick={btn.action} style={{
                background: btn.active ? "rgba(200,30,30,0.25)" : "rgba(0,0,0,0.4)",
                border: `1px solid ${btn.active ? "rgba(255,80,80,0.4)" : "rgba(212,175,55,0.2)"}`,
                color: btn.active ? "#ff6b6b" : "rgba(255,255,255,0.7)",
                borderRadius: 10, padding: "10px 20px", cursor: btn.action ? "pointer" : "default",
                display: "flex", alignItems: "center", gap: 8, fontSize: "0.85rem",
                fontFamily: "'Cairo',sans-serif", backdropFilter: "blur(8px)",
              }}>
                {btn.icon} {btn.label}
              </button>
            ))}
          </div>

          {/* Comments */}
          <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.5rem", fontWeight: 300, color: "#fff", marginBottom: 24 }}>
            التعليقات <em style={{ color: G, fontStyle: "italic" }}>({comments.length})</em>
          </h3>

          <form onSubmit={handleComment} style={{ display: "flex", gap: 10, marginBottom: 28 }}>
            <input
              value={cmtTxt} onChange={e => setCmtTxt(e.target.value)}
              placeholder="شارك رأيك..."
              style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", padding: "13px 18px", borderRadius: 10, fontFamily: "'Cairo',sans-serif", fontSize: "0.85rem", outline: "none" }}
            />
            <button type="submit" style={{ background: `linear-gradient(135deg,${G},#a08020)`, border: "none", borderRadius: 10, padding: "13px 24px", color: "#000", fontWeight: 700, cursor: "pointer", fontFamily: "'Cairo',sans-serif", whiteSpace: "nowrap" }}>
              إرسال
            </button>
          </form>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {comments.map(c => (
              <div key={c.id} style={{ display: "flex", gap: 12, padding: "16px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg,${G},#a08020)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem", flexShrink: 0, overflow: "hidden" }}>
                  {c.avatar ? <img src={c.avatar} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} alt="" /> : "👤"}
                </div>
                <div>
                  <div style={{ display: "flex", gap: 10, alignItems: "baseline", marginBottom: 4 }}>
                    <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#fff" }}>{c.name}</span>
                    <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.4)" }}>{timeAgo(c.createdAt)}</span>
                  </div>
                  <p style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.7, fontWeight: 300 }}>{c.text}</p>
                </div>
              </div>
            ))}
            {comments.length === 0 && (
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.85rem", textAlign: "center", padding: "24px 0" }}>
                كن أول من يعلّق على هذه القصة ✦
              </p>
            )}
          </div>
        </article>
      </main>

      {toast && (
        <div style={{ position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)", background: "#0a1400", border: `1px solid rgba(212,175,55,0.4)`, color: G, padding: "11px 24px", fontSize: "0.78rem", borderRadius: 8, zIndex: 9000, pointerEvents: "none" }}>
          {toast}
        </div>
      )}
    </>
  );
}
