import type { ReactNode, RefObject } from "react";

import { useEffect, useRef, useState } from "react";

import type { Font } from "../../types";

import { useAppearance } from "../../context/appearance-context";
import { useFontCatalog, useFontExplore } from "../../context/font-context";
import { DEFAULT_SPECIMEN, T } from "../../data/constants";
import {
  ensureFontLoaded,
  familyCSS,
  formatWeightsText,
  hasActiveKeys,
  isFontReady,
  resolvePreviewSize,
} from "../../utils/fontUtils";

/** Start loading a card's font this many pixels before it scrolls into view. */
const FONT_LOAD_AHEAD_PX = 300;

function useLazyFontLoad(font: Font): {
  loaded: boolean;
  loadError: boolean;
  cardRef: RefObject<HTMLDivElement | null>;
} {
  const [loaded, setLoaded] = useState<boolean>(() => isFontReady(font));
  const [loadError, setLoadError] = useState<boolean>(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loaded) return;

    let observer: IntersectionObserver | undefined;
    const el = cardRef.current;

    const load = () => {
      void ensureFontLoaded(font, 400).then(ok => {
        if (ok) setLoaded(true);
        else setLoadError(true);
      });
    };

    if (el && "IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              observer?.unobserve(el);
              load();
            }
          });
        },
        { rootMargin: `${FONT_LOAD_AHEAD_PX}px` }
      );
      observer.observe(el);
    } else {
      load();
    }

    return () => {
      if (observer && el) observer.unobserve(el);
    };
  }, [font, loaded]);

  return { loaded, loadError, cardRef };
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="bg-surface text-secondary cursor-default rounded-full px-2.5 py-0.5 text-xs font-medium select-none">
      {children}
    </span>
  );
}

type PinButtonProps = {
  isPinned: boolean;
  title: string;
  onToggle: () => void;
};

function PinButton({ isPinned, title, onToggle }: PinButtonProps) {
  return (
    <button
      className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-full transition-colors select-none ${
        isPinned
          ? "bg-primary text-surface"
          : "bg-surface text-secondary hover:text-primary hover:bg-tertiary/20"
      }`}
      type="button"
      title={title}
      onClick={e => {
        e.stopPropagation();
        e.preventDefault();
        onToggle();

        const currY = window.scrollY;
        requestAnimationFrame(() => {
          window.scrollTo({
            top: currY,
            behavior: "instant",
          });
        });
      }}
    >
      <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M17.1218 1.87023C15.7573 0.505682 13.4779 0.76575 12.4558 2.40261L9.61062 6.95916C9.61033 6.95965 9.60913 6.96167 9.6038 6.96549C9.59728 6.97016 9.58336 6.97822 9.56001 6.9848C9.50899 6.99916 9.44234 6.99805 9.38281 6.97599C8.41173 6.61599 6.74483 6.22052 5.01389 6.87251C4.08132 7.22378 3.61596 8.03222 3.56525 8.85243C3.51687 9.63502 3.83293 10.4395 4.41425 11.0208L7.94975 14.5563L1.26973 21.2363C0.879206 21.6269 0.879206 22.26 1.26973 22.6506C1.66025 23.0411 2.29342 23.0411 2.68394 22.6506L9.36397 15.9705L12.8995 19.5061C13.4808 20.0874 14.2853 20.4035 15.0679 20.3551C15.8881 20.3044 16.6966 19.839 17.0478 18.9065C17.6998 17.1755 17.3043 15.5086 16.9444 14.5375C16.9223 14.478 16.9212 14.4114 16.9355 14.3603C16.9421 14.337 16.9502 14.3231 16.9549 14.3165C16.9587 14.3112 16.9606 14.31 16.9611 14.3098L21.5177 11.4645C23.1546 10.4424 23.4147 8.16307 22.0501 6.79853L17.1218 1.87023ZM14.1523 3.46191C14.493 2.91629 15.2528 2.8296 15.7076 3.28445L20.6359 8.21274C21.0907 8.66759 21.0041 9.42737 20.4584 9.76806L15.9019 12.6133C14.9572 13.2032 14.7469 14.3637 15.0691 15.2327C15.3549 16.0037 15.5829 17.1217 15.1762 18.2015C15.1484 18.2752 15.1175 18.3018 15.0985 18.3149C15.0743 18.3316 15.0266 18.3538 14.9445 18.3589C14.767 18.3699 14.5135 18.2916 14.3137 18.0919L5.82846 9.6066C5.62872 9.40686 5.55046 9.15333 5.56144 8.97583C5.56651 8.8937 5.58877 8.84605 5.60548 8.82181C5.61855 8.80285 5.64516 8.7719 5.71886 8.74414C6.79869 8.33741 7.91661 8.56545 8.68762 8.85128C9.55668 9.17345 10.7171 8.96318 11.3071 8.01845L14.1523 3.46191Z"
        />
      </svg>
    </button>
  );
}

export default function FontCard({ font }: { font: Font }) {
  const { lang } = useAppearance();
  const t = T[lang];
  const { meta } = useFontCatalog();
  const { preview, filters, pinned, modal } = useFontExplore();

  const { loaded, loadError, cardRef } = useLazyFontLoad(font);

  const effSize = resolvePreviewSize(preview.size, 16);
  const isPinned = pinned.has(font.family);
  const fontName = font.name?.[lang];
  const styleLabel = font.styleKey ? meta.styleLabels[font.styleKey][lang] : "";
  const displayText = preview.text.trim() ? preview.text : DEFAULT_SPECIMEN;
  const formattedWeights = formatWeightsText(font, lang);
  const showLicense = hasActiveKeys(filters.licenses) && Boolean(font.license);

  const openModal = () => modal.open(font);

  return (
    <div
      ref={cardRef}
      className={`group border-border relative cursor-pointer overflow-hidden border-b px-4 py-3 transition-colors duration-200 sm:px-6 sm:py-4 ${
        isPinned
          ? "font-card-pinned bg-card-bg hover:bg-surface-deep"
          : "hover:bg-surface-deep bg-transparent"
      }`}
      tabIndex={0}
      role="button"
      onClick={openModal}
      onKeyDown={e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openModal();
        }
      }}
    >
      <div className="relative z-10 mb-2 flex items-center justify-between gap-3 select-none">
        <div className="min-w-0 flex-1">
          <h3
            className={`text-strong font-fa inline-block max-w-full truncate text-lg font-bold transition-colors duration-200 select-none ${
              isPinned
                ? "bg-card-bg group-hover:bg-surface-deep"
                : "bg-surface group-hover:bg-surface-deep"
            }`}
          >
            {fontName}
          </h3>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-1.5 select-none">
          <Badge>{styleLabel}</Badge>
          <Badge>{formattedWeights}</Badge>

          {showLicense && <Badge>{font.license}</Badge>}

          <PinButton
            isPinned={isPinned}
            title={isPinned ? t.unpinFont : t.pinFont}
            onToggle={() => pinned.toggle(font.family)}
          />
        </div>
      </div>

      <div
        className={`text-strong fade-end-mask -mt-9 -mb-8 w-full cursor-pointer overflow-visible pt-10 pb-10 whitespace-nowrap select-none ${
          !loaded && !loadError ? "not-loaded" : ""
        }`}
        style={{
          fontFamily: familyCSS(font),
          fontSize: `${effSize}px`,
          fontWeight: 400,
          lineHeight: 1.35,
        }}
      >
        {displayText}
      </div>
    </div>
  );
}
