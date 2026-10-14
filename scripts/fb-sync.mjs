/**
 * Reads the live Firebase project config and writes it into .env.local.
 *
 * Run after creating things in the console (Realtime Database, a new web app):
 *   npm run fb:sync
 *
 * Needs FIREBASE_SERVICE_ACCOUNT_PATH in .env.local, or a path as argv[2].
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { GoogleAuth } from "google-auth-library";

const PROJECT = "arise-699d5";
const ENV_PATH = resolve(process.cwd(), ".env.local");

function readEnv() {
  if (!existsSync(ENV_PATH)) return {};
  const out = {};
  for (const line of readFileSync(ENV_PATH, "utf8").split(/\r?\n/)) {
    const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
    if (m) out[m[1]] = m[2];
  }
  return out;
}

function setEnv(updates) {
  const lines = existsSync(ENV_PATH)
    ? readFileSync(ENV_PATH, "utf8").split(/\r?\n/)
    : [];
  const seen = new Set();
  const next = lines.map((line) => {
    const m = /^([A-Z0-9_]+)=/.exec(line.trim());
    if (m && m[1] in updates) {
      seen.add(m[1]);
      return `${m[1]}=${updates[m[1]]}`;
    }
    return line;
  });
  for (const [k, v] of Object.entries(updates)) {
    if (!seen.has(k)) next.push(`${k}=${v}`);
  }
  writeFileSync(ENV_PATH, next.join("\n"), "utf8");
}

const env = readEnv();
const keyFile = process.argv[2] || env.FIREBASE_SERVICE_ACCOUNT_PATH;
if (!keyFile || !existsSync(keyFile)) {
  console.error(
    "Service account JSON nahi mila.\n" +
      "  .env.local me FIREBASE_SERVICE_ACCOUNT_PATH set karo, ya:\n" +
      "  node scripts/fb-sync.mjs <path-to-service-account.json>",
  );
  process.exit(1);
}

const auth = new GoogleAuth({
  keyFile,
  scopes: ["https://www.googleapis.com/auth/cloud-platform"],
});
const client = await auth.getClient();
const get = async (url) => {
  const res = await client.request({ url, validateStatus: () => true });
  return { status: res.status, data: res.data };
};

const updates = {};

/* ---- web app config ---- */
const apps = await get(`https://firebase.googleapis.com/v1beta1/projects/${PROJECT}/webApps`);
const app = apps.data?.apps?.[0];
if (app) {
  const cfg = await get(
    `https://firebase.googleapis.com/v1beta1/projects/${PROJECT}/webApps/${app.appId}/config`,
  );
  const c = cfg.data ?? {};
  Object.assign(updates, {
    NEXT_PUBLIC_FIREBASE_API_KEY: c.apiKey ?? "",
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: c.authDomain ?? "",
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: c.projectId ?? "",
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: c.storageBucket ?? "",
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: c.messagingSenderId ?? "",
    NEXT_PUBLIC_FIREBASE_APP_ID: c.appId ?? "",
  });
  console.log(`web app  : ${app.displayName ?? app.appId}`);
} else {
  console.log("web app  : koi nahi mila");
}

/* ---- realtime database instance ---- */
const db = await get(
  `https://firebasedatabase.googleapis.com/v1beta/projects/${PROJECT}/locations/-/instances`,
);
if (db.status === 403) {
  console.log(
    "database : abhi tak nahi bana. Console > Realtime Database > Create Database,\n" +
      "           phir yeh script dubara chalao.",
  );
} else if (db.data?.instances?.length) {
  const inst = db.data.instances.find((i) => i.type === "DEFAULT_DATABASE") ?? db.data.instances[0];
  updates.NEXT_PUBLIC_FIREBASE_DATABASE_URL = inst.databaseUrl;
  console.log(`database : ${inst.databaseUrl}`);
} else {
  console.log("database : koi instance nahi mila");
}

/* ---- deploy database rules ---- */
const dbUrl = updates.NEXT_PUBLIC_FIREBASE_DATABASE_URL;
const rulesPath = resolve(process.cwd(), "database.rules.json");
if (dbUrl && existsSync(rulesPath)) {
  // The .settings endpoint rejects a plain cloud-platform token: it wants the
  // database scope alongside userinfo.email.
  const dbAuth = new GoogleAuth({
    keyFile,
    scopes: [
      "https://www.googleapis.com/auth/firebase.database",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
  });
  const dbClient = await dbAuth.getClient();
  const token = await dbClient.getAccessToken();
  const res = await fetch(`${dbUrl}/.settings/rules.json`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token.token ?? token}`,
      "Content-Type": "application/json",
    },
    body: readFileSync(rulesPath, "utf8"),
  });
  console.log(
    res.ok
      ? "rules    : database.rules.json deploy ho gaya"
      : `rules    : deploy fail (${res.status}) ${(await res.text()).slice(0, 200)}`,
  );
}

setEnv(updates);
console.log("\n.env.local update ho gaya.");
if (!readEnv().NEXT_PUBLIC_FIREBASE_VAPID_KEY) {
  console.log(
    "\nBaaki ek cheez: NEXT_PUBLIC_FIREBASE_VAPID_KEY\n" +
      "  Console > Project Settings > Cloud Messaging > Web Push certificates > Generate key pair",
  );
}
