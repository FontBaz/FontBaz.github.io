import { createContext, use } from "react";

import type { FontCatalogContextType, FontExploreContextType } from "../types";

export const FontCatalogContext = createContext<FontCatalogContextType | null>(
  null
);
FontCatalogContext.displayName = "FontCatalogContext";

export const FontExploreContext = createContext<FontExploreContextType | null>(
  null
);
FontExploreContext.displayName = "FontExploreContext";

export function useFontCatalog(): FontCatalogContextType {
  const ctx = use(FontCatalogContext);

  if (!ctx) {
    throw new Error("useFontCatalog must be used within a FontCatalogProvider");
  }

  return ctx;
}

export function useFontExplore(): FontExploreContextType {
  const ctx = use(FontExploreContext);

  if (!ctx) {
    throw new Error("useFontExplore must be used within a FontExploreProvider");
  }

  return ctx;
}
