// src/components/FaceOfEgypt.jsx
import { useState, useEffect, useCallback } from "react";
import {
  collection, query, orderBy, limit,
  getDocs, doc, updateDoc, increment, where,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";

function getWeekCode() {
  const now   = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const week  = Math.ceil(((now - start) / 86400000 + start.getDay() + 1) / 7);
  return `${now.getFullYear()}-${String(week).padStart(2, "0")}`;
}

function getWeekEnd() {
  const now = new Date();
  const end = new Date(now);
  end.setDate(end.getDate() + (8 - end.getDay()) % 7 || 7);
  end.setHours(0, 0, 0, 0);
  return end;
}

const PRIZES = [
  { icon: "✈️", title: "رحلة مجانية إلى الأقصر", sub: "باقة 5 نجوم شاملة" },
  { icon: "🌍", title: "تغطية عالمية",            sub: "في 98 دولة" },
  { icon: "👑", title: "شارة الفرعون",            sub: "مدى الحياة" },
  { icon: "💰", title: "صفقات البراندات",         sub: "أكبر العلامات في مصر" },
];

const G  = "#D4AF37";
const GL = "#F0D060";

export default function FaceOfEgypt() {
  const { user }    = useAuth();
  const [leaders,   setLeaders]  = useState([]);
  const [loading,   setLoading]  = useState(true);
  const [timeLeft,  setTimeLeft] = useState({});
  const [votedFor,  setVotedFor] = useState(null);

  const loadLeaders = useCallback(async () => {
    setLoading(true);
    try {
      const q    = query(collection(getDb(), "posts"), where("weekCode", "==", getWeekCode()), orderBy("weeklyVotes", "desc"), limit(5));
      const snap = await getDocs(q);
      setLeaders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error("[FaceOfEgypt]", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadLeaders(); }, [loadLeaders]);

  useEffect(() => {
    function tick() {
      const diff = getWeekEnd() - Date.now();
      if (diff <= 0) { loadLeaders(); return; }
      setTimeLeft({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    }
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [loadLeaders]);

  async function vote(postId) {
    if (!user) { alert("سجّل دخولك للتصويت"); return; }
    if (votedFor) return;
    setVotedFor(postId);
    try {
      await updateDoc(doc(getDb(), "posts", postId), { weeklyVotes: increment(1) });
      setLeaders(prev =>
        prev.map(p => p.id === postId ? { ...p, weeklyVotes: (p.weeklyVotes || 0) + 1 } : p)
            .sort((a, b) => (b.weeklyVotes || 0) - (a.weeklyVotes || 0))
      );
    } catch (e) {
      setVotedFor(null);
      console.error("[Vote]", e);
    }
  }

  const fmt      = n  => String(n ?? 0).padStart(2, "0");
  const maxVotes = leaders[0]?.weeklyVotes || 1;

  return (
    <section style={{ padding: "120px 0", background: `radial-gradient(ellipse 100% 80% at 50% 50%, rgba(212,175,55,0.07) 0%, transparent 60%), #0A0A0A` }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <span style={{ fontSize: "3rem", display: "block", marginBottom: 16 }}>👑</span>
          <div style={{ fontSize: "0.68rem", letterSpacing: "0.35em", color: G, marginBottom: 14 }}>✦ WEEKLY COMPETITION ✦</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(2.5rem,6vw,5rem)", fontWeight: 300, color: "#fff", lineHeight: 1.1 }}>
            Become the{" "}
            <em style={{ fontStyle: "italic", background: `linear-gradient(135deg,${GL},${G},#a08020)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Face of Egypt
            </em>
          </h2>
          <div style={{ height: 1, background: `linear-gradient(to right,transparent,${G},transparent)`, opacity: 0.3, width: 120, margin: "24px auto" }} />
          <p style={{ fontSize: "0.92rem", color: "rgba(255,255,255,0.5)", maxWidth: 580, margin: "0 auto", lineHeight: 2, fontWeight: 300 }}>
            كل أسبوع، يتنافس أفضل صناع المحتوى في مصر على لقب &quot;وجه مصر&quot;.<br />
            الفائز يُعرض عالمياً ويفوز برحلات مجانية حصرية.
          </p>
        </div>

        {/* Competition Banner */}
        <div style={{ background: "linear-gradient(135deg,#0D0D00,#1A1500,#0D0D00)", border: "1px solid rgba(212,175,55,0.3)", borderRadius: 20, padding: 52, marginBottom: 52, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)", fontSize: "0.58rem", letterSpacing: "0.4em", color: G, opacity: 0.5 }}>
            WEEKLY COMPETITION
          </div>

          {/* Countdown */}
          <div style={{ display: "flex", justifyContent: "center", gap: 32, marginBottom: 44, flexWrap: "wrap" }}>
            {[["d","أيام"],["h","ساعات"],["m","دقائق"],["s","ثواني"]].map(([k, lbl], i, arr) => (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: i < arr.length-1 ? 0 : 0 }}>
                <div style={{ textAlign: "center" }}>
                  <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "3.8rem", fontWeight: 700, color: G, lineHeight: 1, display: "block", textShadow: `0 0 40px rgba(212,175,55,0.5)` }}>
                    {fmt(timeLeft[k])}
                  </span>
                  <div style={{ fontSize: "0.6rem", letterSpacing: "0.25em", color: "rgba(255,255,255,0.5)", marginTop: 6 }}>{lbl}</div>
                </div>
                {i < arr.length - 1 && (
                  <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2.8rem", color: G, opacity: 0.4, margin: "0 14px 20px" }}>:</span>
                )}
              </div>
            ))}
          </div>

          {/* Prizes */}
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 36 }}>
            {PRIZES.map((p, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 10, padding: "13px 20px" }}>
                <span style={{ fontSize: "1.3rem" }}>{p.icon}</span>
                <div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: G }}>{p.title}</div>
                  <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.5)" }}>{p.sub}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center" }}>
            <button
              onClick={() => alert("ارفع قصتك أولاً من قسم الـ Feed!")}
              style={{
                background: `linear-gradient(135deg,${GL},${G},#a08020)`,
                color: "#000", border: "none", borderRadius: 10, padding: "18px 56px",
                fontSize: "0.95rem", fontWeight: 700, letterSpacing: "0.2em", cursor: "pointer",
                fontFamily: "'Cairo',sans-serif",
              }}
            >
              ⚡ ادخل المسابقة الأسبوعية
            </button>
          </div>
        </div>

        {/* Leaderboard */}
        <div style={{ marginBottom: 56 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
            <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.8rem", color: "#fff", fontWeight: 300 }}>
              متصدرو هذا الأسبوع{" "}
              <em style={{ color: G, fontStyle: "italic" }}>الترتيب</em>
            </h3>
            <span style={{ fontSize: "0.62rem", letterSpacing: "0.2em", color: G }}>الأسبوع {getWeekCode()}</span>
          </div>

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ height: 80, borderRadius: 12, background: "linear-gradient(90deg,#111 0%,rgba(212,175,55,0.05) 50%,#111 100%)", backgroundSize: "200% 100%", animation: "skelShimmer 1.5s ease-in-out infinite" }} />
              ))}
            </div>
          ) : leaders.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "rgba(255,255,255,0.5)" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🏆</div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.5rem" }}>لا يوجد منافسون بعد — كن الأول!</div>
            </div>
          ) : (
            <div>
              {leaders.map((post, idx) => {
                const rankColors = [G, "#C0C0C0", "#CD7F32", "rgba(255,255,255,0.5)", "rgba(255,255,255,0.5)"];
                const barWidth   = ((post.weeklyVotes || 0) / maxVotes) * 100;
                const isVoted    = votedFor === post.id;

                return (
                  <div key={post.id} style={{
                    background: idx === 0 ? "linear-gradient(90deg,rgba(212,175,55,0.12),transparent)" : "transparent",
                    borderBottom: `1px solid ${idx === 0 ? "rgba(212,175,55,0.25)" : "rgba(255,255,255,0.04)"}`,
                  }}>
                    <div style={{ display: "grid", gridTemplateColumns: "56px 1fr 110px 130px", alignItems: "center", padding: "18px 20px", gap: 12 }}>
                      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.6rem", fontWeight: 700, color: rankColors[idx], textAlign: "center" }}>
                        {idx === 0 ? "👑" : `0${idx + 1}`}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ width: 46, height: 46, borderRadius: "50%", background: `linear-gradient(135deg,${G},#a08020)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0, border: idx === 0 ? `2px solid ${G}` : "1px solid rgba(212,175,55,0.2)", overflow: "hidden" }}>
                          {post.userAvatar ? <img src={post.userAvatar} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} alt="" /> : "👤"}
                        </div>
                        <div>
                          <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#fff" }}>{post.userName || "مستخدم"}</div>
                          {post.location && <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.5)", marginTop: 2 }}>📍 {post.location}</div>}
                          <div style={{ fontSize: "0.58rem", letterSpacing: "0.1em", padding: "2px 9px", marginTop: 4, display: "inline-block", background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.25)", color: G }}>
                            {idx === 0 ? "LEADING" : idx < 3 ? "TOP 3" : "EXPLORER"}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.4rem", color: "#fff", fontWeight: 600, display: "block" }}>{(post.weeklyVotes || 0).toLocaleString()}</span>
                        <span style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em" }}>VOTES</span>
                      </div>
                      <button
                        onClick={() => vote(post.id)}
                        disabled={!!votedFor}
                        style={{
                          background: isVoted ? `linear-gradient(135deg,${G},#a08020)` : "transparent",
                          border: "1px solid rgba(212,175,55,0.4)", color: isVoted ? "#000" : G,
                          padding: "9px 16px", fontFamily: "'Cairo',sans-serif", fontSize: "0.72rem",
                          letterSpacing: "0.1em", cursor: votedFor ? "not-allowed" : "pointer",
                          opacity: votedFor && !isVoted ? 0.4 : 1, borderRadius: 8,
                          fontWeight: isVoted ? 700 : 400, transition: "all 0.3s",
                        }}
                      >
                        {isVoted ? "✦ تم التصويت" : "▲ تصويت"}
                      </button>
                    </div>
                    <div style={{ margin: "0 20px 14px", height: 1.5, background: "rgba(255,255,255,0.05)" }}>
                      <div style={{
                        height: "100%", width: `${barWidth}%`,
                        background: idx === 0 ? `linear-gradient(to right,${G},${GL})` : idx === 1 ? "linear-gradient(to right,#C0C0C0,#E8E8E8)" : idx === 2 ? "linear-gradient(to right,#CD7F32,#E8A060)" : "rgba(212,175,55,0.35)",
                        transition: "width 1.5s ease",
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Steps */}
        <div style={{ paddingTop: 60, borderTop: "1px solid rgba(212,175,55,0.08)" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontSize: "0.68rem", letterSpacing: "0.35em", color: G, marginBottom: 10 }}>HOW IT WORKS</div>
            <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2rem", color: "#fff", fontWeight: 300 }}>
              طريقك نحو <em style={{ color: G, fontStyle: "italic" }}>الأسطورة</em>
            </h3>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 2 }}>
            {[
              { n: "01", icon: "📸", title: "ارفع قصتك",    desc: "شارك تجربتك في مصر بصور وفيديو مع وصف مميز." },
              { n: "02", icon: "⭐", title: "اجمع الأصوات", desc: "كلما زاد التفاعل مع محتواك، زادت أصواتك في الترتيب." },
              { n: "03", icon: "🌍", title: "اشتهر عالمياً", desc: "الفائز يُعرض على الصفحة الرئيسية في 98 دولة." },
              { n: "04", icon: "✈️", title: "احصل على جائزتك", desc: "رحلة مجانية 5 نجوم إلى أيقونة مصرية مختارة لك." },
            ].map(s => (
              <div key={s.n} style={{ background: "#161616", padding: "44px 28px", textAlign: "center" }}>
                <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "4rem", fontWeight: 300, color: "rgba(212,175,55,0.08)", display: "block", lineHeight: 1, marginBottom: 14 }}>{s.n}</span>
                <span style={{ fontSize: "1.8rem", display: "block", marginBottom: 12 }}>{s.icon}</span>
                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff", marginBottom: 8 }}>{s.title}</div>
                <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.8, fontWeight: 300 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
