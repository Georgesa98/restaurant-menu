import { Check } from 'lucide-react';

const points = [
  {
    title: 'هويتك',
    body: 'شعارك وألوانك وخطوطك على كل صفحة — الزبون بيعرف إنو عندك.',
  },
  {
    title: 'كل أصنافك بمكان واحد',
    body: 'أقسام وصور وأسعار واضحة، مع روابط مباشرة لكل قسم بتشاركها بالستوري.',
  },
  {
    title: 'الطلب بلا تطبيق',
    body: 'الزبون بيجمع طلبو وبيشوف المجموع لحالو — من المتصفح مباشرة.',
  },
  {
    title: 'بلغتين',
    body: 'عربي وإنجليزي بضغطة زر، والتبديل فوري بلا ما يضيع الزبون.',
  },
];

export function Showcase() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16">
      <p className="mb-2 text-center text-xs font-bold tracking-wide text-muted-foreground">صفحتك العامة</p>
      <h2
        className="mx-auto mb-4 max-w-2xl text-center text-3xl font-bold leading-snug sm:text-4xl"
        style={{ fontFamily: 'var(--font-arabic)' }}
      >
        موقع كامل باسم مطعمك، مو بس صورة
      </h2>
      <p className="mx-auto mb-10 max-w-xl text-center text-sm leading-relaxed text-muted-foreground sm:text-base">
        مو بس لوحة تحكم إلك — زباينك بيشوفوا موقع باسمك فيه كل شي بيحتاجوه ليطلبوا.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {points.map((p) => (
          <div key={p.title} className="flex gap-3 rounded-2xl border border-border bg-card p-5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Check className="size-4 text-primary" strokeWidth={2.5} />
            </span>
            <div>
              <h3 className="mb-1 font-bold" style={{ fontFamily: 'var(--font-arabic)' }}>
                {p.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{p.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
