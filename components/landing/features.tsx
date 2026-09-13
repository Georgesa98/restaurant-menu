import { Globe, Languages, Camera, Zap, QrCode, TabletSmartphone } from 'lucide-react';

const features = [
  {
    icon: QrCode,
    title: 'منيو باسمك ودومينك',
    body: 'رابط ودومين خاص بمطعمك بتحطو بالستوري وعلى الطاولات. لا تطبيقات ولا حسابات للزبون.',
  },
  {
    icon: Languages,
    title: 'عربي وإنجليزي',
    body: 'زر تبديل لحظي بين اللغتين، واتجاه RTL مظبوط للعربي — كل صنف باسمه ووصفو باللغتين.',
  },
  {
    icon: Camera,
    title: 'صورة لكل صنف',
    body: 'بطاقات مصورة بأسعار واضحة، مع أحجام وأصناف متغيرة لكل صنف — متل المنيو الورقي بس أحلى.',
  },
  {
    icon: Zap,
    title: 'تعديل لحظي',
    body: 'غيّر سعر أو صنف من لوحة التحكم وبيظهر فوراً عند الزباين. بلا طباعة، بلا انتظار، بلا «السعر قديم».',
  },
  {
    icon: Globe,
    title: 'ثيم على هويتك',
    body: 'ألوانك وشعارك وخطوطك على كل صفحة. كل مطعم إلو شخصيتو الخاصة.',
  },
  {
    icon: TabletSmartphone,
    title: 'شغال عالتابلت والكاشير',
    body: 'نفس المنيو بيشتغل على تابلت المحل وبيتزامن — للعرض جوا الصالة وللكاشير.',
  },
];

export function Features() {
  return (
    <section id="features" className="border-t border-border bg-card/50">
      <div className="mx-auto max-w-5xl px-4 py-16">
        <p className="mb-2 text-center text-xs font-bold tracking-wide text-muted-foreground">المميزات</p>
        <h2
          className="mx-auto mb-10 max-w-2xl text-center text-3xl font-bold leading-snug sm:text-4xl"
          style={{ fontFamily: 'var(--font-arabic)' }}
        >
          كل شي لازمك لتبيع أكتر
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-card p-6">
              <f.icon className="mb-4 size-7 text-primary" strokeWidth={1.8} />
              <h3 className="mb-2 text-lg font-bold" style={{ fontFamily: 'var(--font-arabic)' }}>
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
