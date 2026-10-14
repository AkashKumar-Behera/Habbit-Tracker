"use client";

import { useEffect, useRef, useState } from "react";
import { DAY_LABELS, heatmapWeeks, key, monthSpans, sameDay } from "@/lib/date";
import { useHabits } from "@/lib/habits";

const CELL = 36;
const GAP = 6;

export function ActivityHeatmap({ weeks = 18 }: { weeks?: number }) {
  const { completionRatio } = useHabits();
  const today = new Date();
  const cols = heatmapWeeks(today, weeks);
  const spans = monthSpans(cols);

  const scroller = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const el = scroller.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, []);

  return (
    <section aria-label="Activity">
      <h2 className="mb-4 text-[15px] font-semibold">Activity</h2>

      <div className="flex gap-2">
        <div ref={scroller} className="no-scrollbar flex-1 overflow-x-auto">
          <div style={{ width: cols.length * (CELL + GAP) - GAP }}>
            <div className="relative mb-2 h-4">
              {spans.map((s) => (
                <span
                  key={`${s.label}-${s.index}`}
                  className="absolute text-[13px] text-muted"
                  style={{ left: s.index * (CELL + GAP) }}
                >
                  {s.label}
                </span>
              ))}
            </div>

            <div className="flex" style={{ gap: GAP }}>
              {cols.map((col, ci) => (
                <div key={ci} className="flex flex-col" style={{ gap: GAP }}>
                  {col.map((d) => {
                    const future = d > today;
                    const isToday = sameDay(d, today);
                    const ratio = mounted ? completionRatio(key(d)) : 0;
                    const filled = ratio > 0;
                    return (
                      <div
                        key={key(d)}
                        title={`${key(d)} — ${Math.round(ratio * 100)}%`}
                        className={`flex items-center justify-center rounded-[10px] text-[13px] tabular-nums transition-colors ${
                          isToday
                            ? "ring-2 ring-accent"
                            : ""
                        } ${
                          filled
                            ? "text-white"
                            : future
                              ? "bg-transparent text-faint/60"
                              : "bg-tile text-faint"
                        }`}
                        style={{
                          width: CELL,
                          height: CELL,
                          backgroundColor: filled
                            ? `color-mix(in srgb, var(--accent) ${20 + ratio * 80}%, var(--tile))`
                            : undefined,
                        }}
                      >
                        {d.getDate()}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col pt-6" style={{ gap: GAP }}>
          {DAY_LABELS.map((l, i) => (
            <div
              key={i}
              className="flex items-center justify-center text-[13px] text-muted"
              style={{ height: CELL, width: 18 }}
            >
              {l}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
