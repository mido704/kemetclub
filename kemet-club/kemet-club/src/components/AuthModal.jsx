// src/components/AuthModal.jsx
import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";

const ERRORS = {
  "auth/email-already-in-use":   "⚠ الإيميل ده مسجل قبل كده",
  "auth/invalid-email":          "⚠ إيميل مش صحيح",
  "auth/weak-password":          "⚠ الباسورد لازم 6 حروف على الأقل",
  "auth/user-not-found":         "⚠ مفيش حساب بالإيميل ده",
  "auth/wrong-password":         "⚠ الباسورد غلط",
  "auth/network-request-failed": "⚠ مشكلة في الاتصال",
  "auth/too-many-requests":      "⚠ محاولات كتير، استنى شوية",
};

export default function AuthModal({ isOpen, onClose, onSuccess, defaultMode = "signup" }) {
  const { signup, login } = useAuth();
  const router = useRouter();
  const [mode,    setMode]    = useState(defaultMode);
  const [loading, setLoading] = useState(false);
  const [err,     setErr]     = useState("");
  const [f,       setF]       = useState({ name: "", email: "", password: "", city: "" });
  const set = k => e => setF(prev => ({ ...prev, [k]: e.target.value }));

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      if (mode === "login") {
        const u = await login(f);
        if (onSuccess) {
          onSuccess(u.uid);
        } else {
          await router.push(`/profile/${u.uid}`);
          onClose?.();
        }
      } else {
        if (!f.name)               { setErr("⚠ أدخل اسمك"); setLoading(false); return; }
        if (f.password.length < 6) { setErr("⚠ الباسورد لازم 6 حروف"); setLoading(false); return; }
        const u = await signup(f);
        if (onSuccess) {
          onSuccess(u.uid);
        } else {
          await router.push(`/profile/${u.uid}`);
          onClose?.();
        }
      }
    } catch (e2) {
      setErr(ERRORS[e2.code] || `⚠ ${e2.message}`);
    } finally {
      setLoading(false);
    }
  }

  const o = (k, v) => ({ style: { [k]: v } });

  return (
    <div onClick={e => e.target === e.currentTarget && onClose?.()} style={{
      position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",backdropFilter:"blur(14px)",
      zIndex:3000,display:"flex",alignItems:"center",justifyContent:"center",padding:20,
    }}>
      <div style={{
        background:"#161616",border:"1px solid rgba(212,175,55,0.3)",borderRadius:20,
        padding:52,width:"100%",maxWidth:460,position:"relative",
      }}>
        <button onClick={onClose} style={{
          position:"absolute",top:16,right:16,background:"none",border:"none",
          color:"rgba(255,255,255,0.4)",fontSize:"1.1rem",cursor:"pointer",
        }}>✕</button>

        <div style={{fontSize:"0.65rem",letterSpacing:"0.35em",color:"#D4AF37",textAlign:"center",marginBottom:10}}>
          {mode === "signup" ? "✦ انضم للمجتمع ✦" : "✦ أهلاً بعودتك ✦"}
        </div>
        <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"2rem",fontWeight:300,color:"#fff",textAlign:"center",marginBottom:20}}>
          {mode === "signup" ? <>ابدأ <em style={{color:"#D4AF37",fontStyle:"italic"}}>قصتك</em></> : <>تسجيل <em style={{color:"#D4AF37",fontStyle:"italic"}}>الدخول</em></>}
        </h2>
        <div style={{height:1,background:"linear-gradient(to right,#D4AF37,transparent)",marginBottom:24}} />

        <form onSubmit={handleSubmit}>
          {mode === "signup" && (
            <input className="input" type="text" value={f.name} onChange={set("name")} placeholder="الاسم الكامل" required />
          )}
          <input className="input" type="email" value={f.email} onChange={set("email")} placeholder="البريد الإلكتروني" required />
          <input className="input" type="password" value={f.password} onChange={set("password")} placeholder="كلمة المرور (6+ حروف)" required />
          {mode === "signup" && (
            <input className="input" type="text" value={f.city} onChange={set("city")} placeholder="مدينتك في مصر" />
          )}

          {err && <div style={{color:"#ff6b6b",fontSize:"0.78rem",textAlign:"center",marginBottom:12}}>{err}</div>}

          <button type="submit" className="btn btn-gold" disabled={loading} style={{
            width:"100%",padding:16,fontSize:"0.9rem",borderRadius:10,opacity:loading?0.7:1,cursor:loading?"not-allowed":"pointer",
          }}>
            {loading ? "جاري..." : mode === "signup" ? "إنشاء حساب" : "تسجيل الدخول"}
          </button>
        </form>

        <div style={{textAlign:"center",marginTop:20,fontSize:"0.8rem",color:"rgba(255,255,255,0.45)"}}>
          {mode === "signup" ? "عندك حساب؟ " : "مالكش حساب؟ "}
          <button onClick={() => { setMode(mode === "signup" ? "login" : "signup"); setErr(""); }}
            style={{background:"none",border:"none",color:"#D4AF37",cursor:"pointer",fontSize:"0.8rem",fontWeight:700,textDecoration:"underline"}}>
            {mode === "signup" ? "سجّل دخولك" : "أنشئ حساب"}
          </button>
        </div>
        <p style={{textAlign:"center",fontSize:"0.68rem",color:"rgba(255,255,255,0.25)",marginTop:12}}>
          الطبقة المجانية متاحة للأبد
        </p>
      </div>
    </div>
  );
}
