"use client";

import { useEffect, useState } from "react";
import { MONTHS } from "@/lib/date";
import { useHabits } from "@/lib/habits";

const BARS = 18;

export function MonthlyProgress() {
  const { monthRatio } = useHabits();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const today = new Date();
  const months = Array.from({ length: BARS }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() - (BARS - 1 - i), 1);
    return { date: d, ratio: mounted ? monthRatio(d.getFullYear(), d.getMonth()) : 0 };
  });

  const current = months[months.length - 1].ratio * 100;
  const previous = months[months.length - 2].ratio * 100;
  const delta = current - previous;

  return (
    <section className="rounded-[var(--radius-card)] bg-card p-6 shadow-[var(--shadow-card)]">
      <h2 className="text-[15px] font-semibold">Monthly Progress</h2>

      <div className="mt-3 flex items-start justify-between">
        <div>
          <p className="flex items-baseline gap-0.5">
            <span className="text-[40px] font-semibold leading-none tracking-tight tabular-nums">
              {current.toFixed(1)}
            </span>
            <span className="text-[20px] font-medium text-text">%</span>
          </p>
          <p className="mt-2 text-[13px] text-muted">
            Last month · {previous.toFixed(1)}%
          </p>
        </div>

        <p
          className={`flex items-center gap-1 text-[13px] font-medium tabular-nums ${
            delta < 0 ? "text-red-500" : "text-accent"
          }`}
        >
          <span aria-hidden>{delta < 0 ? "↓" : "↑"}</span>
          {Math.abs(delta).toFixed(1)}%
        </p>
      </div>

      <div className="mt-6 flex items-end gap-[6px]">
        {months.map(({ date, ratio }, i) => {
          const isCurrent = i === months.length - 1;
          return (
            <div key={i} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex h-[110px] w-full items-end">
                <div className="relative w-full overflow-hidden rounded-[6px] bg-tile" style={{ height: "100%" }}>
                  <div
                    className="absolute inset-x-0 bottom-0 rounded-[6px] bg-accent transition-[height] duration-500"
                    style={{ height: `${Math.max(ratio * 100, ratio > 0 ? 6 : 0)}%` }}
                  />
                </div>
              </div>
              <span
                className={`text-[11px] ${isCurrent ? "font-semibold text-text" : "text-faint"}`}
              >
                {MONTHS[date.getMonth()][0]}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
