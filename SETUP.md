# GK Stats — Deployment Setup

## 1. Add ~/.npm-global/bin to your PATH (add to ~/.bashrc or ~/.zshrc)

```bash
export PATH=~/.npm-global/bin:$PATH
```

---

## 2. Create a GitHub repository

Go to https://github.com/new and create a repo called `goalkeeping-app`, then:

```bash
cd "Goalkeeping App"
git remote add origin https://github.com/YOUR_USERNAME/goalkeeping-app.git
git push -u origin main
```

---

## 3. Set up Firebase

### a. Create the Firebase project
1. Go to https://console.firebase.google.com
2. Click **Add project** → name it `gk-stats`
3. Enable **Authentication** → Sign-in method → **Email/Password** (and optionally **Anonymous**)
4. Enable **Firestore Database** → Create database → Start in **production mode** → choose a region

### b. Get your config values
- Project Settings (gear icon) → **Your apps** → **</>** (Web) → Register app
- Copy the `firebaseConfig` object values

### c. Create .env.local

```bash
cd "Goalkeeping App"
cp .env.example .env.local
# Then fill in the values from Firebase
```

### d. Deploy Firestore rules

```bash
firebase login
firebase use --add   # select your gk-stats project
firebase deploy --only firestore:rules
```

### e. (Optional) Deploy to Firebase Hosting

```bash
npm run build:web
firebase deploy --only hosting
```

---

## 4. Deploy to Vercel

```bash
vercel login
cd "Goalkeeping App"
vercel
```

Vercel will ask:
- **Set up and deploy?** → Y
- **Which scope?** → your account
- **Link to existing project?** → N (new project)
- **Project name?** → goalkeeping-app (or whatever you like)
- **Directory?** → ./

For production deploys after that:
```bash
npm run deploy
# or just: vercel --prod
```

### Add Firebase env vars to Vercel

In the Vercel dashboard → your project → **Settings → Environment Variables**, add all the
`EXPO_PUBLIC_FIREBASE_*` values from your `.env.local`.

---

## 5. Run locally

```bash
cd "Goalkeeping App"
npm install
npx expo start          # mobile (scan QR with Expo Go)
npx expo start --web    # browser preview
```

---

## How it works

| Scenario | Storage |
|----------|---------|
| Not logged in / guest | AsyncStorage (local only) |
| Logged in (Firebase) | Firestore (cloud, real-time sync across devices) + local cache |
| Offline | Falls back to AsyncStorage automatically |

## Future AI video integration

See `src/services/aiAnalysis.ts` — implement `analyzeVideo()` with your Veo API credentials
and the returned events map directly into the match stats system.
