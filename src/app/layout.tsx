import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reframe.ai — AI Sycophancy Transparency for Clinicians",
  description: "See when AI agrees with you — and when it shouldn't.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
