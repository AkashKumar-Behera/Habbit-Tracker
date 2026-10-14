# Ritualz — Habit Tracker

Minimal habit tracker. [web.ritualz.app](https://web.ritualz.app/) (Flutter) ka UI,
Next.js me rebuild kiya hua, Firebase backend ke saath.

## Stack

- **Next.js 15** (App Router) + React 19 + TypeScript
- **Tailwind CSS v4** — CSS variable tokens, light/dark dono
- **Firebase** — Auth (Google / Email / Anonymous), Realtime Database, Cloud Messaging

## Features

- GitHub-style **activity heatmap**, completion ke hisaab se shade hoti hai
- **Monthly progress** — pichhle mahine se delta + 18-month bar chart
- **Streaks** — active aur all-time
- Month **calendar**, kisi bhi din ki habits dekho/mark karo
- **Slide-to-confirm** rows — habit add karne aur complete karne dono me
  (click aur keyboard se bhi chalta hai)
- Har device pe **sync**, aur logged out / offline pe localStorage fallback
- **Dark mode**, flash ke bina

## Setup

```bash
npm install
cp .env.local.example .env.local   # phir values bharo
npm run dev
```

Firebase ka poora setup — kaunse console steps baaki hain, data model, security rules —
[`FIREBASE.md`](./FIREBASE.md) me hai.

```bash
npm run fb:sync -- "path/to/service-account.json"
```

Yeh live project se config padh kar `.env.local` update karta hai aur
`database.rules.json` deploy kar deta hai.

> Service account JSON kabhi repo me mat rakhna. Use kahin aur rakho
> (jaise `C:\secrets\`) aur `.env.local` me sirf uska path do.

## Scripts

| Command | Kaam |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run start` | Built app serve karo |
| `npm run fb:sync` | Firebase config pull + rules deploy |

## Project structure

```
src/
  app/          layout, page, global styles
  components/   UI — heatmap, calendar, cards, sheets, sidebar
  lib/
    firebase.ts   SDK init (auth aur database alag-alag gate hote hain)
    auth.tsx      AuthProvider — Google / Email / Anonymous + guest linking
    habits.tsx    habit store — RTDB sync, localStorage fallback
    push.ts       FCM token registration
    date.ts       date helpers (local-time keys, timezone-safe)
    icons.tsx     inline SVG icon set
scripts/
  fb-sync.mjs   Firebase Management API se config + rules sync
```
