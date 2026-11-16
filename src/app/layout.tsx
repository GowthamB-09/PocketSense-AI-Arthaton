import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PocketSense PRO • Behavioral Money Coach for Young Professionals (24–30)",
  description:
    "Zero-login, privacy-first AI behavioral money coach that intercepts frictionless UPI spending and lifestyle creep before it happens. Built for young professionals (24–30).",
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

