import { useState } from "react";
import { useAuth }  from "@/hooks/useAuth";

const ERRORS = {
  "auth/email-already-in-use":   "⚠ الإيميل مسجّل قبل كده",
  "auth/invalid-email":          "⚠ إيميل غير صحيح",
  "auth/weak-password":          "⚠ الباسورد 6 حروف على الأقل",
  "auth/user-not-found":         "⚠ مفيش حساب بالإيميل ده",
  "auth/wrong-password":         "⚠ الباسورد غلط",
  "auth/invalid-credential":     "⚠ الإيميل أو الباسورد غلط",
  "auth/network-request-failed": "⚠ مشكلة في الاتصال",
  "auth/too-many-requests":      "⚠ محاولات كتير، استنى شوية",
};

const G = "#D4AF37";

export default function AuthModal({ isOpen, onClose, defaultMode = "signup" }) {
  const { signup, login } = useAuth();
  const [mode,    setMode]    = useState(defaultMode);
  const [loading, setLoading] = useState(false);
  const [err,     setErr]     = useState("");
  const [done,    setDone]    = useState(false);
  const [f, setF] = useState({ name: "", email: "", password: "", city: "" });
  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }));

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      let u;
      if (mode === "login") {
        u = await login(f);
      } else {
        if (!f.name)               { setErr("⚠ أدخل اسمك"); setLoading(false); return; }
        if (f.password.length < 6) { setErr("⚠ الباسورد 6 حروف على الأقل"); setLoading(false); return; }
        u = await signup(f);
      }
      setDone(true);
      setTimeout(function() {
        window.location.href = "/profile/" + u.uid;
      }, 1000);
    } catch (e2) {
      console.error("[Auth Error]", e2.code, e2.message);
      setErr(ERRORS[e2.code] || "⚠ " + e2.message);
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.97)", zIndex:3000, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:16 }}>
        <div style={{ fontSize:"3rem" }}>✦</div>
        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"2rem", fontWeight:300, color:G }}>
          {mode === "login" ? "أهلاً بعودتك!" : "أهلاً بك في Kemet Club!"}
        </div>
        <div style={{ color:"rgba(255,255,255,0.5)", fontSize:"0.85rem" }}>جاري الانتقال...</div>
      </div>
    );
  }

  return (
    <div onClick={e => e.target === e.currentTarget && onClose?.()} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.92)", backdropFilter:"blur(14px)", zIndex:3000, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:"#161616", border:"1px solid rgba(212,175,55,0.3)", borderRadius:20, padding:52, width:"100%", maxWidth:460, position:"relative" }}>
        <button onClick={onClose} style={{ position:"absolute", top:16, right:16, background:"none", border:"none", color:"rgba(255,255,255,0.4)", fontSize:"1.1rem", cursor:"pointer" }}>✕</button>
        <div style={{ fontSize:"0.65rem", letterSpacing:"0.35em", color:G, textAlign:"center", marginBottom:10 }}>{mode === "signup" ? "✦ انضم للمجتمع ✦" : "✦ أهلاً بعودتك ✦"}</div>
        <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"2rem", fontWeight:300, color:"#fff", textAlign:"center", marginBottom:20 }}>
          {mode === "signup" ? <><span>ابدأ </span><em style={{color:G,fontStyle:"italic"}}>قصتك</em></> : <><span>تسجيل </span><em style={{color:G,fontStyle:"italic"}}>الدخول</em></>}
        </h2>
        <div style={{ height:1, background:"linear-gradient(to right,"+G+",transparent)", marginBottom:24 }} />
        <form onSubmit={handleSubmit}>
          {mode === "signup" && <input className="input" type="text" value={f.name} onChange={set("name")} placeholder="الاسم الكامل" />}
          <input className="input" type="email"    value={f.email}    onChange={set("email")}    placeholder="البريد الإلكتروني" required />
          <input className="input" type="password" value={f.password} onChange={set("password")} placeholder="كلمة المرور (6+ حروف)" required />
          {mode === "signup" && <input className="input" type="text" value={f.city} onChange={set("city")} placeholder="مدينتك في مصر" />}
          {err && <div style={{ color:"#ff6b6b", fontSize:"0.82rem", textAlign:"center", marginBottom:12, padding:"8px 12px", background:"rgba(255,107,107,0.08)", borderRadius:8 }}>{err}</div>}
          <button type="submit" disabled={loading} style={{ width:"100%", padding:16, fontSize:"0.9rem", borderRadius:10, background:"linear-gradient(135deg,"+G+",#a08020)", border:"none", color:"#000", fontWeight:700, fontFamily:"'Cairo',sans-serif", opacity:loading?0.7:1, cursor:loading?"not-allowed":"pointer" }}>
            {loading ? "جاري..." : mode === "signup" ? "إنشاء حساب" : "تسجيل الدخول"}
          </button>
        </form>
        <div style={{ textAlign:"center", marginTop:20, fontSize:"0.82rem", color:"rgba(255,255,255,0.45)" }}>
          {mode === "signup" ? "عندك حساب؟ " : "مالكش حساب؟ "}
          <button onClick={() => { setMode(mode==="signup"?"login":"signup"); setErr(""); }} style={{ background:"none", border:"none", color:G, cursor:"pointer", fontSize:"0.82rem", fontWeight:700, textDecoration:"underline" }}>
            {mode === "signup" ? "سجّل دخولك" : "أنشئ حساب"}
          </button>
        </div>
        <p style={{ textAlign:"center", fontSize:"0.68rem", color:"rgba(255,255,255,0.25)", marginTop:12 }}>الطبقة المجانية متاحة للأبد</p>
      </div>
    </div>
  );
}// src/components/AuthModal.jsx
import { useState } from "react";
import { useAuth }  from "@/hooks/useAuth";

const ERRORS = {
  "auth/email-already-in-use":   "⚠ الإيميل مسجّل قبل كده",
  "auth/invalid-email":          "⚠ إيميل غير صحيح",
  "auth/weak-password":          "⚠ الباسورد 6 حروف على الأقل",
  "auth/user-not-found":         "⚠ مفيش حساب بالإيميل ده",
  "auth/wrong-password":         "⚠ الباسورد غلط",
  "auth/invalid-credential":     "⚠ الإيميل أو الباسورد غلط",
  "auth/network-request-failed": "⚠ مشكلة في الاتصال",
  "auth/too-many-requests":      "⚠ محاولات كتير، استنى شوية",
};

const G = "#D4AF37";

export default function AuthModal({ isOpen, onClose, defaultMode = "signup" }) {
  const { signup, login } = useAuth();
  const [mode,    setMode]    = useState(defaultMode);
  const [loading, setLoading] = useState(false);
  const [err,     setErr]     = useState("");
  const [done,    setDone]    = useState(false);
  const [f, setF] = useState({ name: "", email: "", password: "", city: "" });
  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }));

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      let u;
      if (mode === "login") {
        u = await login(f);
      } else {
        if (!f.name)               { setErr("⚠ أدخل اسمك"); setLoading(false); return; }
        if (f.password.length < 6) { setErr("⚠ الباسورد 6 حروف على الأقل"); setLoading(false); return; }
        u = await signup(f);
      }
      setDone(true);
      setTimeout(function() {
        window.location.href = "/profile/" + u.uid;
      }, 1000);
    } catch (e2) {
      console.error("[Auth Error]", e2.code, e2.message);
      setErr(ERRORS[e2.code] || "⚠ " + e2.message);
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.97)", zIndex:3000, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:16 }}>
        <div style={{ fontSize:"3rem" }}>✦</div>
        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"2rem", fontWeight:300, color:G }}>
          {mode === "login" ? "أهلاً بعودتك!" : "أهلاً بك في Kemet Club!"}
        </div>
        <div style={{ color:"rgba(255,255,255,0.5)", fontSize:"0.85rem" }}>جاري الانتقال...</div>
      </div>
    );
  }

  return (
    <div onClick={e => e.target === e.currentTarget && onClose?.()} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.92)", backdropFilter:"blur(14px)", zIndex:3000, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:"#161616", border:"1px solid rgba(212,175,55,0.3)", borderRadius:20, padding:52, width:"100%", maxWidth:460, position:"relative" }}>
        <button onClick={onClose} style={{ position:"absolute", top:16, right:16, background:"none", border:"none", color:"rgba(255,255,255,0.4)", fontSize:"1.1rem", cursor:"pointer" }}>✕</button>
        <div style={{ fontSize:"0.65rem", letterSpacing:"0.35em", color:G, textAlign:"center", marginBottom:10 }}>{mode === "signup" ? "✦ انضم للمجتمع ✦" : "✦ أهلاً بعودتك ✦"}</div>
        <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"2rem", fontWeight:300, color:"#fff", textAlign:"center", marginBottom:20 }}>
          {mode === "signup" ? <><span>ابدأ </span><em style={{color:G, fontStyle:"italic"}}>قصتك</em></> : <><span>تسجيل </span><em style={{color:G, fontStyle:"italic"}}>الدخول</em></>}
        </h2>
        <div style={{ height:1, background:"linear-gradient(to right,"+G+",transparent)", marginBottom:24 }} />
        <form onSubmit={handleSubmit}>
          {mode === "signup" && (<input className="input" type="text" value={f.name} onChange={set("name")} placeholder="الاسم الكامل" />)}
          <input className="input" type="email" value={f.email} onChange={set("email")} placeholder="البريد الإلكتروني" required />
          <input className="input" type="password" value={f.password} onChange={set("password")} placeholder="كلمة المرور (6+ حروف)" required />
          {mode === "signup" && (<input className="input" type="text" value={f.city} onChange={set("city")} placeholder="مدينتك في مصر" />)}
          {err && (<div style={{ color:"#ff6b6b", fontSize:"0.82rem", textAlign:"center", marginBottom:12, padding:"8px 12px", background:"rgba(255,107,107,0.08)", borderRadius:8 }}>{err}</div>)}
          <button type="submit" disabled={loading} style={{ width:"100%", padding:16, fontSize:"0.9rem", borderRadius:10, background:"linear-gradient(135deg,"+G+",#a08020)", border:"none", color:"#000", fontWeight:700, fontFamily:"'Cairo',sans-serif", opacity:loading?0.7:1, cursor:loading?"not-allowed":"pointer" }}>
            {loading ? "جاري..." : mode === "signup" ? "إنشاء حساب" : "تسجيل الدخول"}
          </button>
        </form>
        <div style={{ textAlign:"center", marginTop:20, fontSize:"0.82rem", color:"rgba(255,255,255,0.45)" }}>
          {mode === "signup" ? "عندك حساب؟ " : "مالكش حساب؟ "}
          <button onClick={() => { setMode(mode === "signup" ? "login" : "signup"); setErr(""); }} style={{ background:"none", border:"none", color:G, cursor:"pointer", fontSize:"0.82rem", fontWeight:700, textDecoration:"underline" }}>
            {mode === "signup" ? "سجّل دخولك" : "أنشئ حساب"}
          </button>
        </div>
        <p style={{ textAlign:"center", fontSize:"0.68rem", color:"rgba(255,255,255,0.25)", marginTop:12 }}>الطبقة المجانية متاحة للأبد</p>
      </div>
    </div>
  );
}
