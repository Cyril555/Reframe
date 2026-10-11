import type { Metadata } from "next";
import { Instrument_Serif, Inter, JetBrains_Mono } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

const display = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-display" });
const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Reframe",
  description:
    "A multi-agent system that measures when an AI clinical assistant bends to a doctor's pressure, and gets a blind second opinion that cannot be pressured.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        <SiteHeader />
        {children}
        <footer className="border-t border-line mt-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 text-sm text-muted flex flex-col sm:flex-row gap-2 sm:justify-between">
            <span>Reframe · research demonstration, not for clinical use.</span>
            <span>Every agent output on this site is a recorded, unedited model response.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
