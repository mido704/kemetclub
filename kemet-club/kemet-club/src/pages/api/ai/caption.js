// src/pages/api/ai/caption.js
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { location = "مصر", activity = "السياحة", mood = "مبهج" } = req.body || {};

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method:  "POST",
      headers: {
        "Content-Type":      "application/json",
        "x-api-key":         process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model:      "claude-sonnet-4-6",
        max_tokens: 400,
        messages: [{
          role:    "user",
          content: `أنت مساعد إبداعي لمنصة Kemet Club.\nاكتب تعليقاً جذاباً لمنشور سياحي:\n- الموقع: ${location}\n- النشاط: ${activity}\n- المزاج: ${mood}\n\nأعد JSON فقط:\n{"caption":"نص جذاب مع إيموجي","title":"عنوان قصير","hashtags":["#مصر","#KemetClub"]}`,
        }],
      }),
    });

    if (!response.ok) throw new Error(`Claude API: ${response.status}`);
    const data  = await response.json();
    const text  = data.content?.[0]?.text || "{}";
    const clean = text.replace(/```json|```/g, "").trim();
    return res.status(200).json(JSON.parse(clean));
  } catch (err) {
    console.error("[AI Caption]", err.message);
    return res.status(200).json({
      caption:  `لحظات لا تُنسى في ${location} ✨🔥`,
      title:    `تجربتي في ${location}`,
      hashtags: ["#مصر", "#KemetClub", "#Egypt", "#EgyptTravel", "#سياحة_مصر", "#VisitEgypt"],
    });
  }
}
