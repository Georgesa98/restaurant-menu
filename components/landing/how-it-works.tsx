const guestSteps = [
  { title: 'بيمسح الـQR', body: 'من الطاولة أو الستوري: بيفتح المنيو بالمتصفح، بلا تطبيق وبلا حساب.' },
  { title: 'بيتصفح بلغتو', body: 'عربي أو إنجليزي، صور وأسعار واضحة لكل صنف.' },
  { title: 'بيجمع طلبو لحالو', body: 'بيختار الكميات والأصناف وبيشوف المجموع قبل ما ينادي النادل.' },
];

const ownerSteps = [
  { title: 'بتحكينا واتساب', body: 'بتبعتلنا أصنافك وأسعارك وصورك — ومنجهزلك كل شي.' },
  { title: 'منبني منيو مطعمك', body: 'أقسام وأصناف وترجمات وثيم على هويتك، ودومينك الخاص.' },
  { title: 'بتعدل لحالك', body: 'من لوحة التحكم: أسعار وأصناف وصور — والتحديث فوري عند الزباين.' },
];

function Steps({ steps }: { steps: { title: string; body: string }[] }) {
  return (
    <ol className="space-y-4">
      {steps.map((s, i) => (
        <li key={s.title} className="flex gap-4 rounded-2xl border border-border bg-card p-5">
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-base font-bold text-primary-foreground"
            style={{ fontFamily: 'var(--font-arabic)' }}
          >
            {i + 1}
          </span>
          <div>
            <h3 className="mb-1 font-bold" style={{ fontFamily: 'var(--font-arabic)' }}>
              {s.title}
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{s.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-border bg-card/50">
      <div className="mx-auto max-w-5xl px-4 py-16">
        <p className="mb-2 text-center text-xs font-bold tracking-wide text-muted-foreground">كيف بيشتغل</p>
        <h2
          className="mx-auto mb-10 max-w-2xl text-center text-3xl font-bold leading-snug sm:text-4xl"
          style={{ fontFamily: 'var(--font-arabic)' }}
        >
          نظام كامل، مو بس صفحة منيو
        </h2>
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h3 className="mb-4 text-center font-bold text-muted-foreground">جهة الزبون</h3>
            <Steps steps={guestSteps} />
          </div>
          <div>
            <h3 className="mb-4 text-center font-bold text-muted-foreground">جهتك</h3>
            <Steps steps={ownerSteps} />
          </div>
        </div>
      </div>
    </section>
  );
}
