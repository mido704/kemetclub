// src/hooks/useAI.js
import { useState } from "react";

export function useAI() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  async function generateCaption({ location, activity, mood = "مبهج" }) {
    setLoading(true); setError(null);
    try {
      const res  = await fetch("/api/ai/caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location, activity, mood }),
      });
      if (!res.ok) throw new Error("AI request failed");
      return await res.json();
    } catch (err) {
      setError(err.message);
      return _fallback(location, activity);
    } finally {
      setLoading(false);
    }
  }

  function suggestHashtags({ location = "", fileType = "image", title = "" }) {
    const base = ["#مصر", "#KemetClub", "#Egypt", "#EgyptTravel", "#سياحة_مصر", "#VisitEgypt", "#نادي_كيميت"];
    const map  = {
      "أهرامات": ["#الأهرامات", "#Pyramids", "#Giza"],
      "الأقصر":  ["#Luxor", "#الأقصر"],
      "أسوان":   ["#Aswan", "#أسوان", "#Nile"],
      "البحر الأحمر": ["#RedSea", "#البحر_الأحمر", "#Diving"],
      "سيوة":    ["#Siwa", "#سيوة"],
      "القاهرة": ["#Cairo", "#القاهرة"],
    };
    const extra = Object.entries(map).filter(([k]) => location.includes(k)).flatMap(([, v]) => v);
    if (fileType === "video") base.push("#EgyptReels", "#Reels");
    return [...new Set([...base, ...extra])].slice(0, 12);
  }

  function detectTrend({ likes = 0, shares = 0, comments = 0, createdAt }) {
    if (!createdAt) return false;
    const ageH = (Date.now() - (createdAt?.toDate?.() || new Date(createdAt))) / 3600000;
    return (likes + shares * 2 + comments * 1.5) / Math.max(ageH, 0.5) > 10;
  }

  return { generateCaption, suggestHashtags, detectTrend, loading, error };
}

function _fallback(location = "مصر", activity = "السياحة") {
  return {
    caption:  `لحظات لا تُنسى في ${location} — تجربة غيّرت نظرتي تماماً ✨🔥`,
    title:    `تجربتي في ${location}`,
    hashtags: ["#مصر", "#KemetClub", "#Egypt", "#EgyptTravel", "#سياحة_مصر", "#VisitEgypt"],
  };
}
