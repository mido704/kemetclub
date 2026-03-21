// src/pages/404.jsx
import { useRouter } from "next/router";
const G = "#D4AF37";
export default function NotFound() {
  const router = useRouter();
  return (
    <div style={{ minHeight:"100vh",background:"#000",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:20,padding:24,textAlign:"center" }}>
      <div style={{fontSize:"4rem"}}>👁️</div>
      <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(2rem,8vw,5rem)",fontWeight:300,color:"#fff",lineHeight:1.1}}>
        هذه الصفحة<br/><em style={{color:G,fontStyle:"italic"}}>لا توجد</em>
      </h1>
      <p style={{color:"rgba(255,255,255,0.45)",fontSize:"0.9rem",maxWidth:400}}>
        ربما انتقلت إلى مكان آخر في أعماق التاريخ...
      </p>
      <button onClick={()=>router.push("/")} style={{background:`linear-gradient(135deg,${G},#a08020)`,border:"none",borderRadius:10,padding:"14px 36px",color:"#000",fontWeight:700,cursor:"pointer",fontFamily:"'Cairo',sans-serif",fontSize:"0.88rem",letterSpacing:"0.1em",marginTop:8}}>
        العودة للرئيسية
      </button>
    </div>
  );
}
