"use client";

import { getMessaging, getToken, isSupported, onMessage } from "firebase/messaging";
import { ref, serverTimestamp, set } from "firebase/database";
import { getDb, getFirebaseApp } from "@/lib/firebase";

const VAPID = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

export type PushState =
  | "unsupported"
  | "unconfigured"
  | "default"
  | "granted"
  | "denied";

export async function pushState(): Promise<PushState> {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  if (!(await isSupported().catch(() => false))) return "unsupported";
  if (!VAPID) return "unconfigured";
  return Notification.permission as PushState;
}

/**
 * Asks for notification permission and registers an FCM token against the user.
 * Returns the token, or null if the user said no / push isn't available.
 */
export async function enablePush(uid: string): Promise<string | null> {
  const app = getFirebaseApp();
  const db = getDb();
  if (!app || !db || !VAPID) return null;
  if (!(await isSupported().catch(() => false))) return null;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  const registration = await navigator.serviceWorker.register(
    "/firebase-messaging-sw.js",
  );
  const token = await getToken(getMessaging(app), {
    vapidKey: VAPID,
    serviceWorkerRegistration: registration,
  });
  if (!token) return null;

  // Tokens are per device+browser, so a user can have several.
  await set(ref(db, `users/${uid}/fcmTokens/${token}`), {
    createdAt: serverTimestamp(),
    ua: navigator.userAgent.slice(0, 300),
  });

  return token;
}

/** Foreground messages don't fire the service worker, so show them ourselves. */
export function listenForeground(onNotify: (title: string, body: string) => void) {
  const app = getFirebaseApp();
  if (!app) return () => {};
  let unsub = () => {};
  void isSupported().then((ok) => {
    if (!ok) return;
    unsub = onMessage(getMessaging(app), (payload) => {
      onNotify(
        payload.notification?.title ?? "Ritualz",
        payload.notification?.body ?? "",
      );
    });
  });
  return () => unsub();
}
