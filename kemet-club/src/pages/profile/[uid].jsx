// src/pages/profile/[uid].jsx
import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { doc, getDoc, collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";

const G  = "#D4AF37";
const GL = "#F0D060";

const BADGES = {
  EXPLORER: { label: "EXPLORER", color: G,    icon: "🔺" },
  PHARAOH:  { label: "PHARAOH",  color: "#C0A020", icon: "👑" },
  LEGEND:   { label: "LEGEND",   color: GL,   icon: "⚡" },
};

export default function ProfilePage() {
  const router   = useRouter();
  const { uid }  = router.query;
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [posts,   setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);

  const isSelf = user?.uid === uid;

  useEffect(() => {
    if (!uid) return;
    (async () => {
      setLoading(true);
      try {
        const snap = await getDoc(doc(getDb(), "users", uid));
        if (snap.exists()) setProfile({ id: snap.id, ...snap.data() });
        const q     = query(collection(getDb(), "posts"), where("userId", "==", uid), orderBy("createdAt", "desc"));
        const pSnap = await getDocs(q);
        setPosts(pSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error("[Profile]", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [uid]);

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#000" }}>
      <div style={{ width: 44, height: 44, border: `2px solid rgba(212,175,55,0.3)`, borderTopColor: G, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  // If no Firestore profile yet — show basic profile from Firebase Auth
  if (!profile && !loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#000", paddingTop: 80 }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "60px 24px", textAlign: "center" }}>
          <div style={{ width: 90, height: 90, borderRadius: "50%", background: "linear-gradient(135deg,#D4AF37,#a08020)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem", margin: "0 auto 20px", border: "3px solid #D4AF37" }}>👤</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2rem", fontWeight: 300, color: "#fff", marginBottom: 8 }}>مرحباً بك في Kemet Club</h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem", marginBottom: 24 }}>حسابك جاهز — ابدأ برفع أول قصة لك</p>
          <button
            onClick={() => router.push("/")}
            style={{ background: "linear-gradient(135deg,#D4AF37,#a08020)", border: "none", borderRadius: 10, padding: "14px 36px", color: "#000", fontWeight: 700, cursor: "pointer", fontFamily: "'Cairo',sans-serif", fontSize: "0.9rem" }}
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const badge   = BADGES[profile.badge] || BADGES.EXPLORER;
  const pageUrl = typeof window !== "undefined" ? `${window.location.origin}/profile/${uid}` : `/profile/${uid}`;

  return (
    <>
      <Head>
        <title>{profile.name} | Kemet Club</title>
        <meta name="description" content={`${profile.name} — ${profile.bio || "عضو في Kemet Club"}`} />
        <meta property="og:title"       content={`${profile.name} | Kemet Club`} />
        <meta property="og:description" content={profile.bio || "عضو في Kemet Club"} />
        <meta property="og:image"       content={profile.avatar || "/og-image.jpg"} />
        <meta property="og:type"        content="profile" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org", "@type": "Person",
          "name": profile.name, "description": profile.bio || "",
          "image": profile.avatar || "", "url": pageUrl,
          "memberOf": { "@type": "Organization", "name": "Kemet Club" },
        })}} />
      </Head>

      <main style={{ minHeight: "100vh", background: "#000", paddingTop: 72 }}>
        {/* Hero */}
        <div style={{ background: "linear-gradient(to bottom,rgba(212,175,55,0.08),#000)", borderBottom: "1px solid rgba(212,175,55,0.1)", padding: "60px 24px 48px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", gap: 36, alignItems: "flex-start", flexWrap: "wrap" }}>
            {/* Avatar */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{ width: 110, height: 110, borderRadius: "50%", background: `linear-gradient(135deg,${G},#a08020)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem", border: `3px solid ${G}`, boxShadow: "0 0 30px rgba(212,175,55,0.4)", overflow: "hidden" }}>
                {profile.avatar ? <img src={profile.avatar} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt={profile.name} /> : "👤"}
              </div>
              <div style={{ position: "absolute", bottom: 0, right: -4, background: "#000", border: `2px solid ${G}`, borderRadius: "50%", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem" }}>
                {badge.icon}
              </div>
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6, flexWrap: "wrap" }}>
                <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2rem", fontWeight: 300, color: "#fff" }}>{profile.name}</h1>
                <span style={{ fontSize: "0.6rem", letterSpacing: "0.2em", fontWeight: 700, padding: "4px 12px", background: `linear-gradient(135deg,${G},#a08020)`, color: "#000" }}>
                  {badge.label}
                </span>
              </div>
              {profile.city && <div style={{ fontSize: "0.78rem", color: G, marginBottom: 12 }}>📍 {profile.city}</div>}
              {profile.bio  && <p style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.8, fontWeight: 300, marginBottom: 20, maxWidth: 480 }}>{profile.bio}</p>}

              {/* Stats */}
              <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
                {[["قصة", posts.length], ["نقطة", (profile.points || 0).toLocaleString()], ["متابِع", profile.followers || 0], ["متابَع", profile.following || 0]].map(([lbl, val]) => (
                  <div key={lbl} style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.8rem", fontWeight: 300, color: G, lineHeight: 1 }}>{val}</div>
                    <div style={{ fontSize: "0.65rem", letterSpacing: "0.15em", color: "rgba(255,255,255,0.5)", marginTop: 4 }}>{lbl}</div>
                  </div>
                ))}
              </div>
            </div>

            {isSelf && (
              <button style={{ background: "transparent", border: `1px solid rgba(212,175,55,0.4)`, color: G, padding: "10px 24px", borderRadius: 10, fontSize: "0.8rem", cursor: "pointer", fontFamily: "'Cairo',sans-serif" }}>
                ✏️ تعديل الملف
              </button>
            )}
          </div>
        </div>

        {/* Grid */}
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "36px 24px" }}>
          <div style={{ fontSize: "0.8rem", letterSpacing: "0.12em", color: "rgba(255,255,255,0.5)", marginBottom: 20 }}>
            📸 القصص ({posts.length})
          </div>

          {posts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(255,255,255,0.4)" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>📸</div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.5rem" }}>
                {isSelf ? "لم ترفع أي قصة بعد" : "لا توجد قصص"}
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 3 }}>
              {posts.map(post => (
                <div
                  key={post.id}
                  onClick={() => router.push(`/post/${post.id}`)}
                  style={{ aspectRatio: "1", position: "relative", overflow: "hidden", cursor: "pointer", background: "#161616", borderRadius: 4 }}
                >
                  {post.fileType === "video"
                    ? <video src={post.media} muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <img src={post.media} alt={post.title} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  }
                  <div style={{ position: "absolute", inset: 0, background: "transparent", transition: "background 0.3s", display: "flex", alignItems: "center", justifyContent: "center", gap: 20 }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.5)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <span style={{ color: "#fff", fontSize: "0.85rem", opacity: 0 }}
                      onMouseEnter={e => e.currentTarget.style.opacity = "1"}
                    >❤️ {post.likes||0}  💬 {post.comments||0}</span>
                  </div>
                  {post.fileType === "video" && <div style={{ position: "absolute", top: 8, left: 8, color: "#fff", fontSize: "0.8rem" }}>▶</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
