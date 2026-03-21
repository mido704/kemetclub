// src/pages/firebase-check.jsx
// صفحة مؤقتة للتحقق من الإعدادات — احذفها بعد التأكد
// الرابط: yoursite.netlify.app/firebase-check

export default function FirebaseCheck({ config }) {
  const G = "#D4AF37";
  const checks = [
    { key: "NEXT_PUBLIC_FIREBASE_API_KEY",            label: "API Key",           val: config.apiKey },
    { key: "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",        label: "Auth Domain",       val: config.authDomain },
    { key: "NEXT_PUBLIC_FIREBASE_PROJECT_ID",         label: "Project ID",        val: config.projectId },
    { key: "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",     label: "Storage Bucket",    val: config.storageBucket },
    { key: "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",label: "Sender ID",         val: config.messagingSenderId },
    { key: "NEXT_PUBLIC_FIREBASE_APP_ID",             label: "App ID",            val: config.appId },
  ];
  const allOk = checks.every(c => c.val && c.val !== "undefined" && c.val !== "");

  return (
    <div style={{ minHeight:"100vh", background:"#000", padding:"60px 24px", fontFamily:"'Cairo',sans-serif" }}>
      <div style={{ maxWidth:640, margin:"0 auto" }}>
        <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"2.5rem", color: G, fontWeight:300, marginBottom:8 }}>
          Firebase Config Check
        </h1>
        <p style={{ color:"rgba(255,255,255,0.4)", fontSize:"0.82rem", marginBottom:40 }}>
          هذه الصفحة مؤقتة للتحقق من الإعدادات — احذفها بعد التأكد
        </p>

        <div style={{ display:"flex", flexDirection:"column", gap:2, marginBottom:32 }}>
          {checks.map(c => {
            const ok = c.val && c.val !== "undefined" && c.val !== "";
            return (
              <div key={c.key} style={{
                display:"flex", alignItems:"center", justifyContent:"space-between",
                padding:"14px 20px",
                background: ok ? "rgba(76,175,87,0.08)" : "rgba(255,107,107,0.08)",
                border: `1px solid ${ok ? "rgba(76,175,87,0.3)" : "rgba(255,107,107,0.3)"}`,
                borderRadius:8,
              }}>
                <div>
                  <div style={{ fontSize:"0.8rem", fontWeight:700, color: ok ? "#4caf87" : "#ff6b6b" }}>
                    {ok ? "✅" : "❌"} {c.label}
                  </div>
                  <div style={{ fontSize:"0.65rem", color:"rgba(255,255,255,0.3)", marginTop:2 }}>{c.key}</div>
                </div>
                <div style={{ fontSize:"0.72rem", color: ok ? "rgba(255,255,255,0.5)" : "#ff6b6b", textAlign:"right", maxWidth:200, wordBreak:"break-all" }}>
                  {ok
                    ? c.val.slice(0,8) + "•••" + c.val.slice(-4)
                    : "⚠ غير موجود"}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{
          padding:"24px", borderRadius:12, textAlign:"center",
          background: allOk ? "rgba(76,175,87,0.1)" : "rgba(255,107,107,0.1)",
          border: `1px solid ${allOk ? "rgba(76,175,87,0.4)" : "rgba(255,107,107,0.4)"}`,
          marginBottom:32,
        }}>
          <div style={{ fontSize:"2rem", marginBottom:8 }}>{allOk ? "✅" : "❌"}</div>
          <div style={{ fontSize:"1rem", fontWeight:700, color: allOk ? "#4caf87" : "#ff6b6b" }}>
            {allOk ? "كل الإعدادات صح — Firebase جاهز" : "بعض الإعدادات ناقصة"}
          </div>
          {!allOk && (
            <p style={{ color:"rgba(255,255,255,0.5)", fontSize:"0.82rem", marginTop:12, lineHeight:1.8 }}>
              روح Netlify → Site Settings → Environment variables<br/>
              وأضف المتغيرات الناقصة (المحددة بـ ❌ أعلاه)
            </p>
          )}
        </div>

        {!allOk && (
          <div style={{ background:"#111", border:`1px solid rgba(212,175,55,0.2)`, borderRadius:12, padding:"24px" }}>
            <div style={{ color: G, fontSize:"0.78rem", fontWeight:700, marginBottom:16, letterSpacing:"0.1em" }}>
              خطوات الحل:
            </div>
            <ol style={{ color:"rgba(255,255,255,0.6)", fontSize:"0.82rem", lineHeight:2, paddingRight:20 }}>
              <li>افتح <strong style={{color:G}}>Firebase Console</strong> → اختار مشروعك</li>
              <li>اضغط ⚙️ → <strong style={{color:G}}>Project Settings</strong></li>
              <li>نزل لـ <strong style={{color:G}}>Your apps</strong> → اختار Web App</li>
              <li>انسخ قيم <strong style={{color:G}}>firebaseConfig</strong></li>
              <li>في Netlify: <strong style={{color:G}}>Site Settings → Environment Variables</strong></li>
              <li>أضف كل متغير بالاسم الصح أعلاه</li>
              <li>اضغط <strong style={{color:G}}>Trigger deploy</strong> → <strong style={{color:G}}>Deploy site</strong></li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}

// يقرأ الـ env vars من السيرفر وقت البناء
export function getServerSideProps() {
  return {
    props: {
      config: {
        apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY            || "",
        authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN         || "",
        projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID          || "",
        storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET      || "",
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
        appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID               || "",
      },
    },
  };
}
