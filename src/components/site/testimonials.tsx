import Image from "next/image";
import { Play, Star } from "lucide-react";
import { Photo } from "@/components/site/photo";
import { IMG, TESTIMONIALS, VIDEO_QUOTE } from "@/lib/content";

/**
 * Section « What our customer says » — carte vidéo à gauche,
 * deux témoignages empilés à droite.
 */
export function Testimonials() {
  return (
    <section className="shell pt-16 md:pt-24">
      <div className="flex justify-center">
        <span className="eyebrow">Témoignages</span>
      </div>

      <h2 className="section-title mt-6 text-center">
        Ce que disent nos étudiants
      </h2>
      <p className="mx-auto mt-3 max-w-[60ch] text-center text-[11.5px] text-ink-muted">
        Des profils camerounais, ivoiriens et sénégalais accompagnés jusqu&apos;à
        l&apos;admission — voici leurs retours.
      </p>

      <div className="mt-9 grid gap-4 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1fr)]">
        <Photo
          src={IMG.video}
          alt="Séance d'accompagnement Travis"
          scrim="tile"
          sizes="(max-width: 1024px) 100vw, 520px"
          className="min-h-[320px] rounded-panel lg:min-h-full"
        >
          <button
            type="button"
            aria-label="Lire la vidéo de présentation"
            className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/22 text-white backdrop-blur-md transition-colors hover:bg-white/32"
          >
            <Play className="ml-0.5 h-5 w-5 fill-white" strokeWidth={0} />
          </button>

          <div className="absolute inset-x-0 bottom-0 p-6">
            <p className="max-w-[26ch] text-[19px] font-semibold leading-[1.24] tracking-[-0.03em] text-white">
              {VIDEO_QUOTE.quote}
            </p>
            <p className="mt-4 text-[12px] font-medium text-white">
              {VIDEO_QUOTE.name}
            </p>
            <p className="text-[10.5px] text-white/70">{VIDEO_QUOTE.role}</p>
          </div>
        </Photo>

        <div className="grid gap-4">
          {TESTIMONIALS.map((item) => (
            <figure
              key={item.name}
              className="flex flex-col rounded-panel bg-white p-6 shadow-card"
            >
              <figcaption className="text-[14px] font-semibold tracking-[-0.02em]">
                {item.title}
              </figcaption>
              <blockquote className="mt-2.5 flex-1 text-[11.5px] leading-[1.65] text-ink-muted">
                {item.body}
              </blockquote>

              <div className="mt-5 flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="photo-fallback relative h-9 w-9 shrink-0 overflow-hidden rounded-full">
                    <Image
                      src={item.avatar}
                      alt=""
                      fill
                      sizes="36px"
                      className="object-cover"
                    />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[12px] font-medium">
                      {item.name}
                    </span>
                    <span className="block truncate text-[10.5px] text-ink-muted">
                      {item.role}
                    </span>
                  </span>
                </div>

                <div className="flex shrink-0 gap-0.5" aria-label="Note : 5 sur 5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-3.5 w-3.5 fill-star text-star"
                      strokeWidth={0}
                    />
                  ))}
                </div>
              </div>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
