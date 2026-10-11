import type { Metadata } from "next";
import { Inter_Tight, JetBrains_Mono } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

const sans = Inter_Tight({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Reframe",
  description:
    "A multi-agent system that measures when an AI clinical assistant bends to a doctor's pressure, and gets a blind second opinion that cannot be pressured.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        <SiteHeader />
        {children}
        <footer className="border-t border-line">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 py-10 flex flex-col sm:flex-row gap-3 sm:justify-between text-xs text-muted">
            <span className="font-mono uppercase tracking-[0.14em]">Reframe</span>
            <span>Research demonstration. Not for clinical use. Every agent message is a recorded, unedited model response.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
