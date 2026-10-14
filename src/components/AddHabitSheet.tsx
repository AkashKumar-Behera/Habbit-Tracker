"use client";

import { useEffect, useRef, useState } from "react";
import { SlideRow } from "@/components/SlideRow";
import { IconPlus } from "@/lib/icons";
import { HABIT_ICONS, SUGGESTED, useHabits } from "@/lib/habits";

export function AddHabitSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { habits, addHabit } = useHabits();
  const [custom, setCustom] = useState("");
  const dialog = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) setCustom("");
  }, [open]);

  if (!open) return null;

  const taken = new Set(habits.map((h) => h.name.toLowerCase()));
  const remaining = SUGGESTED.filter((s) => !taken.has(s.name.toLowerCase()));

  const submitCustom = () => {
    const name = custom.trim();
    if (!name) return;
    addHabit(name, "book");
    setCustom("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onMouseDown={(e) => {
        if (!dialog.current?.contains(e.target as Node)) onClose();
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        style={{ animation: "fade .18s ease-out" }}
      />

      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-label="Add habit"
        className="relative w-full max-w-[500px] rounded-[28px] bg-card p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)]"
      >
        <p className="mb-4 text-[13px] text-muted">Slide to add habit</p>

        <div className="flex flex-col gap-3">
          {remaining.map((s) => {
            const Icon = HABIT_ICONS[s.icon];
            return (
              <SlideRow
                key={s.name}
                label={`Add ${s.name}`}
                onConfirm={() => {
                  addHabit(s.name, s.icon);
                  onClose();
                }}
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-tile text-text">
                  <Icon className="size-5" />
                </span>
                <span className="text-[15px] font-medium">{s.name}</span>
              </SlideRow>
            );
          })}
        </div>

        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-line" />
          <span className="text-[13px] text-muted">or create your own</span>
          <span className="h-px flex-1 bg-line" />
        </div>

        <div className="flex items-center gap-3 rounded-2xl bg-tile-soft py-3 pl-3 pr-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-tile text-text">
            <IconPlus className="size-5" />
          </span>
          <input
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitCustom()}
            placeholder="...."
            aria-label="New habit name"
            className="min-w-0 flex-1 bg-transparent text-[15px] font-medium outline-none placeholder:text-faint"
          />
          <button
            type="button"
            onClick={submitCustom}
            disabled={!custom.trim()}
            className="rounded-xl bg-accent px-4 py-2 text-[14px] font-medium text-white transition-opacity disabled:opacity-30"
          >
            Add
          </button>
        </div>
      </div>

      <style>{`@keyframes fade { from { opacity: 0 } to { opacity: 1 } }`}</style>
    </div>
  );
}
