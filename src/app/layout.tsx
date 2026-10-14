import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/lib/auth";
import { HabitProvider } from "@/lib/habits";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Ritualz",
  description: "Minimal habit tracker",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#efefef" },
    { media: "(prefers-color-scheme: dark)", color: "#121212" },
  ],
};

const themeScript = `
try {
  var s = localStorage.getItem('ritualz.theme');
  var t = (s === 'dark' || s === 'light') ? s
    : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.dataset.theme = t;
} catch (e) {}
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={inter.variable}>
        <ThemeProvider>
          <AuthProvider>
            <HabitProvider>{children}</HabitProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
