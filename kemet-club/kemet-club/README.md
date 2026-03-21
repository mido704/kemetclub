# 👑 Kemet Club — نادي كيميت
### Premium Social Tourism Platform for Egypt

> Live Egypt. Share Your Story. Become Kemet.

---

## 🚀 Deploy to Netlify in 5 Minutes

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "initial: kemet club production"
git remote add origin https://github.com/YOUR_USERNAME/kemet-club.git
git push -u origin main
```

### Step 2 — Connect to Netlify
1. Go to [netlify.com](https://netlify.com) → New site from Git
2. Select your GitHub repo
3. Build settings are auto-read from `netlify.toml`

### Step 3 — Add Environment Variables
In Netlify: **Site Settings → Environment Variables → Add:**

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | From Firebase Console |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | e.g. `myapp.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | e.g. `myapp-12345` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | e.g. `myapp.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | From Firebase Console |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | From Firebase Console |
| `ANTHROPIC_API_KEY` | From [console.anthropic.com](https://console.anthropic.com) |

### Step 4 — Firebase Setup
1. **Authentication** → Sign-in method → Enable **Email/Password**
2. **Firestore** → Create database → Start in production mode
3. Deploy rules: `firebase deploy --only firestore:rules,storage`
4. **Required index** → Firestore → Indexes → Composite:
   - Collection: `posts` | Fields: `weekCode ASC, weeklyVotes DESC`

### Step 5 — Deploy!
Click **Deploy site** in Netlify. ✅

---

## 🗂️ Project Structure

```
kemet-club/
├── src/
│   ├── lib/
│   │   └── firebase.js          # Firebase init
│   ├── hooks/
│   │   ├── useAuth.js           # Auth context + signup/login/logout
│   │   ├── useFeed.js           # Feed + pagination + like + save + comment
│   │   ├── useUpload.js         # Media upload + progress + points
│   │   ├── useShare.js          # Web Share API + fallbacks
│   │   └── useAI.js             # AI captions + hashtags
│   ├── components/
│   │   ├── PostCard.jsx         # Feed card with all actions
│   │   ├── TikTokFeed.jsx       # Fullscreen vertical snap feed
│   │   ├── UploadModal.jsx      # Drag-drop upload + preview
│   │   ├── AuthModal.jsx        # Signup + Login
│   │   ├── FaceOfEgypt.jsx      # Weekly competition + leaderboard
│   │   └── Leaderboard.jsx      # Top travelers + gamification
│   ├── pages/
│   │   ├── _app.js              # AuthProvider wrapper
│   │   ├── _document.js         # HTML lang + fonts
│   │   ├── 404.jsx              # Custom 404 page
│   │   ├── index.jsx            # Landing page
│   │   ├── post/[id].jsx        # Post detail (SEO)
│   │   ├── profile/[uid].jsx    # User profile (SEO)
│   │   └── api/ai/caption.js   # AI caption endpoint
│   └── styles/
│       └── globals.css          # Design system: Black × Gold
├── jsconfig.json                # @ → src/ alias (FIXES NETLIFY)
├── next.config.js               # Webpack alias + image domains
├── netlify.toml                 # Netlify build config
├── firestore.rules              # Security rules
├── storage.rules                # Storage rules
├── .gitignore                   # Never commit .env.local!
└── .env.local.example           # Copy → .env.local and fill values
```

---

## 🔐 Fixes Applied (Netlify Deploy Errors)

| Error | Fix |
|-------|-----|
| `@/hooks/useAuth cannot be resolved` | Added `jsconfig.json` with `@/*: src/*` |
| `@/styles/globals.css cannot be resolved` | Added `next.config.js` webpack alias |
| `"use client" is not allowed` | Removed from all 6 components (Pages Router) |
| Duplicate `forwardRef` import | Merged into single React import |
| Missing build config | Added `netlify.toml` |
| Fonts loaded twice | Moved to `_document.js`, removed from `globals.css` |
| SSR errors on `window`/`navigator` | Wrapped with `typeof window !== "undefined"` |

---

## 💎 Design System

| Token | Value |
|-------|-------|
| `--gold` | `#D4AF37` |
| `--gold-light` | `#F0D060` |
| `--gold-dark` | `#A08020` |
| Font Display | Cormorant Garamond |
| Font Body | Cairo |

---

## 📊 Points System

| Action | Points |
|--------|--------|
| رفع قصة | +50 |
| إعجاب | +5 |
| تعليق | +10 |
| مشاركة | +15 |
| فوز أسبوعي | +500 |

---

Built with ❤️ for Egypt | Kemet Club © 2026
