"use client";

import { useRef, useState, type ReactNode } from "react";
import { IconArrowRight, IconCheck } from "@/lib/icons";

/**
 * A row you slide to the right to confirm — the gesture Ritualz uses for both
 * "add habit" and "mark done". Click and keyboard also fire `onConfirm`, so the
 * gesture is never the only way through.
 */
export function SlideRow({
  children,
  onConfirm,
  done = false,
  trailing,
  label,
}: {
  children: ReactNode;
  onConfirm: () => void;
  done?: boolean;
  trailing?: ReactNode;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const start = useRef(0);
  const moved = useRef(false);

  const width = () => ref.current?.offsetWidth ?? 240;
  const threshold = () => width() * 0.55;

  const onDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("[data-no-drag]")) return;
    start.current = e.clientX;
    moved.current = false;
    setDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const delta = e.clientX - start.current;
    if (Math.abs(delta) > 4) moved.current = true;
    setDx(Math.max(0, Math.min(delta, width() - 56)));
  };

  const onUp = () => {
    if (!dragging) return;
    setDragging(false);
    if (dx > threshold()) onConfirm();
    else if (!moved.current) onConfirm();
    setDx(0);
  };

  const progress = Math.min(dx / threshold(), 1);

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      aria-label={label}
      aria-pressed={done}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onConfirm();
        }
      }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      className={`relative select-none overflow-hidden rounded-2xl outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent ${
        done ? "bg-accent-soft" : "bg-tile-soft"
      }`}
      style={{ touchAction: "pan-y" }}
    >
      <div
        aria-hidden
        className="absolute inset-y-0 left-0 bg-accent/25 transition-opacity"
        style={{ width: dx + 56, opacity: progress }}
      />

      <div
        className={`relative flex items-center gap-4 py-3 pl-3 ${trailing ? "pr-12" : "pr-3"}`}
        style={{
          transform: `translateX(${dx}px)`,
          transition: dragging ? "none" : "transform 260ms cubic-bezier(.2,.8,.2,1)",
        }}
      >
        {children}
        <span className="ml-auto flex items-center gap-1 pr-1">
          {done ? (
            <IconCheck className="size-5 text-accent" />
          ) : (
            <IconArrowRight
              className="size-5 text-faint transition-colors"
              style={progress > 0.6 ? { color: "var(--accent)" } : undefined}
            />
          )}
        </span>
      </div>

      {trailing ? (
        <div data-no-drag className="absolute inset-y-0 right-0 flex items-center pr-2">
          {trailing}
        </div>
      ) : null}
    </div>
  );
}
