import { Check, ArrowLeft } from 'lucide-react';
import { WHATSAPP_LINK } from './config';
import { cn } from '@/lib/utils';

const tiers = [
  {
    name: 'الأساسية',
    tagline: 'لتبلش تحط منيو مطعمك أونلاين',
    features: ['أقسام وأصناف غير محدودة', 'بالعربي والإنجليزي', 'رابط QR للطاولات', 'تعديل الأسعار لحالك'],
    highlight: false,
  },
  {
    name: 'المميزة',
    tagline: 'الأكتر طلباً للمطاعم الجدية',
    features: [
      'كل شي بالأساسية',
      'صور لكل صنف',
      'دومين خاص باسم مطعمك',
      'ثيم على هويتك وألوانك',
      'روابط مباشرة لكل قسم',
    ],
    highlight: true,
  },
  {
    name: 'الاحترافية',
    tagline: 'للسلاسل والمحلات الكبيرة',
    features: ['كل شي بالمميزة', 'شاشة تابلت للصالة', 'أصناف وأحجام متغيرة', 'أولوية بالدعم والتعديلات'],
    highlight: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-5xl px-4 py-16">
      <p className="mb-2 text-center text-xs font-bold tracking-wide text-muted-foreground">الأسعار</p>
      <h2
        className="mx-auto mb-4 max-w-2xl text-center text-3xl font-bold leading-snug sm:text-4xl"
        style={{ fontFamily: 'var(--font-arabic)' }}
      >
        باقة لكل مطعم
      </h2>
      <p className="mx-auto mb-10 max-w-xl text-center text-sm leading-relaxed text-muted-foreground sm:text-base">
        احكينا واتساب ومنلاقي الباقة المناسبة إلك — الأسعار حسب احتياج مطعمك.
      </p>
      <div className="grid gap-4 lg:grid-cols-3">
        {tiers.map((t) => (
          <div
            key={t.name}
            className={cn(
              'flex flex-col rounded-2xl border bg-card p-6',
              t.highlight ? 'border-primary shadow-lg' : 'border-border'
            )}
          >
            <h3 className="text-xl font-bold" style={{ fontFamily: 'var(--font-arabic)' }}>
              {t.name}
            </h3>
            <p className="mb-5 mt-1 text-xs text-muted-foreground">{t.tagline}</p>
            <ul className="mb-6 flex-1 space-y-2.5">
              {t.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={2.5} />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noreferrer"
              className={cn(
                'inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-opacity hover:opacity-90',
                t.highlight
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border hover:bg-muted'
              )}
            >
              اطلبها واتساب
              <ArrowLeft className="size-4" />
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
