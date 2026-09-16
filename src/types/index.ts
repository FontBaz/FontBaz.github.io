export type Language = "en" | "fa";
export type Theme = "dark" | "light";

export type LocalizedString = {
  fa?: string;
  en?: string;
  [key: string]: string | undefined;
};

export type FontAxisDef = {
  tag: string;
  min?: number;
  max?: number;
  name?: { fa?: string; en?: string };
};

export type FontAxisOption = {
  id: string;
  suffix: string;
  name: string;
};

export type Font = {
  family: string;
  name?: LocalizedString;
  style?: { fa?: string; en?: string };
  styleKey?: string;
  styleLabel?: { fa?: string; en?: string };
  license?: string;
  source?: string;
  designer?: LocalizedString;
  description?: LocalizedString;
  note?: LocalizedString;
  "download-link"?: string;
  "source-link"?: string;
  preview?: string;
  supportedLanguages?: string[];
  weights?: number[];
  isVariable?: boolean;
  axes?: FontAxisDef[];
  styles?: string[];
  woff2?: string;
  _loaded?: Record<string, boolean | undefined>;
  _loading?: Record<string, Promise<boolean> | undefined>;
  [key: string]: unknown;
};

export type FontMeta = {
  styleOptions: string[];
  styleLabels: Record<string, { fa?: string; en?: string }>;
  styleCounts: Record<string, number>;
  licCounts: Record<string, number>;
  langCounts: Record<string, number>;
  langFilterOptions: string[];
};

export type HeroSlide = {
  image: string;
  family: string;
};

export type FaqItem = {
  q: { fa: string; en: string };
  a: { fa: string; en: string };
  links?: Record<string, string>;
};

export type FontFilters = {
  query: string;
  style: string | null;
  licenses: Record<string, boolean>;
  langs: Record<string, boolean>;
  weightCount: number | null;
  variableMode: boolean | null;
};

export type FontCatalogContextType = {
  fonts: Font[];
  meta: FontMeta;
  loading: boolean;
  error: Error | null;
};

export type FontPreviewState = {
  text: string;
  size: number;
  setText: (text: string) => void;
  setSize: (size: number) => void;
};

export type FontModalState = {
  font: Font | null;
  page: number;
  weight: number;
  axis: string | null;
  variant: string | null;
  open: (font: Font | null) => void;
  close: () => void;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  setWeight: (weight: number) => void;
  setAxis: (axis: string | null) => void;
  setVariant: (variant: string | null) => void;
};

export type FontPinnedState = {
  list: Set<string>;
  toggle: (family: string) => void;
  has: (family: string) => boolean;
};

export type FontExploreContextType = {
  filters: FontFilters;
  setFilter: <K extends keyof FontFilters>(
    key: K,
    value: ((prev: FontFilters[K]) => FontFilters[K]) | FontFilters[K]
  ) => void;
  resetFilters: () => void;
  isAnyFilterActive: boolean;
  preview: FontPreviewState;
  modal: FontModalState;
  pinned: FontPinnedState;
};

export type AppearanceContextType = {
  lang: Language;
  setLang: (lang: Language) => void;
  theme: Theme;
  toggleTheme: () => void;
};
