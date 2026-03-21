// ─────────────────────────────────────────────
// src/pages/index.jsx  —  Kemet Club Landing Page
// Full: Hero + Feed + FaceOfEgypt + Membership
// ─────────────────────────────────────────────
import Head from "next/head";
import { useState } from "react";
import { useFeed }        from "@/hooks/useFeed";
import { useAuth }        from "@/hooks/useAuth";
import PostCard           from "@/components/PostCard";
import TikTokFeed         from "@/components/TikTokFeed";
import UploadModal        from "@/components/UploadModal";
import AuthModal          from "@/components/AuthModal";
import FaceOfEgypt        from "@/components/FaceOfEgypt";

export default function Home() {
  const { user, profile, logout } = useAuth();
  const {
    posts, loading, loadingMore, hasMore,
    loadMore, toggleLike, toggleSave, addComment, reload,
  } = useFeed();

  const [uploadOpen,   setUploadOpen]   = useState(false);
  const [authOpen,     setAuthOpen]     = useState(false);
  const [authMode,     setAuthMode]     = useState("signup");
  const [feedMode,     setFeedMode]     = useState("grid");   // "grid" | "tiktok"
  const [mobileMenu,   setMobileMenu]   = useState(false);

  function openAuth(mode = "signup") { setAuthMode(mode); setAuthOpen(true); }

  return (
    <>
      <Head>
        <title>Kemet Club | نادي كيميت — Live Egypt. Share Your Story.</title>
        <meta name="description" content="منصة السياحة الاجتماعية الأولى في مصر. شارك تجاربك، اكتشف المواقع الأسطورية، وانضم إلى مجتمع حصري." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Open Graph */}
        <meta property="og:title"       content="Kemet Club — Live Egypt. Share Your Story." />
        <meta property="og:description" content="Premium social tourism platform for Egypt experiences." />
        <meta property="og:type"        content="website" />
        <meta property="og:image"       content="/og-image.jpg" />
        {/* Schema */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "TouristInformationCenter",
          "name": "Kemet Club",
          "description": "Social tourism platform for Egypt",
          "url": "https://kemetclub.com",
          "areaServed": { "@type": "Country", "name": "Egypt" },
        })}} />
      </Head>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
        padding: "18px 48px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "rgba(0,0,0,0.95)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(212,175,55,0.1)",
        flexWrap: "wrap", gap: 12,
      }}>
        <a href="#" style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "1.6rem", fontWeight: 600,
          color: "var(--gold)", textDecoration: "none", letterSpacing: "0.08em",
        }}>
          Kemet Club
          <small style={{ display: "block", fontSize: "0.58rem", letterSpacing: "0.2em", color: "var(--white-muted)", fontFamily: "'Cairo', sans-serif", fontWeight: 300 }}>
            نادي كيميت
          </small>
        </a>

        <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
          <a href="#feed"      style={{ color: "var(--white-muted)", textDecoration: "none", fontSize: "0.78rem", letterSpacing: "0.12em", transition: "color 0.3s" }}>STORIES</a>
          <a href="#foe"       style={{ color: "var(--white-muted)", textDecoration: "none", fontSize: "0.78rem", letterSpacing: "0.12em", transition: "color 0.3s" }}>FACE OF EGYPT</a>
          <a href="#explore"   style={{ color: "var(--white-muted)", textDecoration: "none", fontSize: "0.78rem", letterSpacing: "0.12em", transition: "color 0.3s" }}>EXPLORE</a>
          <a href="#member"    style={{ color: "var(--white-muted)", textDecoration: "none", fontSize: "0.78rem", letterSpacing: "0.12em", transition: "color 0.3s" }}>MEMBERSHIP</a>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {user ? (
            <>
              <button
                className="btn btn-outline"
                onClick={() => setUploadOpen(true)}
                style={{ padding: "9px 20px", fontSize: "0.78rem", borderRadius: 8 }}
              >+ رفع قصة</button>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "linear-gradient(135deg, var(--gold), var(--gold-dark))",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", fontSize: "0.9rem",
                border: "1px solid rgba(212,175,55,0.4)",
                position: "relative",
              }}
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.location.href = `/profile/${user.uid}`;
                  }
                }}
                title="ملفي الشخصي"
              >
                {profile?.avatar ? <img src={profile.avatar} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} alt="" /> : "👤"}
              </div>
              <button
                onClick={logout}
                style={{ background:"none", border:"1px solid rgba(255,255,255,0.15)", color:"rgba(255,255,255,0.5)", padding:"6px 14px", borderRadius:8, fontSize:"0.72rem", cursor:"pointer" }}
              >خروج</button>
            </>
          ) : (
            <>
              <button className="btn btn-outline" onClick={() => openAuth("login")} style={{ padding: "9px 20px", fontSize: "0.78rem", borderRadius: 8 }}>
                تسجيل دخول
              </button>
              <button className="btn btn-gold" onClick={() => openAuth("signup")} style={{ padding: "10px 24px", fontSize: "0.78rem", borderRadius: 8 }}>
                JOIN KEMET CLUB
              </button>
            </>
          )}
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        height: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative", overflow: "hidden",
        background: "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(212,175,55,0.12) 0%, transparent 60%), linear-gradient(to bottom, #000 0%, #0A0A06 100%)",
      }}>
        {/* Pyramids SVG */}
        <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", opacity: 0.18 }}>
          <svg viewBox="0 0 1400 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", display: "block" }}>
            <polygon points="700,0 380,300 1020,300" fill="#D4AF37" opacity="0.6"/>
            <polygon points="280,70 80,300 480,300" fill="#D4AF37" opacity="0.4"/>
            <polygon points="1100,110 940,300 1260,300" fill="#D4AF37" opacity="0.3"/>
            <polygon points="140,140 40,300 240,300" fill="#D4AF37" opacity="0.2"/>
            <rect x="0" y="295" width="1400" height="5" fill="#D4AF37" opacity="0.25"/>
          </svg>
        </div>

        <div style={{ position: "relative", zIndex: 10, textAlign: "center", maxWidth: 860, padding: "0 32px" }}>
          <div className="eyebrow animate-fade-up" style={{ marginBottom: 22, animationDelay: "0.2s" }}>
            ✦ WELCOME TO THE MOST EXCLUSIVE EGYPT COMMUNITY ✦
          </div>
          <h1 className="animate-fade-up" style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(3rem, 8vw, 6.5rem)",
            fontWeight: 300, lineHeight: 1.05,
            color: "var(--white)", marginBottom: 24,
            animationDelay: "0.4s",
          }}>
            Live <em style={{ fontStyle: "italic", background: "linear-gradient(135deg, #F0D060, #D4AF37, #A08020)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Egypt.</em><br />
            Share Your Story.<br />
            Become <em style={{ fontStyle: "italic", background: "linear-gradient(135deg, #F0D060, #D4AF37, #A08020)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Kemet.</em>
          </h1>
          <p className="animate-fade-up" style={{
            fontSize: "1rem", color: "var(--white-muted)", fontWeight: 300,
            lineHeight: 1.9, maxWidth: 560, margin: "0 auto 40px",
            animationDelay: "0.6s",
          }}>
            منصة السياحة الاجتماعية الأولى في مصر. شارك تجاربك، اكتشف المواقع الأسطورية، وانضم إلى مجتمع حصري من عشاق مصر.
          </p>
          <div className="animate-fade-up" style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", animationDelay: "0.8s" }}>
            <button className="btn btn-gold" onClick={() => openAuth("signup")} style={{ padding: "16px 44px", borderRadius: 10, fontSize: "0.88rem" }}>
              JOIN KEMET CLUB
            </button>
            <button className="btn btn-outline" onClick={() => document.getElementById("foe")?.scrollIntoView({ behavior: "smooth" })} style={{ padding: "16px 44px", borderRadius: 10, fontSize: "0.88rem" }}>
              BECOME THE FACE OF EGYPT
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, opacity: 0.6 }}>
          <div style={{ width: 1, height: 60, background: "linear-gradient(to bottom, var(--gold), transparent)", animation: "scrollPulse 2s ease-in-out infinite" }} />
          <span style={{ fontSize: "0.62rem", letterSpacing: "0.25em", color: "var(--white-muted)" }}>SCROLL</span>
        </div>
      </section>

      {/* ── FACE OF EGYPT ── */}
      <div id="foe"><FaceOfEgypt /></div>

      {/* ── FEED SECTION ── */}
      <section id="feed" style={{ padding: "100px 0", background: "var(--black-mid, #111)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
          {/* Feed header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48, flexWrap: "wrap", gap: 16 }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 10 }}>✦ REAL-TIME ✦</div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem,5vw,3.5rem)", fontWeight: 300, color: "var(--white)" }}>
                Live <em style={{ color: "var(--gold)", fontStyle: "italic" }}>Story Feed</em>
              </h2>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              {/* Feed mode toggle */}
              <button className={`btn btn-ghost ${feedMode === "grid" ? "active" : ""}`} onClick={() => setFeedMode("grid")} style={{ borderRadius: 8, padding: "8px 18px" }}>🔲 شبكة</button>
              <button className={`btn btn-ghost ${feedMode === "tiktok" ? "active" : ""}`} onClick={() => setFeedMode("tiktok")} style={{ borderRadius: 8, padding: "8px 18px" }}>📱 TikTok</button>
              {user && (
                <button className="btn btn-gold" onClick={() => setUploadOpen(true)} style={{ borderRadius: 8, padding: "10px 22px", fontSize: "0.8rem" }}>
                  + ارفع قصة
                </button>
              )}
            </div>
          </div>

          {/* TikTok mode */}
          {feedMode === "tiktok" && (
            <div style={{ height: "80vh", borderRadius: 20, overflow: "hidden", border: "1px solid rgba(212,175,55,0.2)" }}>
              <TikTokFeed
                posts={posts}
                onLike={toggleLike}
                onLoadMore={loadMore}
                hasMore={hasMore}
              />
            </div>
          )}

          {/* Grid mode */}
          {feedMode === "grid" && (
            <>
              {loading ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
                  {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="skeleton" style={{ height: 360, borderRadius: 20 }} />
                  ))}
                </div>
              ) : posts.length === 0 ? (
                <div style={{ textAlign: "center", padding: "80px 20px" }}>
                  <div style={{ fontSize: "3rem", marginBottom: 14 }}>📸</div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.8rem", color: "var(--white-muted)", fontWeight: 300 }}>
                    لا توجد قصص بعد
                  </div>
                  <p style={{ color: "var(--white-muted)", margin: "12px 0 24px", fontSize: "0.82rem" }}>
                    كن أول من يشارك تجربته في مصر
                  </p>
                  <button className="btn btn-gold" onClick={() => user ? setUploadOpen(true) : openAuth("signup")} style={{ padding: "14px 36px", borderRadius: 10 }}>
                    + ارفع أول قصة
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
                    {posts.map(post => (
                      <PostCard
                        key={post.id}
                        post={post}
                        onLike={toggleLike}
                        onSave={toggleSave}
                        onComment={addComment}
                      />
                    ))}
                  </div>
                  {hasMore && (
                    <div style={{ textAlign: "center", marginTop: 36 }}>
                      <button
                        className="btn btn-outline"
                        onClick={loadMore}
                        disabled={loadingMore}
                        style={{ padding: "14px 44px", borderRadius: 10, opacity: loadingMore ? 0.7 : 1 }}
                      >
                        {loadingMore ? "جاري التحميل..." : "تحميل المزيد ↓"}
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </section>

      {/* ── MODALS ── */}
      <UploadModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSuccess={() => { setUploadOpen(false); reload(); }}
      />
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        defaultMode={authMode}
      />

      <style>{`
        @keyframes scrollPulse { 0%,100%{opacity:0.3} 50%{opacity:1} }
        @media (max-width: 768px) {
          nav { padding: 14px 20px !important; }
          nav > div:nth-child(2) { display: none; }
        }
      `}</style>
    </>
  );
}
