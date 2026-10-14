"use client";

import { useCallback, useEffect, useState } from "react";
import { onValue, ref, remove, update } from "firebase/database";
import { getDb } from "@/lib/firebase";
import { isRealUser, useAuth } from "@/lib/auth";
import { enablePush, pushState, type PushState } from "@/lib/push";

export type Reminder = {
  enabled: boolean;
  /** Local wall-clock time, "HH:mm". */
  time: string;
  /** IANA zone, so the daemon can resolve that wall-clock time. */
  tz: string;
};

export const DEFAULT_REMINDER: Reminder = {
  enabled: false,
  time: "20:00",
  tz: typeof Intl !== "undefined"
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : "UTC",
};

/**
 * Reminder preferences live at a top-level `reminders/{uid}` node rather than
 * under the user, so the sender daemon can poll one small node every minute
 * instead of walking every user's habits.
 */
export function useReminder() {
  const { user } = useAuth();
  const [reminder, setReminder] = useState<Reminder>(DEFAULT_REMINDER);
  const [permission, setPermission] = useState<PushState>("default");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const uid = user?.uid ?? null;

  useEffect(() => {
    void pushState().then(setPermission);
  }, []);

  useEffect(() => {
    const db = getDb();
    if (!db || !uid) {
      setReminder(DEFAULT_REMINDER);
      return;
    }
    return onValue(ref(db, `reminders/${uid}`), (s) => {
      const v = s.val() as Partial<Reminder> | null;
      setReminder({
        enabled: v?.enabled ?? false,
        time: v?.time ?? DEFAULT_REMINDER.time,
        tz: v?.tz ?? DEFAULT_REMINDER.tz,
      });
    });
  }, [uid]);

  const save = useCallback(
    async (next: Partial<Reminder>) => {
      const db = getDb();
      if (!db || !uid) return;
      const merged = { ...reminder, ...next, tz: next.tz ?? DEFAULT_REMINDER.tz };
      setReminder(merged);
      await update(ref(db, `reminders/${uid}`), merged);
    },
    [uid, reminder],
  );

  /** Asks for permission, registers a token, then turns the reminder on. */
  const turnOn = useCallback(async () => {
    if (!uid) return;
    setBusy(true);
    setError(null);
    try {
      const token = await enablePush(uid);
      const state = await pushState();
      setPermission(state);
      if (!token) {
        setError(
          state === "denied"
            ? "Notifications block ho gayi hain. Browser settings se allow karo."
            : state === "unconfigured"
              ? "VAPID key set nahi hai."
              : state === "unsupported"
                ? "Is browser me push support nahi hai."
                : "Token nahi mila. Dobara try karo.",
        );
        return;
      }
      await save({ enabled: true });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, [uid, save]);

  const turnOff = useCallback(async () => {
    const db = getDb();
    if (!db || !uid) return;
    setBusy(true);
    try {
      await save({ enabled: false });
    } finally {
      setBusy(false);
    }
  }, [uid, save]);

  const forget = useCallback(async () => {
    const db = getDb();
    if (!db || !uid) return;
    await remove(ref(db, `reminders/${uid}`));
  }, [uid]);

  return {
    reminder,
    permission,
    busy,
    error,
    /** Guests get no reminders: the daemon has no one to address. */
    available: isRealUser(user),
    setTime: (time: string) => void save({ time }),
    turnOn,
    turnOff,
    forget,
  };
}
