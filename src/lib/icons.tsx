import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const IconHome = (p: P) => (
  <svg {...base} {...p}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5.5 9.5V20h13V9.5" />
  </svg>
);

export const IconUser = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M4.5 20c.9-3.8 3.9-5.5 7.5-5.5s6.6 1.7 7.5 5.5" />
  </svg>
);

export const IconChart = (p: P) => (
  <svg {...base} {...p}>
    <path d="M5 20V12" />
    <path d="M12 20V5" />
    <path d="M19 20v-5" />
  </svg>
);

export const IconSettings = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 14.5a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3h.1a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8v.1a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z" />
  </svg>
);

export const IconLogin = (p: P) => (
  <svg {...base} {...p}>
    <path d="M14 3h4.5A1.5 1.5 0 0 1 20 4.5v15a1.5 1.5 0 0 1-1.5 1.5H14" />
    <path d="M10 8l4 4-4 4" />
    <path d="M14 12H4" />
  </svg>
);

export const IconChevron = (p: P) => (
  <svg {...base} {...p}>
    <path d="m9 5 7 7-7 7" />
  </svg>
);

export const IconArrowRight = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4 12h15" />
    <path d="m13 6 6 6-6 6" />
  </svg>
);

export const IconArrowLeft = (p: P) => (
  <svg {...base} {...p}>
    <path d="M20 12H5" />
    <path d="m11 6-6 6 6 6" />
  </svg>
);

export const IconPlus = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </svg>
);

export const IconMenu = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4 7h16" />
    <path d="M4 12h16" />
    <path d="M4 17h16" />
  </svg>
);

export const IconGrid = (p: P) => (
  <svg {...base} {...p}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="2.5" />
    <path d="M3.5 9.5h17" />
    <path d="M9.5 9.5v11" />
  </svg>
);

export const IconDots = (p: P) => (
  <svg {...base} {...p} strokeWidth={2.2}>
    <path d="M12 5.5v.01" />
    <path d="M12 12v.01" />
    <path d="M12 18.5v.01" />
  </svg>
);

export const IconTrash = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4 7h16" />
    <path d="M9 7V5h6v2" />
    <path d="M6.5 7l.8 13h9.4l.8-13" />
  </svg>
);

export const IconCheck = (p: P) => (
  <svg {...base} {...p} strokeWidth={2.4}>
    <path d="m5 12.5 4.5 4.5L19 7" />
  </svg>
);

export const IconSun = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);

export const IconMoon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
  </svg>
);

/* ---- habit icons ---- */

export const IconBook = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H10a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2H5.5A1.5 1.5 0 0 1 4 15.5Z" />
    <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H14a2 2 0 0 0-2 2v13a2 2 0 0 1 2-2h4.5a1.5 1.5 0 0 0 1.5-1.5Z" />
  </svg>
);

export const IconPencil = (p: P) => (
  <svg {...base} {...p}>
    <path d="M16.5 3.9a2 2 0 0 1 2.8 2.8L8 18l-4 1.2L5.2 15Z" />
  </svg>
);

export const IconRun = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="14.5" cy="4.5" r="1.8" />
    <path d="M12.8 9.2 9.5 11l1.7 3.2L9 21" />
    <path d="M12.9 14.2 16 17l1 4" />
    <path d="M12.8 9.2 16 8l2.5 3H21" />
    <path d="M9.5 11 6 10" />
  </svg>
);

export const IconDumbbell = (p: P) => (
  <svg {...base} {...p}>
    <path d="m3 15 1.5-1.5M21 9l-1.5 1.5" />
    <path d="m5.5 16.5-2-2 3-3 2 2Z" />
    <path d="m18.5 7.5 2 2-3 3-2-2Z" />
    <path d="m8.5 13.5 5-5" />
    <path d="m10.5 15.5 5-5" />
  </svg>
);

export const IconDrop = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 3.5s6 6.2 6 10a6 6 0 0 1-12 0c0-3.8 6-10 6-10Z" />
  </svg>
);

export const IconMoonHabit = IconMoon;

export const IconFlame = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M12.9 2c.3 2.6-.7 4-1.9 5.3-1.2 1.3-2.6 2.5-2.6 4.9 0 1 .3 1.8.8 2.4-1.6-.3-2.8-1.6-3.1-3.3C5.4 12.6 5 14 5 15.3 5 19 8.1 22 12 22s7-3 7-6.7c0-5-3.4-7.2-6.1-13.3Z" />
  </svg>
);
