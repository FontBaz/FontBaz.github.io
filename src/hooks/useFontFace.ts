import { useEffect, useState } from "react";

import type { Font } from "../types";

import { ensureFontLoaded, isFontReady } from "../utils/fontUtils";

// eslint-disable-next-line max-params
export function useFontFace(
  font?: Font | null,
  weight: number = 400,
  axisId: string | null = null,
  variantId: string | null = null
): { ready: boolean; error: boolean } {
  const [ready, setReady] = useState<boolean>(() =>
    isFontReady(font, weight, axisId, variantId)
  );
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    if (!font) return;

    if (isFontReady(font, weight, axisId, variantId)) {
      setReady(true);
      setError(false);
      return;
    }

    let isMounted = true;
    void ensureFontLoaded(font, weight, axisId, variantId).then(ok => {
      if (!isMounted) return;
      if (ok) {
        setReady(true);
        setError(false);
      } else {
        setError(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [font, weight, axisId, variantId]);

  return { ready, error };
}
