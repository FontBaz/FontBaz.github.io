import { createContext, use } from "react";

import type { AppearanceContextType } from "../types";

export const AppearanceContext = createContext<AppearanceContextType | null>(
  null
);
AppearanceContext.displayName = "AppearanceContext";

export function useAppearance(): AppearanceContextType {
  const ctx = use(AppearanceContext);

  if (!ctx) {
    throw new Error("useAppearance must be used within a AppearanceProvider");
  }

  return ctx;
}
