const faqs = [
  {
    q: 'بحتاج الزبون ينزّل تطبيق؟',
    a: 'لا أبداً. المنيو صفحة ويب بتنفتح بالمتصفح — مسح QR وخلصت.',
  },
  {
    q: 'كيف بعدّل الأسعار والأصناف؟',
    a: 'من لوحة تحكم خاصة فيك: بتضيف وبتعدل وبتخفي أصناف، والتحديث بيظهر فوراً عند الزباين.',
  },
  {
    q: 'فيني دومين خاص باسم مطعمي؟',
    a: 'أي، دومينك الخاص بيفتح منيو مطعمك مباشرة — مثلاً مطعمك.com بيودي عالمنيو دغري.',
  },
  {
    q: 'المنيو بالعربي؟',
    a: 'عربي وإنجليزي، والزبون بيبدل بيناتن بضغطة زر. العربي باتجاه RTL مظبوط.',
  },
  {
    q: 'شو بيصير إذا بدي غيّر شي كبير بالمنيو؟',
    a: 'احكينا واتساب ومنساعدك — التعديلات اليومية عليك، والتغييرات الكبيرة علينا.',
  },
  {
    q: 'قديش التكلفة؟',
    a: 'حسب الباقة اللي بتناسبك. ابعتلنا واتساب ومنعطيك سعر واضح بلا مفاجآت.',
  },
];

export function Faq() {
  return (
    <section id="faq" className="border-t border-border bg-card/50">
      <div className="mx-auto max-w-3xl px-4 py-16">
        <p className="mb-2 text-center text-xs font-bold tracking-wide text-muted-foreground">
          أسئلة شائعة
        </p>
        <h2
          className="mx-auto mb-10 max-w-2xl text-center text-3xl font-bold leading-snug sm:text-4xl"
          style={{ fontFamily: 'var(--font-arabic)' }}
        >
          عندك سؤال؟ عنا جواب
        </h2>
        <div className="space-y-3">
          {faqs.map((f) => (
            <details key={f.q} className="group rounded-2xl border border-border bg-card px-5 py-4">
              <summary className="cursor-pointer list-none font-bold [&::-webkit-details-marker]:hidden">
                {f.q}
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
