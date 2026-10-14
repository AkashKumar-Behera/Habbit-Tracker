"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { onValue, ref, remove, set, update } from "firebase/database";
import {
  IconBook,
  IconDrop,
  IconDumbbell,
  IconMoon,
  IconPencil,
  IconRun,
} from "@/lib/icons";
import { addDays, key } from "@/lib/date";
import { getDb } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";

export type HabitIconId = "book" | "pencil" | "run" | "dumbbell" | "drop" | "moon";

export const HABIT_ICONS: Record<
  HabitIconId,
  (p: { className?: string }) => ReactNode
> = {
  book: IconBook,
  pencil: IconPencil,
  run: IconRun,
  dumbbell: IconDumbbell,
  drop: IconDrop,
  moon: IconMoon,
};

export const SUGGESTED: { name: string; icon: HabitIconId }[] = [
  { name: "Read", icon: "book" },
  { name: "Write", icon: "pencil" },
  { name: "Run", icon: "run" },
  { name: "Gym", icon: "dumbbell" },
  { name: "Water", icon: "drop" },
  { name: "Sleep early", icon: "moon" },
];

export type Habit = {
  id: string;
  name: string;
  icon: HabitIconId;
  createdAt: string;
  order: number;
};

/** completions[YYYY-MM-DD][habitId] === true */
export type Completions = Record<string, Record<string, true>>;

type Store = {
  habits: Habit[];
  ready: boolean;
  /** true when writes go to RTDB, false when they only reach localStorage */
  synced: boolean;
  addHabit: (name: string, icon: HabitIconId) => void;
  removeHabit: (id: string) => void;
  renameHabit: (id: string, name: string) => void;
  toggle: (id: string, dayKey: string) => void;
  isDone: (id: string, dayKey: string) => boolean;
  doneCount: (dayKey: string) => number;
  completionRatio: (dayKey: string) => number;
  monthRatio: (year: number, month: number) => number;
  activeStreak: () => number;
  bestStreak: () => number;
};

const LOCAL_KEY = "ritualz.local.v2";
const Ctx = createContext<Store | null>(null);

type Snapshot = { habits: Habit[]; completions: Completions };
const EMPTY: Snapshot = { habits: [], completions: {} };

function loadLocal(): Snapshot {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<Snapshot>;
      return {
        habits: Array.isArray(p.habits) ? p.habits : [],
        completions: p.completions ?? {},
      };
    }
    // Migrate the pre-Firebase shape, where Habit.done was a string[] of days.
    const old = localStorage.getItem("ritualz.habits.v1");
    if (!old) return EMPTY;
    const legacy = JSON.parse(old) as (Habit & { done?: string[] })[];
    if (!Array.isArray(legacy)) return EMPTY;
    const completions: Completions = {};
    legacy.forEach((h) => {
      (h.done ?? []).forEach((d) => {
        completions[d] = { ...(completions[d] ?? {}), [h.id]: true };
      });
    });
    return {
      habits: legacy.map((h, i) => ({
        id: h.id,
        name: h.name,
        icon: h.icon,
        createdAt: h.createdAt,
        order: h.order ?? i,
      })),
      completions,
    };
  } catch {
    return EMPTY;
  }
}

function saveLocal(snap: Snapshot) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(snap));
  } catch {
    /* quota or private mode: the session still works, it just won't persist */
  }
}

const sortHabits = (habits: Habit[]) =>
  [...habits].sort((a, b) => a.order - b.order);

export function HabitProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [snap, setSnap] = useState<Snapshot>(EMPTY);
  const [ready, setReady] = useState(false);
  const uid = user?.uid ?? null;
  const migrated = useRef<string | null>(null);

  const synced = Boolean(uid && getDb());

  /* ---------- load: RTDB when signed in, localStorage otherwise ---------- */
  useEffect(() => {
    if (authLoading) return;

    const db = getDb();
    if (!uid || !db) {
      setSnap(loadLocal());
      setReady(true);
      return;
    }

    setReady(false);
    const userRef = ref(db, `users/${uid}`);

    const unsubscribe = onValue(
      userRef,
      (s) => {
        const val = (s.val() ?? {}) as {
          habits?: Record<string, Omit<Habit, "id">>;
          completions?: Completions;
        };
        const habits = sortHabits(
          Object.entries(val.habits ?? {}).map(([id, h], i) => ({
            id,
            name: h.name,
            icon: h.icon,
            createdAt: h.createdAt,
            order: h.order ?? i,
          })),
        );
        setSnap({ habits, completions: val.completions ?? {} });
        setReady(true);

        // First sign-in on this device: push up whatever was tracked locally.
        if (habits.length === 0 && migrated.current !== uid) {
          migrated.current = uid;
          const local = loadLocal();
          if (local.habits.length > 0) {
            const payload: Record<string, unknown> = {};
            local.habits.forEach((h) => {
              payload[`habits/${h.id}`] = {
                name: h.name,
                icon: h.icon,
                createdAt: h.createdAt,
                order: h.order,
              };
            });
            Object.entries(local.completions).forEach(([day, ids]) => {
              Object.keys(ids).forEach((hid) => {
                payload[`completions/${day}/${hid}`] = true;
              });
            });
            void update(userRef, payload).catch(() => {
              /* rules or network: the local copy stays as the fallback */
            });
          }
        }
      },
      () => {
        // Permission denied or offline: fall back rather than showing nothing.
        setSnap(loadLocal());
        setReady(true);
      },
    );

    return unsubscribe;
  }, [uid, authLoading]);

  /* ---------- persist locally whenever we are not synced ---------- */
  useEffect(() => {
    if (!ready || synced) return;
    saveLocal(snap);
  }, [snap, ready, synced]);

  const addHabit = useCallback(
    (name: string, icon: HabitIconId) => {
      const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
      const habit: Habit = {
        id,
        name,
        icon,
        createdAt: key(new Date()),
        order: snap.habits.length,
      };
      setSnap((s) => ({ ...s, habits: sortHabits([...s.habits, habit]) }));

      const db = getDb();
      if (db && uid) {
        void set(ref(db, `users/${uid}/habits/${id}`), {
          name,
          icon,
          createdAt: habit.createdAt,
          order: habit.order,
        });
      }
    },
    [snap.habits.length, uid],
  );

  const removeHabit = useCallback(
    (id: string) => {
      setSnap((s) => {
        const completions: Completions = {};
        Object.entries(s.completions).forEach(([day, ids]) => {
          const rest = { ...ids };
          delete rest[id];
          if (Object.keys(rest).length > 0) completions[day] = rest;
        });
        return { habits: s.habits.filter((h) => h.id !== id), completions };
      });

      const db = getDb();
      if (!db || !uid) return;
      void remove(ref(db, `users/${uid}/habits/${id}`));
      // Completions are keyed by day first, so they must be swept day by day.
      const payload: Record<string, null> = {};
      Object.entries(snap.completions).forEach(([day, ids]) => {
        if (ids[id]) payload[`completions/${day}/${id}`] = null;
      });
      if (Object.keys(payload).length > 0) {
        void update(ref(db, `users/${uid}`), payload);
      }
    },
    [uid, snap.completions],
  );

  const renameHabit = useCallback(
    (id: string, name: string) => {
      setSnap((s) => ({
        ...s,
        habits: s.habits.map((h) => (h.id === id ? { ...h, name } : h)),
      }));
      const db = getDb();
      if (db && uid) void set(ref(db, `users/${uid}/habits/${id}/name`), name);
    },
    [uid],
  );

  const toggle = useCallback(
    (id: string, dayKey: string) => {
      const nowDone = !snap.completions[dayKey]?.[id];

      setSnap((s) => {
        const day = { ...(s.completions[dayKey] ?? {}) };
        if (nowDone) day[id] = true;
        else delete day[id];
        const completions = { ...s.completions };
        if (Object.keys(day).length > 0) completions[dayKey] = day;
        else delete completions[dayKey];
        return { ...s, completions };
      });

      const db = getDb();
      if (db && uid) {
        void set(ref(db, `users/${uid}/completions/${dayKey}/${id}`), nowDone ? true : null);
      }
    },
    [snap.completions, uid],
  );

  const value = useMemo<Store>(() => {
    const { habits, completions } = snap;

    const isDone = (id: string, dayKey: string) =>
      completions[dayKey]?.[id] === true;

    // Only count habits that still exist, so deleting one can't push a day over 100%.
    const doneCount = (dayKey: string) => {
      const day = completions[dayKey];
      if (!day) return 0;
      return habits.reduce((n, h) => n + (day[h.id] ? 1 : 0), 0);
    };

    const completionRatio = (dayKey: string) =>
      habits.length === 0 ? 0 : doneCount(dayKey) / habits.length;

    const monthRatio = (year: number, month: number) => {
      if (habits.length === 0) return 0;
      const today = new Date();
      if (new Date(year, month, 1) > today) return 0;
      const isThisMonth = year === today.getFullYear() && month === today.getMonth();
      // Only count days that have already happened, so the live month is fair.
      const upto = isThisMonth
        ? today.getDate()
        : new Date(year, month + 1, 0).getDate();
      let total = 0;
      for (let d = 1; d <= upto; d++) {
        total += completionRatio(key(new Date(year, month, d)));
      }
      return total / upto;
    };

    const streakFrom = (start: Date) => {
      let n = 0;
      let cursor = start;
      while (completionRatio(key(cursor)) === 1) {
        n += 1;
        cursor = addDays(cursor, -1);
      }
      return n;
    };

    const activeStreak = () => {
      if (habits.length === 0) return 0;
      const today = new Date();
      // A day that isn't finished yet shouldn't break the streak.
      return completionRatio(key(today)) === 1
        ? streakFrom(today)
        : streakFrom(addDays(today, -1));
    };

    const bestStreak = () => {
      if (habits.length === 0) return 0;
      const days = Object.keys(completions).sort();
      let best = 0;
      let run = 0;
      let prev: string | null = null;
      for (const d of days) {
        if (completionRatio(d) !== 1) {
          run = 0;
          prev = d;
          continue;
        }
        const expected = prev ? key(addDays(new Date(`${prev}T00:00:00`), 1)) : null;
        run = expected === d ? run + 1 : 1;
        best = Math.max(best, run);
        prev = d;
      }
      return best;
    };

    return {
      habits,
      ready,
      synced,
      addHabit,
      removeHabit,
      renameHabit,
      toggle,
      isDone,
      doneCount,
      completionRatio,
      monthRatio,
      activeStreak,
      bestStreak,
    };
  }, [snap, ready, synced, addHabit, removeHabit, renameHabit, toggle]);

  /* ---------- publish streaks to the shared leaderboard ---------- */
  const active = value.activeStreak();
  const best = value.bestStreak();
  useEffect(() => {
    const db = getDb();
    // Guests stay off the leaderboard: they have no name to show.
    if (!db || !uid || !ready || !user || user.isAnonymous) return;
    void set(ref(db, `leaderboard/${uid}`), {
      name: user.displayName ?? user.email?.split("@")[0] ?? "Anonymous",
      photoURL: user.photoURL ?? null,
      activeStreak: active,
      bestStreak: best,
      updatedAt: Date.now(),
    }).catch(() => {
      /* best-effort: the leaderboard is never worth blocking the UI for */
    });
  }, [uid, user, ready, active, best]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useHabits(): Store {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useHabits must be used inside <HabitProvider>");
  return ctx;
}
