/**
 * Ritualz reminder daemon.
 *
 * Wakes once a minute, finds users whose local reminder time just arrived and
 * who still have habits left for today, and pushes them a nudge over FCM.
 *
 * It polls the small top-level `reminders` node rather than walking every
 * user's habits, so a tick costs one tiny read plus one read per due user.
 *
 * Run:
 *   FIREBASE_SERVICE_ACCOUNT=/path/key.json \
 *   FIREBASE_DATABASE_URL=https://arise-699d5-default-rtdb.firebaseio.com \
 *   node daemon/send-reminders.mjs
 */
import { readFileSync } from "node:fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";
import { getMessaging } from "firebase-admin/messaging";

const KEY_PATH = process.env.FIREBASE_SERVICE_ACCOUNT;
const DB_URL = process.env.FIREBASE_DATABASE_URL;
const TICK_MS = Number(process.env.TICK_MS ?? 60_000);
const DRY_RUN = process.env.DRY_RUN === "1";

if (!KEY_PATH || !DB_URL) {
  console.error(
    "FIREBASE_SERVICE_ACCOUNT (path to the service account JSON) and " +
      "FIREBASE_DATABASE_URL are both required.",
  );
  process.exit(1);
}

initializeApp({
  credential: cert(JSON.parse(readFileSync(KEY_PATH, "utf8"))),
  databaseURL: DB_URL,
});

const db = getDatabase();
const messaging = getMessaging();

const log = (...args) => console.log(new Date().toISOString(), ...args);

/** That user's wall clock right now, as { day: "YYYY-MM-DD", hm: "HH:mm" }. */
function localNow(tz) {
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(new Date());
    const get = (t) => parts.find((p) => p.type === t)?.value ?? "";
    const hour = get("hour") === "24" ? "00" : get("hour");
    return {
      day: `${get("year")}-${get("month")}-${get("day")}`,
      hm: `${hour}:${get("minute")}`,
    };
  } catch {
    return null; // unknown timezone: skip rather than guess
  }
}

/** Minutes from `from` to `to` on a 24h clock, never negative. */
function minutesSince(from, to) {
  const [fh, fm] = from.split(":").map(Number);
  const [th, tm] = to.split(":").map(Number);
  return (th * 60 + tm - (fh * 60 + fm) + 1440) % 1440;
}

async function pendingCount(uid, day) {
  const [habitsSnap, doneSnap] = await Promise.all([
    db.ref(`users/${uid}/habits`).get(),
    db.ref(`users/${uid}/completions/${day}`).get(),
  ]);
  const habits = habitsSnap.val() ?? {};
  const done = doneSnap.val() ?? {};
  const ids = Object.keys(habits);
  return {
    total: ids.length,
    pending: ids.filter((id) => !done[id]).length,
  };
}

async function sendTo(uid, pending, total) {
  const tokensSnap = await db.ref(`users/${uid}/fcmTokens`).get();
  const tokens = Object.keys(tokensSnap.val() ?? {});
  if (tokens.length === 0) return 0;

  const body =
    pending === total
      ? `Aaj ki ${total} habits abhi baaki hain.`
      : `${pending} habit${pending === 1 ? "" : "s"} abhi baaki ${pending === 1 ? "hai" : "hain"}.`;

  if (DRY_RUN) {
    log(`  [dry-run] ${uid}: "${body}" -> ${tokens.length} token(s)`);
    return tokens.length;
  }

  const res = await messaging.sendEachForMulticast({
    tokens,
    notification: { title: "Ritualz", body },
    data: { tag: "daily-reminder" },
    webpush: {
      fcmOptions: { link: "/" },
      notification: { icon: "/icon-192.png", badge: "/icon-192.png" },
    },
  });

  // Drop tokens the device has thrown away, or they accumulate forever.
  const dead = [];
  res.responses.forEach((r, i) => {
    const code = r.error?.code ?? "";
    if (
      code === "messaging/registration-token-not-registered" ||
      code === "messaging/invalid-registration-token"
    ) {
      dead.push(tokens[i]);
    }
  });
  await Promise.all(
    dead.map((t) => db.ref(`users/${uid}/fcmTokens/${t}`).remove()),
  );
  if (dead.length) log(`  pruned ${dead.length} stale token(s) for ${uid}`);

  return res.successCount;
}

async function tick() {
  const snap = await db.ref("reminders").get();
  const all = snap.val() ?? {};
  let due = 0;

  for (const [uid, r] of Object.entries(all)) {
    if (!r?.enabled || !r.time || !r.tz) continue;

    const now = localNow(r.tz);
    if (!now) continue;
    if (r.lastSent === now.day) continue; // already nudged today

    // A window, not an equality check: a tick can be late, or the process can
    // restart and miss the exact minute.
    const late = minutesSince(r.time, now.hm);
    if (late > 10) continue;

    const { total, pending } = await pendingCount(uid, now.day);
    if (total === 0 || pending === 0) {
      // Nothing to nag about. Mark the day done so we stop re-checking it.
      await db.ref(`reminders/${uid}/lastSent`).set(now.day);
      continue;
    }

    const sent = await sendTo(uid, pending, total);
    await db.ref(`reminders/${uid}/lastSent`).set(now.day);
    due += 1;
    log(`sent to ${uid} (${pending}/${total} pending, ${sent} device(s))`);
  }

  if (due > 0) log(`tick: notified ${due} user(s)`);
}

let running = false;
async function safeTick() {
  if (running) return; // never let a slow tick overlap the next one
  running = true;
  try {
    await tick();
  } catch (e) {
    log("tick failed:", e.message);
  } finally {
    running = false;
  }
}

log(`reminder daemon up (every ${TICK_MS / 1000}s${DRY_RUN ? ", dry-run" : ""})`);
await safeTick();
const timer = setInterval(safeTick, TICK_MS);

for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, () => {
    log(`${sig} received, shutting down`);
    clearInterval(timer);
    process.exit(0);
  });
}
