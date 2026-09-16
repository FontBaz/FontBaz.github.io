import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import type { Font, HeroSlide, Language } from "../../types";

import { useAppearance } from "../../context/appearance-context";
import { useFontCatalog, useFontExplore } from "../../context/font-context";
import { HERO_SLIDES } from "../../data/constants";
import { formatWeightsText } from "../../utils/fontUtils";
import { shuffleByKey } from "../../utils/shuffle";

const AUTOPLAY_DELAY = 6500;

function resolveSlideFontName(
  font: Font | undefined,
  slide: HeroSlide,
  lang: Language
): string {
  const rawName = font ? (font.name?.[lang] ?? slide.family) : slide.family;
  return lang === "fa" ? `فونت ${rawName}` : `${rawName} font`;
}

export default function HeroSlider() {
  const { lang } = useAppearance();
  const { fonts } = useFontCatalog();
  const { modal } = useFontExplore();

  const slides = useMemo(() => shuffleByKey(HERO_SLIDES, s => s.family), []);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "center",
      skipSnaps: false,
      dragFree: false,
      direction: "ltr",
    },
    [
      Autoplay({
        delay: AUTOPLAY_DELAY,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
      }),
    ]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <div
      className="relative mx-auto mt-8 w-full max-w-5xl overflow-hidden py-4 select-none"
      dir="ltr"
    >
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex touch-pan-y gap-4 md:gap-6">
          {slides.map((slide, index) => {
            const font = fonts.find(
              f => f.family.toLowerCase() === slide.family.toLowerCase()
            );
            const isActive = index === selectedIndex;
            const fontName = resolveSlideFontName(font, slide, lang);
            const weightsText = formatWeightsText(font, lang);
            const imageSrc = `${(import.meta.env.BASE_URL || "/").replace(/\/$/, "")}/images/slides/${slide.image}`;

            return (
              <div
                key={slide.family}
                className="min-w-0 flex-[0_0_280px] sm:flex-[0_0_480px] md:flex-[0_0_680px] lg:flex-[0_0_760px]"
              >
                <div
                  role="button"
                  tabIndex={0}
                  className={`relative h-40 w-full cursor-pointer overflow-hidden rounded-2xl bg-white transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] sm:h-56 md:h-64 dark:bg-black ${
                    isActive
                      ? "group scale-100 opacity-100"
                      : "scale-90 opacity-50"
                  }`}
                  onClick={() => {
                    if (isActive && font) {
                      modal.open(font);
                    } else {
                      emblaApi?.scrollTo(index);
                    }
                  }}
                  onKeyDown={e => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      if (isActive && font) modal.open(font);
                      else emblaApi?.scrollTo(index);
                    }
                  }}
                >
                  <img
                    className={`block h-full w-full object-cover transition-transform duration-300 dark:invert ${
                      isActive ? "group-hover:-translate-y-6" : ""
                    }`}
                    src={imageSrc}
                    alt={fontName}
                    loading="eager"
                    draggable={false}
                  />

                  <div
                    className={`pointer-events-none absolute inset-x-0 bottom-0 flex h-14 translate-y-full items-end justify-between bg-linear-to-t from-white via-white/95 to-transparent px-5 pb-3 opacity-0 transition-all duration-300 dark:from-black dark:via-black/95 ${
                      isActive
                        ? "group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100"
                        : ""
                    }`}
                    dir={lang === "fa" ? "rtl" : "ltr"}
                  >
                    <span className="text-strong font-fa truncate text-sm font-bold sm:text-base">
                      {fontName}
                    </span>
                    <span className="text-secondary font-fa truncate text-xs font-medium sm:text-sm">
                      {weightsText}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
