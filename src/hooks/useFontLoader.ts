import { useEffect, useState } from "react";

import type { Font, FontMeta } from "../types";

import { FONTS_DATA_URL } from "../data/constants";
import { shuffleByKey } from "../utils/shuffle";

const STORAGE_CACHE_KEY = "fonts-data-cache-v1";

function deriveMeta(fonts: Font[]): FontMeta {
  const styleMap: Record<string, { fa?: string; en?: string }> = {};
  const langSet: Record<string, boolean> = {};
  const styleCounts: Record<string, number> = {};
  const licCounts: Record<string, number> = {};
  const langCounts: Record<string, number> = {};

  fonts.forEach(f => {
    f.styleKey = f.style?.en ? f.style.en.toLowerCase() : "sans";
    f.styleLabel = f.style ?? { en: f.styleKey, fa: f.styleKey };
    styleMap[f.styleKey] = f.styleLabel;
    styleCounts[f.styleKey] = (styleCounts[f.styleKey] ?? 0) + 1;

    if (f.license) {
      licCounts[f.license] = (licCounts[f.license] ?? 0) + 1;
    }

    (f.supportedLanguages ?? []).forEach(l => {
      if (l === "fa") return;
      langSet[l] = true;
      langCounts[l] = (langCounts[l] ?? 0) + 1;
    });
  });

  const styleOptions = Object.keys(styleMap).sort(
    (a, b) => styleCounts[b] - styleCounts[a]
  );
  const langFilterOptions = Object.keys(langSet).sort(
    (a, b) => langCounts[b] - langCounts[a]
  );

  return {
    styleOptions,
    styleLabels: styleMap,
    styleCounts,
    licCounts,
    langCounts,
    langFilterOptions,
  };
}

function buildFontCatalog(data: Font[]): { fonts: Font[]; meta: FontMeta } {
  const fonts = shuffleByKey(data, f => f.family);

  fonts.forEach(f => {
    f._loaded = {};
    f._loading = {};
  });

  return { fonts, meta: deriveMeta(fonts) };
}

function getInitialCachedData(): { fonts: Font[]; meta: FontMeta } | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_CACHE_KEY);
  if (!raw) return null;
  const parsed = JSON.parse(raw);

  if (Array.isArray(parsed) && parsed.length > 0) {
    return buildFontCatalog(parsed);
  }

  return null;
}

export function useFontLoader() {
  const [cached] = useState<{ fonts: Font[]; meta: FontMeta } | null>(() =>
    getInitialCachedData()
  );
  const [fonts, setFonts] = useState<Font[]>(() =>
    cached ? cached.fonts : []
  );
  const [meta, setMeta] = useState<FontMeta>(() =>
    cached
      ? cached.meta
      : {
          styleOptions: [],
          styleLabels: {},
          styleCounts: {},
          licCounts: {},
          langCounts: {},
          langFilterOptions: [],
        }
  );
  const [loading, setLoading] = useState<boolean>(() => !cached);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        if (!cached) {
          setLoading(true);
        }

        const res = await fetch(FONTS_DATA_URL);
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const raw: Font[] = await res.json();

        localStorage.setItem(STORAGE_CACHE_KEY, JSON.stringify(raw));

        if (active) {
          const { fonts: normalized, meta: normalizedMeta } =
            buildFontCatalog(raw);
          setFonts(normalized);
          setMeta(normalizedMeta);
          setLoading(false);
        }
      } catch (err) {
        if (active) {
          console.warn("Failed to fetch fresh fonts data from network:", err);

          if (!cached) {
            setError(err instanceof Error ? err : new Error(String(err)));
          }

          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [cached]);

  return { fonts, meta, loading, error };
}
