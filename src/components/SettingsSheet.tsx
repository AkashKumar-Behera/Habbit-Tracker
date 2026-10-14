"use client";

import { useEffect, useRef } from "react";
import { useReminder } from "@/lib/reminders";
import { useTheme } from "@/components/ThemeProvider";
import { IconMoon, IconSun } from "@/lib/icons";

function Toggle({
  on,
  onChange,
  disabled,
  label,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!on)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-40 ${
        on ? "bg-accent" : "bg-tile"
      }`}
    >
      <span
        className={`absolute top-1 size-5 rounded-full bg-white shadow transition-[left] duration-200 ${
          on ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
}

export function SettingsSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { theme, toggle } = useTheme();
  const {
    reminder,
    permission,
    busy,
    error,
    available,
    setTime,
    turnOn,
    turnOff,
  } = useReminder();
  const dialog = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onMouseDown={(e) => {
        if (!dialog.current?.contains(e.target as Node)) onClose();
      }}
    >
      <div aria-hidden className="absolute inset-0 bg-black/25 backdrop-blur-sm" />

      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
        className="relative w-full max-w-[460px] rounded-[28px] bg-card p-7 shadow-[0_20px_60px_rgba(0,0,0,0.2)]"
      >
        <h2 className="text-[20px] font-semibold tracking-tight">Settings</h2>

        {/* theme */}
        <div className="mt-6 flex items-center gap-4 rounded-2xl bg-tile-soft px-5 py-4">
          <span className="flex size-9 items-center justify-center rounded-xl bg-tile">
            {theme === "dark" ? (
              <IconSun className="size-5" />
            ) : (
              <IconMoon className="size-5" />
            )}
          </span>
          <div className="flex-1">
            <p className="text-[15px] font-medium">Dark mode</p>
            <p className="text-[13px] text-muted">
              {theme === "dark" ? "On" : "Off"}
            </p>
          </div>
          <Toggle
            on={theme === "dark"}
            onChange={toggle}
            label="Dark mode"
          />
        </div>

        {/* reminders */}
        <div className="mt-3 rounded-2xl bg-tile-soft px-5 py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-[15px] font-medium">Daily reminder</p>
              <p className="text-[13px] text-muted">
                {available
                  ? "Pending habits ki yaad dilayenge."
                  : "Log in karo tabhi reminder set kar paoge."}
              </p>
            </div>
            <Toggle
              on={reminder.enabled}
              disabled={!available || busy}
              onChange={(v) => void (v ? turnOn() : turnOff())}
              label="Daily reminder"
            />
          </div>

          {reminder.enabled ? (
            <div className="mt-4 flex items-center gap-3 border-t border-line pt-4">
              <label htmlFor="reminder-time" className="flex-1 text-[14px] text-muted">
                Time
              </label>
              <input
                id="reminder-time"
                type="time"
                value={reminder.time}
                onChange={(e) => setTime(e.target.value)}
                className="rounded-xl bg-tile px-3 py-2 text-[15px] tabular-nums outline-none ring-accent focus:ring-2"
              />
            </div>
          ) : null}

          {reminder.enabled ? (
            <p className="mt-3 text-[12px] text-faint">
              Timezone: {reminder.tz}
            </p>
          ) : null}

          {error ? (
            <p role="alert" className="mt-3 text-[13px] text-red-500">
              {error}
            </p>
          ) : null}

          {permission === "denied" ? (
            <p className="mt-3 text-[12px] text-faint">
              Browser ne notifications block kar rakhi hain — address bar ke lock
              icon se allow karo.
            </p>
          ) : null}
        </div>

        <p className="mt-5 text-[12px] leading-relaxed text-faint">
          iPhone pe notifications tabhi aayengi jab app home screen pe install ho
          (Share → Add to Home Screen). Browser tab me iOS web push nahi deta.
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-2xl bg-tile-soft px-4 py-3.5 text-[15px] font-medium transition-colors hover:bg-hover"
        >
          Done
        </button>
      </div>
    </div>
  );
}
