// src/components/UploadModal.jsx
import { useState, useRef, useCallback } from "react";
import { useUpload } from "@/hooks/useUpload";
import { useAuth   } from "@/hooks/useAuth";

export default function UploadModal({ isOpen, onClose, onSuccess }) {
  const { user, profile }                    = useAuth();
  const { uploadPost, progress, uploading, error } = useUpload();
  const [file,    setFile]    = useState(null);
  const [preview, setPreview] = useState(null);
  const [title,   setTitle]   = useState("");
  const [desc,    setDesc]    = useState("");
  const [loc,     setLoc]     = useState("");
  const [drag,    setDrag]    = useState(false);
  const [msg,     setMsg]     = useState(null);
  const fileRef = useRef(null);

  if (!isOpen) return null;

  function handleFile(f) {
    if (!f) return;
    if (f.size > 50 * 1024 * 1024) { setMsg({ text:"⚠ حجم الملف أكبر من 50MB", type:"error" }); return; }
    setFile(f);
    setPreview({ url: URL.createObjectURL(f), type: f.type.startsWith("video") ? "video" : "image" });
    setMsg(null);
  }

  const onDrop = useCallback(e => {
    e.preventDefault(); setDrag(false);
    handleFile(e.dataTransfer.files[0]);
  }, []);

  function clearFile() {
    setFile(null); setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file)  { setMsg({ text:"⚠ اختار صورة أو فيديو", type:"error" }); return; }
    if (!title) { setMsg({ text:"⚠ اكتب عنوان للقصة", type:"error" }); return; }
    await uploadPost({
      file, title, desc, location: loc,
      userId: user.uid,
      userName:   profile?.name  || user.displayName || "مستخدم",
      userAvatar: profile?.avatar || user.photoURL   || "",
      onSuccess: data => {
        setMsg({ text:"✦ تم رفع القصة بنجاح! 🔥", type:"success" });
        setTimeout(() => { onSuccess?.(data); handleClose(); }, 2000);
      },
    });
  }

  function handleClose() {
    if (uploading) return;
    setFile(null); setPreview(null); setTitle(""); setDesc(""); setLoc(""); setMsg(null);
    onClose?.();
  }

  const G = "var(--gold, #D4AF37)";

  return (
    <div onClick={e => e.target === e.currentTarget && handleClose()} style={{
      position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",backdropFilter:"blur(14px)",
      zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:20,
    }}>
      <div style={{
        background:"#161616",border:"1px solid rgba(212,175,55,0.3)",borderRadius:20,
        padding:48,width:"100%",maxWidth:520,maxHeight:"90vh",overflowY:"auto",position:"relative",
      }}>
        <button onClick={handleClose} style={{
          position:"absolute",top:16,right:16,background:"none",border:"none",
          color:"rgba(255,255,255,0.4)",fontSize:"1.2rem",cursor:"pointer",
        }}>✕</button>

        <div style={{fontSize:"0.65rem",letterSpacing:"0.35em",color:G,textAlign:"center",marginBottom:10}}>✦ شارك تجربتك ✦</div>
        <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"2rem",fontWeight:300,color:"#fff",textAlign:"center",marginBottom:6}}>
          ارفع <em style={{color:G,fontStyle:"italic"}}>قصتك</em>
        </h2>
        <div style={{height:1,background:`linear-gradient(to right,${G},transparent)`,margin:"20px 0 26px"}} />

        <form onSubmit={handleSubmit}>
          {!preview ? (
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={onDrop}
              style={{
                border:`1px dashed ${drag ? G : "rgba(212,175,55,0.4)"}`,
                background:drag ? "rgba(212,175,55,0.07)" : "rgba(212,175,55,0.03)",
                borderRadius:16,padding:"40px 20px",textAlign:"center",cursor:"pointer",marginBottom:16,transition:"all 0.3s",
              }}
            >
              <div style={{fontSize:"2.5rem",marginBottom:10}}>📸</div>
              <div style={{color:"rgba(255,255,255,0.5)",fontSize:"0.82rem",lineHeight:1.7}}>
                اسحب ملفك هنا أو انقر للاختيار<br/>
                <span style={{fontSize:"0.7rem",color:"rgba(212,175,55,0.6)"}}>JPG · PNG · MP4 · MOV — حتى 50MB</span>
              </div>
              <input ref={fileRef} type="file" accept="image/*,video/*" style={{display:"none"}} onChange={e => handleFile(e.target.files[0])} />
            </div>
          ) : (
            <div style={{position:"relative",marginBottom:16}}>
              {preview.type === "video"
                ? <video src={preview.url} controls muted style={{width:"100%",maxHeight:220,objectFit:"cover",borderRadius:16}} />
                : <img src={preview.url} alt="preview" style={{width:"100%",maxHeight:220,objectFit:"cover",borderRadius:16}} />
              }
              <button type="button" onClick={clearFile} style={{
                position:"absolute",top:8,left:8,background:"rgba(0,0,0,0.75)",
                border:"1px solid rgba(212,175,55,0.4)",color:G,padding:"4px 12px",borderRadius:6,fontSize:"0.7rem",cursor:"pointer",
              }}>✕ إزالة</button>
            </div>
          )}

          {uploading && (
            <div style={{marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <span style={{fontSize:"0.72rem",color:"rgba(255,255,255,0.5)"}}>جاري الرفع...</span>
                <span style={{fontSize:"0.72rem",color:G}}>{progress}%</span>
              </div>
              <div style={{height:2,background:"rgba(255,255,255,0.07)",borderRadius:1}}>
                <div style={{height:"100%",width:`${progress}%`,background:`linear-gradient(to right,${G},#F0D060)`,transition:"width 0.3s",borderRadius:1}} />
              </div>
            </div>
          )}

          <input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="عنوان القصة *" required />
          <textarea className="input" value={desc} onChange={e => setDesc(e.target.value)} placeholder="اكتب قصتك هنا..." />
          <input className="input" value={loc} onChange={e => setLoc(e.target.value)} placeholder="📍 الموقع (مثال: الأهرامات، الجيزة)" />

          {(msg || error) && (
            <div style={{
              fontSize:"0.78rem",textAlign:"center",marginBottom:10,
              color: msg?.type === "success" ? "#4caf87" : "#ff6b6b",
            }}>{msg?.text || error}</div>
          )}

          <button type="submit" className="btn btn-gold" disabled={uploading} style={{
            width:"100%",padding:16,fontSize:"0.88rem",borderRadius:10,marginTop:4,
            opacity:uploading?0.7:1,cursor:uploading?"not-allowed":"pointer",
          }}>
            {uploading ? `جاري الرفع... ${progress}%` : "📤 رفع القصة"}
          </button>
          <p style={{fontSize:"0.68rem",color:"rgba(255,255,255,0.3)",textAlign:"center",marginTop:12}}>
            ملفك يُحفظ بأمان على Firebase Storage · +50 نقطة
          </p>
        </form>
      </div>
    </div>
  );
}
