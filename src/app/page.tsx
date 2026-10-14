"use client";

import { useState } from "react";
import { ActivityHeatmap } from "@/components/ActivityHeatmap";
import { AddHabitSheet } from "@/components/AddHabitSheet";
import { HabitList } from "@/components/HabitList";
import { MonthCalendar } from "@/components/MonthCalendar";
import { MonthlyProgress } from "@/components/MonthlyProgress";
import { Sidebar } from "@/components/Sidebar";
import { Streaks } from "@/components/Streaks";
import {
  IconArrowLeft,
  IconArrowRight,
  IconGrid,
  IconMenu,
  IconPlus,
} from "@/lib/icons";
import { addMonths, formatLong } from "@/lib/date";

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-9 items-center justify-center rounded-xl bg-tile-soft text-text transition-colors hover:bg-hover"
    >
      {children}
    </button>
  );
}

export default function Page() {
  const [selected, setSelected] = useState(() => new Date());
  const [month, setMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [sheet, setSheet] = useState(false);
  const [nav, setNav] = useState(false);
  const [stats, setStats] = useState(false);

  const shiftMonth = (n: number) => {
    const next = addMonths(month, n);
    setMonth(next);
    setSelected(new Date(next.getFullYear(), next.getMonth(), 1));
  };

  const rightPanel = (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between gap-2 px-6 pt-5 pb-4">
        <h1 className="text-[15px] font-semibold">{formatLong(selected)}</h1>
        <div className="flex items-center gap-2">
          <IconButton label="Previous month" onClick={() => shiftMonth(-1)}>
            <IconArrowLeft className="size-4" />
          </IconButton>
          <IconButton label="Next month" onClick={() => shiftMonth(1)}>
            <IconArrowRight className="size-4" />
          </IconButton>
          <span className="mx-1 h-5 w-px bg-line" />
          <IconButton label="Add habit" onClick={() => setSheet(true)}>
            <IconPlus className="size-4" />
          </IconButton>
        </div>
      </header>

      <div className="px-6">
        <MonthCalendar month={month} selected={selected} onSelect={setSelected} />
      </div>

      <div className="mx-6 my-5 h-px bg-line" />

      <div className="flex-1 overflow-y-auto px-6 pb-8">
        <HabitList day={selected} onAdd={() => setSheet(true)} />
      </div>
    </div>
  );

  const feed = (
    <div className="flex flex-col gap-6 px-6 pb-10 pt-6 lg:px-8">
      <ActivityHeatmap />
      <MonthlyProgress />
      <Streaks />
    </div>
  );

  return (
    <>
      {/* ---------- desktop: three columns ---------- */}
      <div className="hidden h-dvh lg:grid lg:grid-cols-[356px_minmax(0,1fr)_380px]">
        <aside className="border-r border-line bg-panel">
          <Sidebar />
        </aside>
        <main className="overflow-y-auto">{feed}</main>
        <aside className="overflow-y-auto border-l border-line">{rightPanel}</aside>
      </div>

      {/* ---------- mobile / tablet ---------- */}
      <div className="flex h-dvh flex-col lg:hidden">
        <header className="flex items-center gap-3 px-4 pt-4 pb-2">
          <IconButton label="Open menu" onClick={() => setNav(true)}>
            <IconMenu className="size-5" />
          </IconButton>
          <h1 className="flex-1 text-[17px] font-semibold">{formatLong(selected)}</h1>
          <IconButton
            label={stats ? "Show habits" : "Show stats"}
            onClick={() => setStats((s) => !s)}
          >
            <IconGrid className="size-5" />
          </IconButton>
          <IconButton label="Add habit" onClick={() => setSheet(true)}>
            <IconPlus className="size-5" />
          </IconButton>
        </header>

        <div className="flex-1 overflow-y-auto">
          {stats ? (
            feed
          ) : (
            <div className="px-4 pb-10">
              <MonthCalendar month={month} selected={selected} onSelect={setSelected} />
              <div className="my-5 h-px bg-line" />
              <HabitList day={selected} onAdd={() => setSheet(true)} />
            </div>
          )}
        </div>

        {nav ? (
          <div className="fixed inset-0 z-40 flex">
            <div
              className="absolute inset-0 bg-black/30"
              onClick={() => setNav(false)}
              aria-hidden
            />
            <div className="relative h-full w-[300px] max-w-[85vw] bg-panel shadow-2xl">
              <Sidebar />
            </div>
          </div>
        ) : null}
      </div>

      <AddHabitSheet open={sheet} onClose={() => setSheet(false)} />
    </>
  );
}
