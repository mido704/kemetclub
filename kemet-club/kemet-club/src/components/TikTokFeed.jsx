// src/components/TikTokFeed.jsx
import { useEffect, useRef, useState, useCallback, forwardRef } from "react";
import { useShare } from "@/hooks/useShare";
import { useAuth  } from "@/hooks/useAuth";

export default function TikTokFeed({ posts, onLike, onLoadMore, hasMore }) {
  const { user }      = useAuth();
  const { sharePost } = useShare();
  const [activeIdx, setActiveIdx] = useState(0);
  const slideRefs   = useRef([]);
  const observerRef = useRef(null);

  useEffect(() => {
    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const idx = parseInt(entry.target.dataset.idx);
          setActiveIdx(idx);
          slideRefs.current.forEach((s, i) => {
            const v = s?.querySelector("video");
            if (!v) return;
            if (i === idx) v.play().catch(() => {});
            else { v.pause(); v.currentTime = 0; }
          });
          if (idx >= posts.length - 3 && hasMore) onLoadMore?.();
        }
      });
    }, { threshold: 0.7 });
    slideRefs.current.forEach(s => s && observerRef.current.observe(s));
    return () => observerRef.current?.disconnect();
  }, [posts, hasMore, onLoadMore]);

  useEffect(() => {
    const onKey = e => {
      if (e.key === "ArrowDown") slideRefs.current[activeIdx + 1]?.scrollIntoView({ behavior: "smooth" });
      if (e.key === "ArrowUp")   slideRefs.current[activeIdx - 1]?.scrollIntoView({ behavior: "smooth" });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeIdx]);

  return (
    <div style={{ height:"100%", overflowY:"scroll", scrollSnapType:"y mandatory", overscrollBehaviorY:"contain" }}>
      {posts.map((post, idx) => (
        <Slide
          key={post.id}
          post={post}
          idx={idx}
          isActive={idx === activeIdx}
          ref={el => { slideRefs.current[idx] = el; }}
          onLike={() => onLike?.(post.id, user?.uid)}
          onShare={() => sharePost({ postId: post.id, title: post.title, desc: post.desc })}
          user={user}
        />
      ))}
    </div>
  );
}

const Slide = forwardRef(function Slide({ post, idx, isActive, onLike, onShare, user }, ref) {
  const liked   = user && (post.likedBy || []).includes(user.uid);
  const isVideo = post.fileType === "video";
  const G       = "#D4AF37";

  return (
    <div ref={ref} data-idx={idx} style={{
      height:"100%",scrollSnapAlign:"start",scrollSnapStop:"always",
      position:"relative",overflow:"hidden",background:"#000",flexShrink:0,
    }}>
      {isVideo ? (
        <video src={post.media} loop muted playsInline
          style={{width:"100%",height:"100%",objectFit:"cover",position:"absolute",inset:0}} />
      ) : (
        <img src={post.media} alt={post.title||""} loading="lazy"
          style={{width:"100%",height:"100%",objectFit:"cover",position:"absolute",inset:0}} />
      )}

      {/* Gradient */}
      <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,0.88) 0%,transparent 55%)",pointerEvents:"none"}} />
      <div style={{position:"absolute",top:0,left:0,right:0,height:120,background:"linear-gradient(to bottom,rgba(0,0,0,0.4),transparent)",pointerEvents:"none"}} />

      {/* Right actions */}
      <div style={{position:"absolute",right:14,bottom:100,display:"flex",flexDirection:"column",gap:20,alignItems:"center",zIndex:10}}>
        {[
          { icon: liked?"❤️":"🤍", count:post.likes||0, action:onLike,  active:liked, redActive:true },
          { icon:"💬", count:post.comments||0, action:null },
          { icon:"📤", count:post.shares||0, action:onShare },
        ].map((btn,i) => (
          <div key={i} style={{textAlign:"center"}}>
            <button onClick={btn.action||undefined} style={{
              width:52,height:52,borderRadius:"50%",
              background:btn.active&&btn.redActive?"rgba(180,30,30,0.35)":"rgba(0,0,0,0.5)",
              border:`1px solid ${btn.active&&btn.redActive?"rgba(255,80,80,0.5)":"rgba(212,175,55,0.3)"}`,
              color:btn.active&&btn.redActive?"#ff6b6b":"rgba(255,255,255,0.85)",
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:"1.35rem",cursor:btn.action?"pointer":"default",transition:"all 0.2s",
            }}>{btn.icon}</button>
            <div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.7)",marginTop:4}}>{btn.count}</div>
          </div>
        ))}
        <div style={{
          width:46,height:46,borderRadius:10,fontSize:"0.48rem",fontWeight:800,
          background:`linear-gradient(135deg,#F0D060,${G},#a08020)`,
          color:"#000",display:"flex",alignItems:"center",justifyContent:"center",
          textAlign:"center",lineHeight:1.25,letterSpacing:"0.05em",
          boxShadow:"0 0 16px rgba(212,175,55,0.4)",
        }}>KEMET<br/>CLUB</div>
      </div>

      {/* Bottom info */}
      <div style={{position:"absolute",bottom:80,left:14,right:80,zIndex:10}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
          <div style={{
            width:38,height:38,borderRadius:"50%",
            background:`linear-gradient(135deg,${G},#a08020)`,
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:"1rem",border:`2px solid ${G}`,flexShrink:0,overflow:"hidden",
          }}>
            {post.userAvatar ? <img src={post.userAvatar} style={{width:"100%",height:"100%",borderRadius:"50%"}} alt="" /> : "👤"}
          </div>
          <div>
            <div style={{fontSize:"0.88rem",fontWeight:700,color:"#fff"}}>{post.userName||"مستخدم"}</div>
            {post.location && <div style={{fontSize:"0.65rem",color:G}}>📍 {post.location}</div>}
          </div>
        </div>
        {post.title && (
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.15rem",color:"#fff",fontWeight:400,lineHeight:1.4,marginBottom:6,textShadow:"0 2px 8px rgba(0,0,0,0.8)"}}>
            {post.title}
          </div>
        )}
        {post.desc && (
          <div style={{fontSize:"0.82rem",color:"rgba(255,255,255,0.65)",lineHeight:1.6,fontWeight:300}}>
            {post.desc.slice(0,100)}{post.desc.length>100?"...":""}
          </div>
        )}
      </div>
    </div>
  );
});
