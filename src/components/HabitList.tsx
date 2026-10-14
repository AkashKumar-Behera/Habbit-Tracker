"use client";

import { useEffect, useRef, useState } from "react";
import { SlideRow } from "@/components/SlideRow";
import { IconDots, IconPlus, IconTrash } from "@/lib/icons";
import { HABIT_ICONS, useHabits, type Habit } from "@/lib/habits";
import { key } from "@/lib/date";

function Menu({ habit }: { habit: Habit }) {
  const { removeHabit, renameHabit } = useHabits();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={`Options for ${habit.name}`}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex size-9 items-center justify-center rounded-full text-faint transition-colors hover:bg-hover hover:text-text"
      >
        <IconDots className="size-5" />
      </button>

      {open ? (
        <div className="absolute right-0 top-10 z-20 w-44 overflow-hidden rounded-2xl bg-card py-1 shadow-[var(--shadow-card)]">
          <button
            type="button"
            onClick={() => {
              const name = window.prompt("Rename habit", habit.name)?.trim();
              if (name) renameHabit(habit.id, name);
              setOpen(false);
            }}
            className="w-full px-4 py-2.5 text-left text-[14px] transition-colors hover:bg-hover"
          >
            Rename
          </button>
          <button
            type="button"
            onClick={() => {
              removeHabit(habit.id);
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-[14px] text-red-500 transition-colors hover:bg-hover"
          >
            <IconTrash className="size-4" />
            Delete
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function HabitList({
  day,
  onAdd,
}: {
  day: Date;
  onAdd: () => void;
}) {
  const { habits, ready, toggle, isDone } = useHabits();
  const dayKey = key(day);

  if (!ready) return <div className="min-h-40" />;

  if (habits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <button
          type="button"
          onClick={onAdd}
          className="flex size-16 items-center justify-center rounded-2xl bg-tile-soft text-text transition-colors hover:bg-hover"
          aria-label="Create your first habit"
        >
          <IconPlus className="size-6" />
        </button>
        <p className="mt-5 text-[15px] font-semibold">No habits yet</p>
        <p className="mt-1 text-[13px] text-muted">Tap to create your first habit.</p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {habits.map((h) => {
        const Icon = HABIT_ICONS[h.icon];
        const done = isDone(h.id, dayKey);
        return (
          <li key={h.id} className="rounded-[var(--radius-card)] bg-card p-2 shadow-[var(--shadow-card)]">
            <SlideRow
              label={`${h.name} — ${done ? "done" : "not done"}, slide to toggle`}
              done={done}
              onConfirm={() => toggle(h.id, dayKey)}
              trailing={<Menu habit={h} />}
            >
              <span
                className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                  done ? "bg-accent text-white" : "bg-tile text-text"
                }`}
              >
                <Icon className="size-5" />
              </span>
              <span className="truncate text-[15px] font-medium">{h.name}</span>
            </SlideRow>
          </li>
        );
      })}
    </ul>
  );
}
