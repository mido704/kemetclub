// src/components/PostCard.jsx
import { useState, useRef, useCallback } from "react";
import { useShare } from "@/hooks/useShare";
import { useAuth  } from "@/hooks/useAuth";

function timeAgo(ts) {
  if (!ts) return "";
  const sec = Math.floor((Date.now() - (ts?.toDate?.() || new Date(ts))) / 1000);
  if (sec < 60)    return "الآن";
  if (sec < 3600)  return `${Math.floor(sec/60)} دقيقة`;
  if (sec < 86400) return `${Math.floor(sec/3600)} ساعة`;
  return `${Math.floor(sec/86400)} يوم`;
}

export default function PostCard({ post, onLike, onSave, onComment }) {
  const { user }       = useAuth();
  const { sharePost }  = useShare();
  const [showCmt, setShowCmt] = useState(false);
  const [cmtTxt,  setCmtTxt]  = useState("");
  const [toast,   setToast]   = useState(null);
  const videoRef = useRef(null);

  const liked   = user && (post.likedBy || []).includes(user.uid);
  const isVideo = post.fileType === "video";

  function notify(msg) { setToast(msg); setTimeout(() => setToast(null), 3000); }

  const handleLike = useCallback(async () => {
    if (!user) { notify("سجّل دخولك للتفاعل"); return; }
    await onLike?.(post.id, user.uid);
  }, [user, post.id, onLike]);

  const handleShare = useCallback(async () => {
    const r = await sharePost({ postId: post.id, title: post.title, desc: post.desc });
    if (r?.success) notify(r.method === "native" ? "تم المشاركة ✦" : "تم نسخ الرابط 📋");
  }, [post, sharePost]);

  const handleComment = useCallback(async e => {
    e.preventDefault();
    if (!user || !cmtTxt.trim()) return;
    await onComment?.(post.id, { userId: user.uid, name: user.displayName || "مستخدم", avatar: user.photoURL || "", text: cmtTxt.trim() });
    setCmtTxt(""); notify("✦ تم إضافة تعليقك");
  }, [user, cmtTxt, post.id, onComment]);

  const G = "#D4AF37";

  return (
    <article style={{
      position:"relative",overflow:"hidden",background:"#000",
      border:`1px solid ${G}`,borderRadius:20,
      boxShadow:"0 0 20px rgba(212,175,55,0.3)",aspectRatio:"4/5",
      transition:"transform 0.3s,box-shadow 0.3s",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.boxShadow="0 0 40px rgba(212,175,55,0.55)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow="0 0 20px rgba(212,175,55,0.3)"; }}
    >
      {isVideo ? (
        <video ref={videoRef} src={post.media} loop muted playsInline
          onMouseEnter={() => videoRef.current?.play().catch(()=>{})}
          onMouseLeave={() => { if(videoRef.current){videoRef.current.pause();videoRef.current.currentTime=0;} }}
          style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:20,display:"block"}}
        />
      ) : (
        <img src={post.media} alt={post.title||""} loading="lazy"
          style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:20,display:"block"}} />
      )}

      {/* badges */}
      <div style={{position:"absolute",top:12,right:12,background:"rgba(0,0,0,0.65)",backdropFilter:"blur(6px)",border:`1px solid rgba(212,175,55,0.3)`,color:G,fontSize:"0.6rem",letterSpacing:"0.15em",padding:"4px 10px"}}>
        {isVideo ? "🎬 فيديو" : "📸 صورة"}
      </div>
      <div style={{position:"absolute",top:12,left:12,background:"rgba(0,0,0,0.65)",color:"rgba(255,255,255,0.5)",fontSize:"0.6rem",padding:"4px 10px"}}>
        {timeAgo(post.createdAt)}
      </div>

      {/* gradient */}
      <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,0.92) 0%,rgba(0,0,0,0.1) 55%,transparent 100%)",borderRadius:20,pointerEvents:"none"}} />

      {/* content */}
      <div style={{position:"absolute",bottom:0,left:0,right:0,padding:20}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
          <div style={{width:34,height:34,borderRadius:"50%",background:`linear-gradient(135deg,${G},#a08020)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1rem",flexShrink:0,border:`1px solid rgba(212,175,55,0.4)`,overflow:"hidden"}}>
            {post.userAvatar ? <img src={post.userAvatar} alt="" style={{width:"100%",height:"100%",borderRadius:"50%",objectFit:"cover"}} /> : "👤"}
          </div>
          <div>
            <div style={{fontSize:"0.8rem",fontWeight:700,color:"#fff"}}>{post.userName||"مستخدم"}</div>
            {post.location && <div style={{fontSize:"0.62rem",color:G,letterSpacing:"0.12em"}}>📍 {post.location}</div>}
          </div>
        </div>

        {post.title && <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.05rem",color:"#fff",fontWeight:400,lineHeight:1.35,marginBottom:8}}>{post.title}</div>}

        <div style={{display:"flex",gap:10,alignItems:"center",marginTop:12,flexWrap:"wrap"}}>
          <button onClick={handleLike} style={{
            background: liked ? "rgba(200,30,30,0.35)" : "rgba(0,0,0,0.5)",
            border:`1px solid ${liked ? "rgba(255,80,80,0.5)" : "rgba(212,175,55,0.25)"}`,
            color: liked ? "#ff6b6b" : "rgba(255,255,255,0.7)",
            backdropFilter:"blur(8px)",borderRadius:8,padding:"7px 14px",
            cursor:"pointer",fontSize:"0.78rem",display:"flex",alignItems:"center",gap:6,transition:"all 0.25s",
          }}>
            {liked ? "❤️" : "🤍"} {post.likes||0}
          </button>

          <button onClick={() => setShowCmt(!showCmt)} style={{
            background:"rgba(0,0,0,0.5)",border:"1px solid rgba(212,175,55,0.25)",color:"rgba(255,255,255,0.7)",
            backdropFilter:"blur(8px)",borderRadius:8,padding:"7px 14px",cursor:"pointer",fontSize:"0.78rem",
            display:"flex",alignItems:"center",gap:6,
          }}>
            💬 {post.comments||0}
          </button>

          <button onClick={handleShare} style={{
            background:"rgba(0,0,0,0.5)",border:"1px solid rgba(212,175,55,0.25)",color:"rgba(255,255,255,0.7)",
            backdropFilter:"blur(8px)",borderRadius:8,padding:"7px 14px",cursor:"pointer",fontSize:"0.78rem",
            display:"flex",alignItems:"center",gap:6,
          }}>
            📤 مشاركة
          </button>
        </div>

        {showCmt && (
          <div style={{marginTop:12,background:"rgba(0,0,0,0.7)",backdropFilter:"blur(10px)",borderRadius:12,padding:14,border:"1px solid rgba(212,175,55,0.15)"}}>
            <form onSubmit={handleComment} style={{display:"flex",gap:8}}>
              <input
                value={cmtTxt} onChange={e => setCmtTxt(e.target.value)}
                placeholder="أضف تعليقاً..."
                style={{flex:1,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"9px 14px",color:"#fff",fontFamily:"'Cairo',sans-serif",fontSize:"0.8rem",outline:"none"}}
              />
              <button type="submit" style={{
                background:`linear-gradient(135deg,${G},#a08020)`,border:"none",borderRadius:8,
                padding:"9px 16px",color:"#000",fontWeight:700,cursor:"pointer",fontSize:"0.78rem",
              }}>إرسال</button>
            </form>
          </div>
        )}
      </div>

      {toast && (
        <div style={{
          position:"fixed",bottom:32,left:"50%",transform:"translateX(-50%)",
          background:"#0a1400",border:`1px solid rgba(212,175,55,0.4)`,
          color:G,padding:"11px 24px",fontSize:"0.78rem",letterSpacing:"0.08em",
          borderRadius:8,zIndex:9000,pointerEvents:"none",
        }}>{toast}</div>
      )}
    </article>
  );
}
