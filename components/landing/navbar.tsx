import { WHATSAPP_LINK } from './config';

const links = [
  { href: '#features', label: 'المميزات' },
  { href: '#how-it-works', label: 'كيف بيشتغل' },
  { href: '#pricing', label: 'الأسعار' },
  { href: '#contact', label: 'تواصل معنا' },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <a href="#" className="text-lg font-bold" style={{ fontFamily: 'var(--font-arabic)' }}>
          نظام المنيو
        </a>
        <nav className="hidden items-center gap-6 text-sm md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-foreground/70 transition-colors hover:text-foreground">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
          >
            احكينا واتساب
          </a>
          <details className="relative md:hidden">
            <summary className="cursor-pointer list-none rounded-lg border border-border px-3 py-2 text-sm [&::-webkit-details-marker]:hidden">
              القائمة
            </summary>
            <nav className="absolute left-0 top-12 flex w-44 flex-col gap-1 rounded-xl border border-border bg-card p-2 shadow-lg">
              {links.map((l) => (
                <a key={l.href} href={l.href} className="rounded-lg px-3 py-2 text-sm hover:bg-muted">
                  {l.label}
                </a>
              ))}
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
