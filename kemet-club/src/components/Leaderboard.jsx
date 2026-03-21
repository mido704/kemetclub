// src/components/Leaderboard.jsx
import { useState, useEffect } from "react";
import { useRouter }            from "next/router";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { getDb } from "@/lib/firebase";

const G  = "#D4AF37";
const GL = "#F0D060";

const BADGE_LEVELS = [
  { min: 0,    label: "EXPLORER", icon: "🔺", color: G },
  { min: 500,  label: "PHARAOH",  icon: "👑", color: "#C0A020" },
  { min: 2000, label: "LEGEND",   icon: "⚡", color: GL },
];
const RANK_COLORS = [G, "#C0C0C0", "#CD7F32"];
const RANK_ICONS  = ["👑", "🥈", "🥉"];

function getBadge(pts = 0) {
  return [...BADGE_LEVELS].reverse().find(b => pts >= b.min) || BADGE_LEVELS[0];
}

export default function Leaderboard({ limit: maxUsers = 10 }) {
  const router  = useRouter();
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState("points");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const field = tab === "points" ? "points" : "stories";
        const q     = query(collection(getDb(), "users"), orderBy(field, "desc"), limit(maxUsers));
        const snap  = await getDocs(q);
        setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error("[Leaderboard]", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [tab, maxUsers]);

  const maxVal = users[0]?.[tab === "points" ? "points" : "stories"] || 1;

  return (
    <section style={{ padding: "100px 0", background: "#0A0A0A" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 40px" }}>

        <div style={{ textAlign: "center", marginBottom: 50 }}>
          <div style={{ fontSize: "0.68rem", letterSpacing: "0.35em", color: G, marginBottom: 12 }}>✦ HALL OF LEGENDS ✦</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(2rem,5vw,3.5rem)", fontWeight: 300, color: "#fff" }}>
            أبطال <em style={{ color: G, fontStyle: "italic" }}>Kemet</em>
          </h2>
          <div style={{ height: 1, background: `linear-gradient(to right,transparent,${G},transparent)`, opacity: 0.25, width: 120, margin: "22px auto" }} />
        </div>

        {/* Points explainer */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 2, marginBottom: 48 }}>
          {[["📸","رفع قصة","+50"],["❤️","إعجاب","+5"],["💬","تعليق","+10"],["🏆","فوز أسبوعي","+500"]].map(([icon,lbl,pts]) => (
            <div key={lbl} style={{ background: "#161616", padding: "20px 16px", textAlign: "center" }}>
              <div style={{ fontSize: "1.6rem", marginBottom: 8 }}>{icon}</div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.4rem", color: G, fontWeight: 700, lineHeight: 1 }}>{pts}</div>
              <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.5)", marginTop: 6, letterSpacing: "0.08em" }}>{lbl}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 24 }}>
          {[["points","🏆 النقاط"],["stories","📸 القصص"]].map(([key, lbl]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              padding: "13px 28px", background: "none", border: "none",
              color: tab === key ? G : "rgba(255,255,255,0.45)",
              fontSize: "0.8rem", letterSpacing: "0.1em", cursor: "pointer",
              borderBottom: `2px solid ${tab === key ? G : "transparent"}`,
              transition: "all 0.3s", fontFamily: "'Cairo',sans-serif",
            }}>{lbl}</button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{ height: 80, borderRadius: 12, background: "#161616" }} />
            ))}
          </div>
        ) : (
          <div>
            {users.map((u, idx) => {
              const badge    = getBadge(u.points);
              const val      = tab === "points" ? (u.points || 0) : (u.stories || 0);
              const barWidth = (val / maxVal) * 100;
              const isTop3   = idx < 3;

              return (
                <div
                  key={u.id}
                  onClick={() => router.push(`/profile/${u.id}`)}
                  style={{
                    cursor: "pointer",
                    background: isTop3 ? `linear-gradient(90deg,rgba(${idx===0?"212,175,55":idx===1?"192,192,192":"205,127,50"},0.10) 0%,transparent 80%)` : "transparent",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                  }}
                >
                  <div style={{ display: "grid", gridTemplateColumns: "52px 1fr auto", alignItems: "center", padding: "18px 16px", gap: 14 }}>
                    <div style={{ textAlign: "center" }}>
                      {isTop3
                        ? <span style={{ fontSize: "1.6rem" }}>{RANK_ICONS[idx]}</span>
                        : <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.4rem", fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>{String(idx+1).padStart(2,"0")}</span>
                      }
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: "50%",
                        background: `linear-gradient(135deg,${G},#a08020)`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "1rem", flexShrink: 0, overflow: "hidden",
                        border: isTop3 ? `2px solid ${RANK_COLORS[idx]}` : "1px solid rgba(212,175,55,0.2)",
                      }}>
                        {u.avatar ? <img src={u.avatar} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : "👤"}
                      </div>
                      <div>
                        <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#fff", marginBottom: 2 }}>{u.name || "مستخدم"}</div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                          {u.city && <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.5)" }}>📍 {u.city}</span>}
                          <span style={{ fontSize: "0.58rem", letterSpacing: "0.1em", padding: "2px 8px", background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.2)", color: badge.color }}>
                            {badge.icon} {badge.label}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: "left" }}>
                      <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.5rem", color: isTop3 ? RANK_COLORS[idx] : "#fff", fontWeight: 600, display: "block" }}>
                        {val.toLocaleString()}
                      </span>
                      <span style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em" }}>
                        {tab === "points" ? "POINTS" : "STORIES"}
                      </span>
                    </div>
                  </div>
                  <div style={{ margin: "0 16px 14px", height: 1.5, background: "rgba(255,255,255,0.05)" }}>
                    <div style={{
                      height: "100%", width: `${barWidth}%`,
                      background: isTop3 ? `linear-gradient(to right,${RANK_COLORS[idx]},${RANK_COLORS[idx]}aa)` : "rgba(212,175,55,0.35)",
                      transition: "width 1.5s ease",
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Badge levels */}
        <div style={{ marginTop: 56, padding: 36, background: "#161616", border: "1px solid rgba(212,175,55,0.1)", borderRadius: 16 }}>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.4rem", color: "#fff", marginBottom: 22, fontWeight: 300 }}>
            مستويات <em style={{ color: G, fontStyle: "italic" }}>الشارات</em>
          </div>
          <div style={{ display: "flex", gap: 2 }}>
            {BADGE_LEVELS.map(b => (
              <div key={b.label} style={{ flex: 1, padding: "20px 16px", background: "rgba(0,0,0,0.3)", textAlign: "center" }}>
                <div style={{ fontSize: "2rem", marginBottom: 8 }}>{b.icon}</div>
                <div style={{ fontSize: "0.72rem", fontWeight: 700, color: b.color, letterSpacing: "0.15em", marginBottom: 4 }}>{b.label}</div>
                <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.45)" }}>
                  {b.min === 0 ? "بداية الرحلة" : `${b.min.toLocaleString()}+ نقطة`}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
