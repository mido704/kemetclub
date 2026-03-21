// src/pages/_app.js
import "@/styles/globals.css";
import { Component } from "react";
import dynamic from "next/dynamic";

// AuthProvider loaded client-side only — Firebase Auth is browser-only
const AuthProvider = dynamic(
  () => import("@/hooks/useAuth").then(mod => ({ default: mod.AuthProvider })),
  { ssr: false, loading: () => null }
);

// Error Boundary — shows useful message instead of blank page
class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false, message: "" }; }
  static getDerivedStateFromError(error) { return { hasError: true, message: error.message }; }
  componentDidCatch(error, info) { console.error("[Kemet Error]", error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight:"100vh",background:"#000",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:20,padding:24,fontFamily:"'Cairo',sans-serif",textAlign:"center" }}>
          <div style={{fontSize:"3rem"}}>⚠️</div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"2rem",color:"#D4AF37",fontWeight:300}}>
            حدث خطأ غير متوقع
          </div>
          <div style={{color:"rgba(255,255,255,0.5)",fontSize:"0.85rem",maxWidth:500,lineHeight:1.7}}>
            {this.state.message || "يرجى تحديث الصفحة أو المحاولة لاحقاً"}
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{background:"linear-gradient(135deg,#D4AF37,#A08020)",border:"none",borderRadius:10,padding:"12px 32px",color:"#000",fontWeight:700,cursor:"pointer",fontSize:"0.9rem",marginTop:8}}
          >
            تحديث الصفحة
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App({ Component, pageProps }) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </ErrorBoundary>
  );
}
