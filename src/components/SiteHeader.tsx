import Link from "next/link";

const links = [
  { href: "/case/aortic-dissection", label: "Demo" },
  { href: "/architecture", label: "Architecture" },
  { href: "/method", label: "Method" },
  { href: "https://github.com/Cyril555/Reframe", label: "GitHub" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 h-14 flex items-center justify-between">
        <Link href="/" className="font-mono text-[13px] font-medium uppercase tracking-[0.2em]">
          Reframe
        </Link>
        <nav className="flex items-center gap-6 sm:gap-8 text-[13px] text-muted">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={`hover:text-ink transition-colors ${l.label === "GitHub" ? "hidden sm:inline" : ""}`}>
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
