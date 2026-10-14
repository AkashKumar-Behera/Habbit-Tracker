# Firebase setup — Ritualz

Project: **arise-699d5** (project number `240250068289`), Spark plan.

## Jo ho chuka hai

- ✅ Web app **"Ritualz Web"** bana diya (Management API se) — `1:240250068289:web:e31e2cff46cc5db59ed5c0`
- ✅ `.env.local` me config bhar diya
- ✅ Client SDK wiring: Auth (Google / Email / Anonymous), RTDB sync, FCM
- ✅ `database.rules.json` likh diya
- ✅ `npm run fb:sync` — config refresh + rules deploy karne wali script

## Jo aapko Console me karna hai

Yeh do cheezein API se nahi ho saktin (Spark plan pe Auth enable karne ka API route billing maangta hai, aur RTDB Management API tab tak band rehti hai jab tak pehla instance na bane).

### 1. Authentication on karo

Console → **Authentication** → *Get started* → Sign-in method tab → ye teen enable karo:

- **Google** — support email select kar dena
- **Email/Password**
- **Anonymous**

### 2. Realtime Database banao

Console → **Realtime Database** → *Create Database*

- Location: `asia-southeast1` (India ke liye sabse kam latency)
- Rules: **Locked mode** chuno — asli rules agla step deploy kar dega

### 3. Web Push key banao (FCM ke liye)

Console → **Project settings** → **Cloud Messaging** → *Web Push certificates* → **Generate key pair**.
Jo key mile use `.env.local` me daalo:

```
NEXT_PUBLIC_FIREBASE_VAPID_KEY=<key>
```

### 4. Sync chalao

```bash
npm run fb:sync -- "C:/path/to/service-account.json"
```

Yeh database URL `.env.local` me bhar dega aur `database.rules.json` deploy kar dega.
(Ya `.env.local` me `FIREBASE_SERVICE_ACCOUNT_PATH` set karke bina argument ke chalao.)

### 5. Chalao

```bash
npm run dev
```

---

## ⚠️ Service account key rotate karo

Jo key aapne bheji thi woh ab leaked maan lo — chat me aa chuki hai aur uploads folder me
plaintext padi hai. Console → **Project settings** → **Service accounts** → purani key
delete karke nayi generate karo. Nayi key repo ke bahar rakhna (jaise `C:\secrets\`),
aur `.env.local` me sirf uska *path* daalna. `.gitignore` me dono patterns pehle se hain.

---

## Data model (RTDB)

```
users/{uid}/
  profile/      { name, email, photoURL, updatedAt }
  habits/{habitId}/   { name, icon, createdAt, order }
  completions/{YYYY-MM-DD}/{habitId}: true
  fcmTokens/{token}/  { createdAt, ua }

leaderboard/{uid}/    { name, photoURL, activeStreak, bestStreak, updatedAt }
```

Completions ko din ke hisaab se key kiya hai, habit ke hisaab se nahi — heatmap aur
calendar dono date range padhte hain, isliye ek hi subtree read me kaam ho jaata hai.
Ek toggle = ek boolean write (~50 bytes), isliye RTDB ka bandwidth billing sasta padta hai.

Rules: har user sirf apna `users/{uid}` subtree padh/likh sakta hai. `leaderboard` sab
logged-in users padh sakte hain, par likh sirf apni hi row sakte hain. Completion write
tabhi valid hai jab us habit ka node sach me exist karta ho.

## Offline / logged-out behaviour

Firebase configure na ho, ya user logged out ho, to app `localStorage` pe chalta hai.
Pehli baar sign-in pe local habits RTDB me push ho jaati hain (sirf tab jab remote khaali ho).
Guest (anonymous) user Google/Email se link karega to uska uid wahi rehta hai — data saath aata hai.

---

## Reminders (push notifications)

Web pe **scheduled local notifications possible nahi hain** — Notification Triggers
API abandon ho chuki hai, aur service worker background me timer nahi chala sakta.
Isliye reminders server se Web Push ke through jaate hain.

### Kaise kaam karta hai

```
reminders/{uid}: { enabled, time: "20:00", tz: "Asia/Kolkata", lastSent: "2026-10-14" }
```

Client yeh node likhta hai (Settings → Daily reminder). Daemon har minute sirf
`reminders` node padhta hai — poore users nahi — aur jin ka local time aa gaya ho
unki aaj ki pending habits check karke FCM bhejta hai. `lastSent` se ek din me
ek hi notification jaata hai.

### Daemon chalao

Apne server pe:

```bash
cd daemon
npm install
FIREBASE_SERVICE_ACCOUNT=/etc/ritualz/service-account.json \
FIREBASE_DATABASE_URL=https://arise-699d5-default-rtdb.firebaseio.com \
node send-reminders.mjs
```

Pehle `DRY_RUN=1` ke saath chala kar dekh lo — bhejega nahi, sirf log karega.

systemd ke liye `daemon/ritualz-reminders.service` ready hai:

```bash
sudo cp daemon/ritualz-reminders.service /etc/systemd/system/
sudo systemctl daemon-reload && sudo systemctl enable --now ritualz-reminders
journalctl -u ritualz-reminders -f
```

Service account us server pe `chmod 600` ke saath rakhna, repo ke andar nahi.

### Zaroori

- **VAPID key chahiye** warna toggle "VAPID key set nahi hai" dega
- **iOS**: web push tabhi chalega jab PWA home screen pe install ho (iOS 16.4+)
- Daemon stale FCM tokens apne aap prune kar deta hai
