import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PocketSense PRO • Behavioral Money Coach for Young Professionals (24–40)",
  description:
    "Zero-login, privacy-first AI behavioral money coach that intercepts frictionless UPI spending and lifestyle creep before it happens. Built for young professionals (24–40).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-emerald-100 selection:text-emerald-900">
        {children}
      </body>
    </html>
  );
}
