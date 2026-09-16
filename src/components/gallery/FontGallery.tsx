import type { Dispatch, ReactNode, RefObject, SetStateAction } from "react";

import { useEffect, useMemo, useRef, useState } from "react";

import type { Font, FontFilters } from "../../types";

import { useAppearance } from "../../context/appearance-context";
import { useFontCatalog, useFontExplore } from "../../context/font-context";
import { T } from "../../data/constants";
import {
  activeKeys,
  isVariable,
  normalizePersian,
} from "../../utils/fontUtils";
import FontCard from "./FontCard";

const BATCH_SIZE = 20;
/** How many pixels before the viewport bottom the next batch starts loading. */
const SCROLL_AHEAD_PX = 400;
/** Variable fonts are treated as having this many weights for the "N+ weights" filter. */
const VARIABLE_WEIGHT_COUNT = 10;

function matchesQuery(font: Font, query: string): boolean {
  if (!query.trim()) return true;

  const normalizedQuery = normalizePersian(query);
  const fontSearchString = normalizePersian(
    `${font.name?.en ?? ""} ${font.name?.fa ?? ""} ${font.family}`
  );

  return fontSearchString.includes(normalizedQuery);
}

function matchesLicense(
  font: Font,
  licenses: Record<string, boolean>
): boolean {
  const activeLicenses = activeKeys(licenses);
  if (!activeLicenses.length) return true;

  return activeLicenses.includes(font.license ?? "");
}

function matchesLanguages(font: Font, langs: Record<string, boolean>): boolean {
  const activeLangs = activeKeys(langs);
  if (!activeLangs.length) return true;

  return activeLangs.every(l => Boolean(font.supportedLanguages?.includes(l)));
}

function matchesWeightCount(font: Font, weightCount: number | null): boolean {
  if (!weightCount) return true;

  const count = isVariable(font)
    ? VARIABLE_WEIGHT_COUNT
    : Array.isArray(font.weights)
      ? font.weights.length
      : 1;

  return count >= weightCount;
}

function matchesFilters(font: Font, filters: FontFilters): boolean {
  if (!matchesQuery(font, filters.query)) return false;
  if (filters.style && font.styleKey !== filters.style) return false;
  if (!matchesLicense(font, filters.licenses)) return false;
  if (!matchesLanguages(font, filters.langs)) return false;
  if (!matchesWeightCount(font, filters.weightCount)) return false;
  if (filters.variableMode && !isVariable(font)) return false;

  return true;
}

function useInfiniteScroll(
  hasMore: boolean,
  totalFilteredCount: number,
  setVisibleCount: Dispatch<SetStateAction<number>>
): RefObject<HTMLDivElement | null> {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore) return;

    const el = sentinelRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setVisibleCount(prev =>
            Math.min(prev + BATCH_SIZE, totalFilteredCount)
          );
        }
      },
      { rootMargin: `${SCROLL_AHEAD_PX}px` }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, totalFilteredCount, setVisibleCount]);

  return sentinelRef;
}

function GalleryShell({ children }: { children: ReactNode }) {
  return (
    <section
      className="container-main flex flex-col px-3 py-4 pb-20 sm:px-6"
      id="gallery"
    >
      {children}
    </section>
  );
}

function GalleryLoading({ label }: { label: string }) {
  return (
    <div className="gallery-loading text-secondary flex flex-col items-center justify-center gap-4 py-20">
      <div className="spinner border-text-primary/30 border-t-text-primary h-8 w-8 animate-spin rounded-full border-2" />
      <span>{label}</span>
    </div>
  );
}

export default function FontGallery() {
  const { lang } = useAppearance();
  const t = T[lang];
  const { fonts } = useFontCatalog();
  const { filters, pinned } = useFontExplore();

  const [visibleCount, setVisibleCount] = useState<number>(BATCH_SIZE);

  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [filters]);

  const { pinnedList, unpinnedList, filteredCount } = useMemo(() => {
    const pinnedItems: Font[] = [];
    const unpinnedItems: Font[] = [];

    fonts.forEach(f => {
      if (pinned.list.has(f.family)) {
        pinnedItems.push(f);
      } else if (matchesFilters(f, filters)) {
        unpinnedItems.push(f);
      }
    });

    return {
      pinnedList: pinnedItems,
      unpinnedList: unpinnedItems,
      filteredCount: pinnedItems.length + unpinnedItems.length,
    };
  }, [fonts, filters, pinned.list]);

  const allFiltered = useMemo(
    () => [...pinnedList, ...unpinnedList],
    [pinnedList, unpinnedList]
  );

  const displayedFonts = useMemo(
    () => allFiltered.slice(0, visibleCount),
    [allFiltered, visibleCount]
  );

  const hasMore = visibleCount < filteredCount;
  const sentinelRef = useInfiniteScroll(
    hasMore,
    filteredCount,
    setVisibleCount
  );

  if (!fonts.length) {
    return (
      <GalleryShell>
        <GalleryLoading label={t.loadingFonts} />
      </GalleryShell>
    );
  }

  if (!filteredCount) {
    return (
      <GalleryShell>
        <div className="empty text-secondary py-16 text-center text-lg">
          {t.noResults}
        </div>
      </GalleryShell>
    );
  }

  return (
    <GalleryShell>
      {displayedFonts.map(f => (
        <FontCard key={f.family} font={f} />
      ))}

      {hasMore && (
        <div
          ref={sentinelRef}
          className="text-secondary flex h-10 items-center justify-center py-2 text-sm"
        >
          <div className="spinner border-text-primary/30 border-t-text-primary h-5 w-5 animate-spin rounded-full border-2" />
        </div>
      )}
    </GalleryShell>
  );
}
