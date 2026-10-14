"use client";

import { useEffect, useState } from "react";
import { IconFlame } from "@/lib/icons";
import { useHabits } from "@/lib/habits";

function Row({
  label,
  value,
  empty,
}: {
  label: string;
  value: number;
  empty: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-tile-soft px-5 py-4">
      <div>
        <p className="text-[15px] text-muted">{label}</p>
        <p className="mt-0.5 text-[13px] text-faint">
          {value > 0 ? `${value} day${value === 1 ? "" : "s"}` : empty}
        </p>
      </div>
      <IconFlame className={`size-6 ${value > 0 ? "text-flame" : "text-flame/35"}`} />
    </div>
  );
}

export function Streaks() {
  const { activeStreak, bestStreak } = useHabits();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section className="rounded-[var(--radius-card)] bg-card p-6 shadow-[var(--shadow-card)]">
      <h2 className="text-[15px] font-semibold">Streaks</h2>
      <div className="mt-4 flex flex-col gap-3">
        <Row
          label="Active"
          value={mounted ? activeStreak() : 0}
          empty="No active streak"
        />
        <Row
          label="All Time"
          value={mounted ? bestStreak() : 0}
          empty="No streaks yet"
        />
      </div>
    </section>
  );
}
