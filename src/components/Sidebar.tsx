"use client";

import { useState } from "react";
import { AuthSheet } from "@/components/AuthSheet";
import { SettingsSheet } from "@/components/SettingsSheet";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/lib/auth";
import {
  IconChart,
  IconChevron,
  IconFlame,
  IconHome,
  IconLogin,
  IconMoon,
  IconSettings,
  IconSun,
  IconUser,
} from "@/lib/icons";

type Item = {
  label: string;
  icon: (p: { className?: string }) => React.ReactNode;
  active?: boolean;
  chevron?: boolean;
  onClick?: () => void;
};

function Row({ item }: { item: Item }) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={item.onClick}
      aria-current={item.active ? "page" : undefined}
      className={`flex w-full items-center gap-4 rounded-2xl px-4 py-4 text-left transition-colors ${
        item.active ? "bg-tile" : "bg-tile-soft hover:bg-hover"
      }`}
    >
      <span className="flex size-8 items-center justify-center rounded-xl">
        <Icon className="size-5 text-text" />
      </span>
      <span className="flex-1 truncate text-[15px] font-medium">{item.label}</span>
      {item.chevron ? <IconChevron className="size-4 text-faint" /> : null}
    </button>
  );
}

export function Sidebar() {
  const { theme, toggle } = useTheme();
  const { user, isGuest, logOut, enabled } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const signedIn = Boolean(user) && !isGuest;
  const displayName =
    user?.displayName ?? user?.email?.split("@")[0] ?? "Guest";

  return (
    <>
      <div className="flex h-full flex-col px-4 pb-4 pt-6">
        <div className="flex flex-1 items-center justify-center">
          <div className="relative flex size-44 items-center justify-center">
            <div
              aria-hidden
              className="absolute inset-0 rounded-full blur-2xl"
              style={{
                background:
                  "radial-gradient(circle, rgba(255,138,31,0.55) 0%, rgba(255,138,31,0.12) 55%, transparent 72%)",
              }}
            />
            <IconFlame className="relative size-12 text-flame" />
          </div>
        </div>

        <div className="mb-4 h-px bg-line" />

        <nav className="flex flex-col gap-2">
          <Row item={{ label: "Home", icon: IconHome, active: true }} />
          <Row
            item={{
              label: signedIn ? displayName : "Profile",
              icon: IconUser,
              chevron: true,
              onClick: signedIn ? undefined : () => setAuthOpen(true),
            }}
          />
          <Row item={{ label: "Leaderboard", icon: IconChart, chevron: true }} />
          <Row
            item={{
              label: "Settings",
              icon: IconSettings,
              chevron: true,
              onClick: () => setSettingsOpen(true),
            }}
          />
        </nav>

        <div className="mt-auto flex flex-col gap-2 pt-8">
          <button
            type="button"
            onClick={toggle}
            aria-label={
              theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
            }
            className="flex w-full items-center gap-4 rounded-2xl bg-tile-soft px-4 py-4 text-left transition-colors hover:bg-hover"
          >
            <span className="flex size-8 items-center justify-center rounded-xl">
              {theme === "dark" ? (
                <IconSun className="size-5" />
              ) : (
                <IconMoon className="size-5" />
              )}
            </span>
            <span className="flex-1 text-[15px] font-medium">
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </span>
          </button>

          <Row
            item={{
              label: signedIn ? "Log out" : isGuest ? "Save your progress" : "Log in",
              icon: IconLogin,
              chevron: true,
              onClick: signedIn
                ? () => void logOut()
                : enabled
                  ? () => setAuthOpen(true)
                  : undefined,
            }}
          />
        </div>
      </div>

      <AuthSheet open={authOpen} onClose={() => setAuthOpen(false)} />
      <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
