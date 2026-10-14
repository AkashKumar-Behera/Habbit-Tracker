"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";

function GoogleMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path
        fill="#4285F4"
        d="M45.1 24.5c0-1.6-.1-2.8-.4-4H24v7.3h12.1c-.2 2-1.6 5-4.5 7l-.1.3 6.5 5 .4.1c4.1-3.8 6.7-9.4 6.7-15.7Z"
      />
      <path
        fill="#34A853"
        d="M24 46c5.9 0 10.9-1.9 14.5-5.3l-6.9-5.3c-1.8 1.3-4.3 2.2-7.6 2.2-5.8 0-10.7-3.8-12.5-9l-.3.1-6.7 5.2-.1.3C7.9 41 15.4 46 24 46Z"
      />
      <path
        fill="#FBBC05"
        d="M11.5 28.6c-.5-1.4-.7-2.9-.7-4.6s.3-3.2.7-4.6v-.3l-6.8-5.3-.2.1A22 22 0 0 0 2 24c0 3.5.9 6.9 2.5 9.9l7-5.3Z"
      />
      <path
        fill="#EB4335"
        d="M24 9.5c4.1 0 6.9 1.8 8.5 3.3l6.2-6C34.9 3.4 29.9 1 24 1 15.4 1 7.9 6 4.5 13.2l7 5.3c1.8-5.2 6.7-9 12.5-9Z"
      />
    </svg>
  );
}

type Mode = "signin" | "signup";

export function AuthSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { signInGoogle, signInEmail, signUpEmail, continueAsGuest } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const dialog = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) setError(null);
  }, [open, mode]);

  if (!open) return null;

  const run = async (label: string, fn: () => Promise<void>) => {
    setBusy(label);
    setError(null);
    try {
      await fn();
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const submitEmail = (e: React.FormEvent) => {
    e.preventDefault();
    void run("email", () =>
      mode === "signin"
        ? signInEmail(email.trim(), password)
        : signUpEmail(email.trim(), password, name.trim()),
    );
  };

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
        aria-label={mode === "signin" ? "Log in" : "Create account"}
        className="relative w-full max-w-[420px] rounded-[28px] bg-card p-7 shadow-[0_20px_60px_rgba(0,0,0,0.2)]"
      >
        <h2 className="text-[20px] font-semibold tracking-tight">
          {mode === "signin" ? "Welcome back" : "Create your account"}
        </h2>
        <p className="mt-1 text-[13px] text-muted">
          Apni habits har device pe sync karo.
        </p>

        <button
          type="button"
          onClick={() => void run("google", signInGoogle)}
          disabled={busy !== null}
          className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl bg-tile-soft px-4 py-3.5 text-[15px] font-medium transition-colors hover:bg-hover disabled:opacity-50"
        >
          <GoogleMark className="size-5" />
          {busy === "google" ? "Opening…" : "Continue with Google"}
        </button>

        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-line" />
          <span className="text-[13px] text-muted">or</span>
          <span className="h-px flex-1 bg-line" />
        </div>

        <form onSubmit={submitEmail} className="flex flex-col gap-3">
          {mode === "signup" ? (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              autoComplete="name"
              aria-label="Name"
              className="rounded-2xl bg-tile-soft px-4 py-3.5 text-[15px] outline-none ring-accent placeholder:text-faint focus:ring-2"
            />
          ) : null}
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            placeholder="Email"
            autoComplete="email"
            aria-label="Email"
            className="rounded-2xl bg-tile-soft px-4 py-3.5 text-[15px] outline-none ring-accent placeholder:text-faint focus:ring-2"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            minLength={6}
            placeholder="Password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            aria-label="Password"
            className="rounded-2xl bg-tile-soft px-4 py-3.5 text-[15px] outline-none ring-accent placeholder:text-faint focus:ring-2"
          />

          {error ? (
            <p role="alert" className="text-[13px] text-red-500">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={busy !== null}
            className="rounded-2xl bg-accent px-4 py-3.5 text-[15px] font-medium text-white transition-opacity disabled:opacity-50"
          >
            {busy === "email"
              ? "Please wait…"
              : mode === "signin"
                ? "Log in"
                : "Sign up"}
          </button>
        </form>

        <div className="mt-5 flex items-center justify-between text-[13px]">
          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="text-muted underline-offset-2 hover:text-text hover:underline"
          >
            {mode === "signin" ? "Account nahi hai? Sign up" : "Pehle se account hai? Log in"}
          </button>
          <button
            type="button"
            onClick={() => void run("guest", continueAsGuest)}
            disabled={busy !== null}
            className="text-muted underline-offset-2 hover:text-text hover:underline disabled:opacity-50"
          >
            {busy === "guest" ? "…" : "Guest me chalao"}
          </button>
        </div>
      </div>
    </div>
  );
}
