import type { Dispatch, ReactNode, SetStateAction } from "react";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { Font, FontExploreContextType, FontFilters } from "../types";

import { useFontLoader } from "../hooks/useFontLoader";
import { hasActiveKeys } from "../utils/fontUtils";
import {
  FontCatalogContext,
  FontExploreContext,
  useFontCatalog,
} from "./font-context";

const INITIAL_FILTERS: FontFilters = {
  query: "",
  style: null,
  licenses: {},
  langs: {},
  weightCount: null,
  variableMode: null,
};

function getInitialURLFontSlug(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  return params.get("font") ?? null;
}

type ProviderProps = {
  children: ReactNode;
};

export function FontCatalogProvider({ children }: ProviderProps) {
  const { fonts, meta, loading, error } = useFontLoader();
  const dataValue = useMemo(
    () => ({ fonts, meta, loading, error }),
    [fonts, meta, loading, error]
  );

  return <FontCatalogContext value={dataValue}>{children}</FontCatalogContext>;
}

function usePinnedFonts(): {
  pinnedFonts: Set<string>;
  togglePinFont: (slug: string) => void;
} {
  const [pinnedFonts, setPinnedFonts] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    const raw = localStorage.getItem("pinned");
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  });

  const togglePinFont = useCallback((slug: string) => {
    setPinnedFonts(prev => {
      const next = new Set(prev);

      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }

      localStorage.setItem("pinned", JSON.stringify(Array.from(next)));
      return next;
    });
  }, []);

  return { pinnedFonts, togglePinFont };
}

function useInitialFontFromURL(
  fonts: Font[],
  initialFontSlug: string | null,
  setModalFont: Dispatch<SetStateAction<Font | null>>
): void {
  useEffect(() => {
    if (!fonts.length || !initialFontSlug) return;

    const targetSlug = initialFontSlug.toLowerCase();
    const found = fonts.find(f => f.family.toLowerCase() === targetSlug);

    if (found) {
      setModalFont(prev => prev ?? found);
    }
  }, [fonts, initialFontSlug, setModalFont]);
}

function useModalURLSync(modalFont: Font | null): void {
  useEffect(() => {
    const params = new URLSearchParams();

    if (modalFont) {
      params.set("font", modalFont.family);
    }

    const qs = params.toString();
    const newUrl = qs
      ? `${window.location.pathname}?${qs}`
      : window.location.pathname;

    if (window.location.search !== (qs ? `?${qs}` : "")) {
      window.history.replaceState({ fontApp: true }, "", newUrl);
    }
  }, [modalFont]);
}

function usePopStateSync(
  fonts: Font[],
  setModalFont: Dispatch<SetStateAction<Font | null>>
): void {
  useEffect(() => {
    const handlePopState = () => {
      const slug = getInitialURLFontSlug();

      if (slug && fonts.length) {
        const found = fonts.find(
          f => f.family.toLowerCase() === slug.toLowerCase()
        );
        setModalFont(found ?? null);
      } else {
        setModalFont(null);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [fonts, setModalFont]);
}

export function FontExploreProvider({ children }: ProviderProps) {
  const fontData = useFontCatalog();
  const [initialFontSlug] = useState(() => getInitialURLFontSlug());

  const [filters, setFiltersState] = useState<FontFilters>(INITIAL_FILTERS);
  const [previewText, setPreviewText] = useState<string>("");
  const [previewSize, setPreviewSize] = useState<number>(48);
  const [modalFont, setModalFont] = useState<Font | null>(null);
  const [modalPage, setModalPage] = useState<number>(0);
  const [modalWeight, setModalWeight] = useState<number>(400);
  const [modalAxis, setModalAxis] = useState<string | null>(null);
  const [modalVariant, setModalVariant] = useState<string | null>(null);
  const { pinnedFonts, togglePinFont } = usePinnedFonts();

  useInitialFontFromURL(fontData.fonts, initialFontSlug, setModalFont);
  useModalURLSync(modalFont);
  usePopStateSync(fontData.fonts, setModalFont);

  const setFilter = useCallback(
    <K extends keyof FontFilters>(
      key: K,
      value: ((prev: FontFilters[K]) => FontFilters[K]) | FontFilters[K]
    ) => {
      setFiltersState(prev => {
        const nextVal = typeof value === "function" ? value(prev[key]) : value;
        return {
          ...prev,
          [key]: nextVal,
        };
      });
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFiltersState(INITIAL_FILTERS);
  }, []);

  const isAnyFilterActive =
    filters.style !== null ||
    filters.weightCount !== null ||
    filters.variableMode !== null ||
    filters.query !== "" ||
    hasActiveKeys(filters.licenses) ||
    hasActiveKeys(filters.langs);

  const uiValue: FontExploreContextType = useMemo(
    () => ({
      filters,
      setFilter,
      resetFilters,
      isAnyFilterActive,
      preview: {
        text: previewText,
        size: previewSize,
        setText: setPreviewText,
        setSize: setPreviewSize,
      },
      modal: {
        font: modalFont,
        page: modalPage,
        weight: modalWeight,
        axis: modalAxis,
        variant: modalVariant,
        open: (f: Font | null) => setModalFont(f),
        close: () => setModalFont(null),
        setPage: setModalPage,
        setWeight: setModalWeight,
        setAxis: setModalAxis,
        setVariant: setModalVariant,
      },
      pinned: {
        list: pinnedFonts,
        toggle: togglePinFont,
        has: (family: string) => pinnedFonts.has(family),
      },
    }),
    [
      filters,
      setFilter,
      resetFilters,
      isAnyFilterActive,
      previewText,
      previewSize,
      modalFont,
      modalPage,
      modalWeight,
      modalAxis,
      modalVariant,
      pinnedFonts,
      togglePinFont,
    ]
  );

  return <FontExploreContext value={uiValue}>{children}</FontExploreContext>;
}

export function FontProvider({ children }: ProviderProps) {
  return (
    <FontCatalogProvider>
      <FontExploreProvider>{children}</FontExploreProvider>
    </FontCatalogProvider>
  );
}
