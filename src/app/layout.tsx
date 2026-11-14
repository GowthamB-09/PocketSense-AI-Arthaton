import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PocketSense AI • Behavioral Money Coach for Indian College Students",
  description:
    "Zero-login, privacy-first AI behavioral money coach that intercepts frictionless UPI spending before it happens and remembers your student habits, goals, and triggers. Built for Arthaton 2026.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#09090B] text-foreground antialiased selection:bg-emerald-500/20 selection:text-emerald-300">
        {children}
      </body>
    </html>
  );
}

