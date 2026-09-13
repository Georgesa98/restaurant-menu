import { MessageCircle, Phone, Mail } from 'lucide-react';
import { WHATSAPP_LINK, PHONE_LINK, EMAIL_LINK } from './config';

const channels = [
  { icon: MessageCircle, label: 'واتساب', href: WHATSAPP_LINK, external: true },
  { icon: Phone, label: 'اتصال', href: PHONE_LINK, external: false },
  { icon: Mail, label: 'بريد إلكتروني', href: EMAIL_LINK, external: false },
];

export function Contact() {
  return (
    <section id="contact" className="mx-auto max-w-3xl px-4 py-16 text-center">
      <p className="mb-2 text-xs font-bold tracking-wide text-muted-foreground">تواصل معنا</p>
      <h2
        className="mx-auto mb-4 max-w-xl text-3xl font-bold leading-snug sm:text-4xl"
        style={{ fontFamily: 'var(--font-arabic)' }}
      >
        خلّينا نحكي
      </h2>
      <p className="mx-auto mb-8 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
        واتساب، اتصال، إيميل — اختار اللي بريّحك.
      </p>
      <div className="flex flex-col justify-center gap-3 sm:flex-row">
        {channels.map((c) => (
          <a
            key={c.label}
            href={c.href}
            {...(c.external ? { target: '_blank', rel: 'noreferrer' } : {})}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-bold transition-colors hover:bg-muted"
          >
            <c.icon className="size-4" />
            {c.label}
          </a>
        ))}
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-5xl px-4 py-10 text-center">
        <p className="font-bold" style={{ fontFamily: 'var(--font-arabic)' }}>
          نظام المنيو
        </p>
        <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-muted-foreground">
          منيو إلكتروني معمول للمطاعم والكافيهات.
        </p>
        <p className="mt-6 text-xs text-muted-foreground">© 2026 نظام المنيو — جميع الحقوق محفوظة.</p>
        <p className="mt-1 text-xs text-muted-foreground">صُنع ويُدار بواسطة جورج صليبي</p>
      </div>
    </footer>
  );
}
