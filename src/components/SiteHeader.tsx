import Link from "next/link";

const links = [
  { href: "/#cases", label: "Cases" },
  { href: "/architecture", label: "Architecture" },
  { href: "/method", label: "Method" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/85 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="font-display text-2xl tracking-tight">
          Reframe
        </Link>
        <nav className="flex items-center gap-5 text-sm text-muted">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-ink transition-colors">
              {l.label}
            </Link>
          ))}
          <a
            href="https://github.com/Cyril555/Reframe"
            className="hidden sm:inline hover:text-ink transition-colors"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}
