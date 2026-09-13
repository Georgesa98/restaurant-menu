import { ArrowLeft } from 'lucide-react';
import { WHATSAPP_LINK } from './config';

export function Hero() {
  return (
    <section className="mx-auto max-w-5xl px-4 pb-16 pt-14 text-center sm:pt-20">
      <p className="mx-auto mb-5 inline-block rounded-full border border-border bg-card px-4 py-1.5 text-xs font-bold text-muted-foreground">
        منيو إلكتروني للمطاعم والكافيهات
      </p>
      <h1
        className="mx-auto max-w-3xl text-4xl font-bold leading-[1.25] sm:text-6xl sm:leading-[1.2]"
        style={{ fontFamily: 'var(--font-arabic)' }}
      >
        خلص من طباعة المنيو… وخلّي زبونك يطلب من تلفونو
      </h1>
      <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
        صفحة منيو باسم مطعمك، بالعربي والإنجليزي، بتتحدث لحالا. الزبون بيمسح الـQR
        وبيشوف صور وأسعار محدثة — وانت بتعدل من تلفونك، بلا مطبعة وبلا انتظار.
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <a
          href="#how-it-works"
          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-bold transition-colors hover:bg-muted sm:w-auto"
        >
          شوف كيف بيشتغل
        </a>
        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noreferrer"
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 sm:w-auto"
        >
          احكينا واتساب
          <ArrowLeft className="size-4" />
        </a>
      </div>
      <p className="mt-10 text-xs font-bold tracking-wide text-muted-foreground">
        مصمم لـ مطاعم • كافيهات • حلويات • وجبات سريعة
      </p>
    </section>
  );
}
