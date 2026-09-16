import { useEffect, useState } from "react";

import type { Font } from "../types";

import { ensureFontLoaded, isFontReady } from "../utils/fontUtils";

export function useFontFace(
  font?: Font | null,
  weight: number = 400,
  axisId: string | null = null
): { ready: boolean; error: boolean } {
  const [ready, setReady] = useState<boolean>(() =>
    isFontReady(font, weight, axisId)
  );
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    if (!font) return;

    if (isFontReady(font, weight, axisId)) {
      setReady(true);
      setError(false);
      return;
    }

    let isMounted = true;
    void ensureFontLoaded(font, weight, axisId).then(ok => {
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
  }, [font, weight, axisId]);

  return { ready, error };
}
