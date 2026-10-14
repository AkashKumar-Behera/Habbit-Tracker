"use client";

import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getDatabase, type Database } from "firebase/database";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

/**
 * Auth needs only the web app config. Until .env.local has it, the app runs
 * in local-only mode (localStorage) instead of crashing on a half-built SDK.
 */
export const firebaseReady = Boolean(config.apiKey && config.appId);

/** The Realtime Database is configured separately and may lag behind auth. */
export const databaseReady = Boolean(config.databaseURL);

let app: FirebaseApp | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  if (!firebaseReady) return null;
  if (!app) app = getApps().length ? getApp() : initializeApp(config);
  return app;
}

export function getFirebaseAuth(): Auth | null {
  const a = getFirebaseApp();
  return a ? getAuth(a) : null;
}

export function getDb(): Database | null {
  if (!databaseReady) return null;
  const a = getFirebaseApp();
  return a ? getDatabase(a) : null;
}
