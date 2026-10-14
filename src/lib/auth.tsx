"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  EmailAuthProvider,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  linkWithCredential,
  linkWithPopup,
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { ref, serverTimestamp, update } from "firebase/database";
import { getDb, getFirebaseAuth, firebaseReady } from "@/lib/firebase";

type AuthState = {
  user: User | null;
  loading: boolean;
  /** Firebase configured at all? */
  enabled: boolean;
  /** Signed in, but with no real identity attached yet. */
  isGuest: boolean;
  signInGoogle: () => Promise<void>;
  signInEmail: (email: string, password: string) => Promise<void>;
  signUpEmail: (email: string, password: string, name: string) => Promise<void>;
  continueAsGuest: () => Promise<void>;
  logOut: () => Promise<void>;
};

const Ctx = createContext<AuthState | null>(null);

function friendly(e: unknown): Error {
  const code = (e as { code?: string })?.code ?? "";
  const map: Record<string, string> = {
    "auth/invalid-credential": "Email ya password galat hai.",
    "auth/invalid-email": "Yeh email address valid nahi hai.",
    "auth/weak-password": "Password kam se kam 6 characters ka hona chahiye.",
    "auth/email-already-in-use": "Is email se account pehle se hai. Log in karo.",
    "auth/popup-closed-by-user": "Sign-in window band ho gayi.",
    "auth/popup-blocked": "Browser ne popup block kar diya. Allow karke dubara try karo.",
    "auth/operation-not-allowed":
      "Yeh sign-in method Firebase Console me enable nahi hai.",
    "auth/network-request-failed": "Network nahi mila. Connection check karo.",
  };
  return new Error(map[code] ?? (e as Error)?.message ?? "Kuch galat ho gaya.");
}

/** Keeps the profile node in sync so the leaderboard has a name and photo. */
async function writeProfile(user: User) {
  const db = getDb();
  if (!db || user.isAnonymous) return;
  try {
    await update(ref(db, `users/${user.uid}/profile`), {
      name: user.displayName ?? user.email?.split("@")[0] ?? "Anonymous",
      email: user.email ?? null,
      photoURL: user.photoURL ?? null,
      updatedAt: serverTimestamp(),
    });
  } catch {
    /* profile write is best-effort; it must never block sign-in */
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(firebaseReady);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setLoading(false);
      return;
    }
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      if (u) void writeProfile(u);
    });
  }, []);

  const signInGoogle = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error("Firebase configure nahi hua.");
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    try {
      // A guest upgrading keeps their uid, so their habits come along.
      if (auth.currentUser?.isAnonymous) {
        await linkWithPopup(auth.currentUser, provider);
      } else {
        await signInWithPopup(auth, provider);
      }
    } catch (e) {
      const code = (e as { code?: string })?.code;
      // Guest linking to an account that already exists: drop the guest data
      // and sign into the real account instead.
      if (code === "auth/credential-already-in-use") {
        await signInWithPopup(auth, provider);
        return;
      }
      throw friendly(e);
    }
  }, []);

  const signInEmail = useCallback(async (email: string, password: string) => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error("Firebase configure nahi hua.");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      throw friendly(e);
    }
  }, []);

  const signUpEmail = useCallback(
    async (email: string, password: string, name: string) => {
      const auth = getFirebaseAuth();
      if (!auth) throw new Error("Firebase configure nahi hua.");
      try {
        if (auth.currentUser?.isAnonymous) {
          const cred = EmailAuthProvider.credential(email, password);
          const res = await linkWithCredential(auth.currentUser, cred);
          if (name) await updateProfile(res.user, { displayName: name });
          await writeProfile(res.user);
          return;
        }
        const res = await createUserWithEmailAndPassword(auth, email, password);
        if (name) await updateProfile(res.user, { displayName: name });
        await writeProfile(res.user);
      } catch (e) {
        throw friendly(e);
      }
    },
    [],
  );

  const continueAsGuest = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error("Firebase configure nahi hua.");
    try {
      await signInAnonymously(auth);
    } catch (e) {
      throw friendly(e);
    }
  }, []);

  const logOut = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (auth) await signOut(auth);
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      loading,
      enabled: firebaseReady,
      isGuest: Boolean(user?.isAnonymous),
      signInGoogle,
      signInEmail,
      signUpEmail,
      continueAsGuest,
      logOut,
    }),
    [user, loading, signInGoogle, signInEmail, signUpEmail, continueAsGuest, logOut],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
