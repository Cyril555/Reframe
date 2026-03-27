"use client";
import Link from "next/link";

export function Header({ scenarioTitle }: { scenarioTitle?: string }) {
  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center px-6 justify-between sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex flex-col leading-tight">
          <span className="text-base font-bold text-slate-900">
            <span className="text-blue-600">Re</span>frame.ai
          </span>
          <span className="text-xs text-slate-400">AI Sycophancy Transparency for Clinicians</span>
        </Link>
        {scenarioTitle && (
          <>
            <span className="text-slate-300">|</span>
            <span className="text-sm text-slate-600">{scenarioTitle}</span>
          </>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
          Claude X LSE Hackathon 2026
        </span>
        <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
          DEMO
        </span>
      </div>
    </header>
  );
}
