"use client";

import { useEffect, useState } from "react";
import { DAY_LABELS, key, monthGrid, sameDay } from "@/lib/date";
import { useHabits } from "@/lib/habits";

export function MonthCalendar({
  month,
  selected,
  onSelect,
}: {
  month: Date;
  selected: Date;
  onSelect: (d: Date) => void;
}) {
  const { completionRatio } = useHabits();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const days = monthGrid(month);
  const today = new Date();

  return (
    <div>
      <div className="grid grid-cols-7 gap-[6px] pb-2">
        {DAY_LABELS.map((l, i) => (
          <div key={i} className="text-center text-[13px] text-muted">
            {l}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-[6px]">
        {days.map((d) => {
          const outside = d.getMonth() !== month.getMonth();
          const isSelected = sameDay(d, selected);
          const isToday = sameDay(d, today);
          const ratio = mounted && !outside ? completionRatio(key(d)) : 0;
          const filled = ratio > 0;

          return (
            <button
              key={key(d)}
              type="button"
              onClick={() => onSelect(d)}
              aria-current={isToday ? "date" : undefined}
              aria-label={d.toDateString()}
              className={`flex aspect-square items-center justify-center rounded-[10px] text-[13px] tabular-nums transition-colors ${
                isSelected ? "ring-2 ring-accent" : ""
              } ${
                filled
                  ? "text-white"
                  : outside
                    ? "bg-transparent text-faint/50"
                    : "bg-tile text-faint hover:bg-hover"
              }`}
              style={
                filled
                  ? {
                      backgroundColor: `color-mix(in srgb, var(--accent) ${20 + ratio * 80}%, var(--tile))`,
                    }
                  : undefined
              }
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
