import { useAppearance } from "../context/appearance-context";
import { T } from "../data/constants";
import type { Font, FontAxisOption, FontMeta, Language } from "../types";

export function normalizePersian(text?: string | null): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[ئىي]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[آأإٱ]/g, "ا")
    .replace(/ؤ/g, "و")
    .replace(/ة/g, "ه")
    .replace(/[٠۰]/g, "0")
    .replace(/[١۱]/g, "1")
    .replace(/[٢۲]/g, "2")
    .replace(/[٣۳]/g, "3")
    .replace(/[٤۴]/g, "4")
    .replace(/[٥۵]/g, "5")
    .replace(/[٦۶]/g, "6")
    .replace(/[٧۷]/g, "7")
    .replace(/[٨۸]/g, "8")
    .replace(/[٩۹]/g, "9")
    .trim();
}

const FONT_CHECK_CACHE: Record<string, boolean> = {};
const TEST_STRING = "mmmmmmmmmmlliilWWMWMWمتن آزمایشی فارسی ۱۲۳۴۵۶۷۸۹";
const TEST_SIZE = "72px";
const BASE_FONTS = ["monospace", "sans-serif", "serif"] as const;

let measureCtx: CanvasRenderingContext2D | null = null;
let baseWidths: Record<string, number> | null = null;

function getMeasureContext(): CanvasRenderingContext2D | null {
  if (measureCtx) return measureCtx;

  try {
    const canvas = document.createElement("canvas");
    measureCtx = canvas.getContext("2d");
  } catch {
    measureCtx = null;
  }

  return measureCtx;
}

function getBaseWidths(ctx: CanvasRenderingContext2D): Record<string, number> {
  if (baseWidths) return baseWidths;

  baseWidths = {};

  for (const base of BASE_FONTS) {
    ctx.font = `${TEST_SIZE} ${base}`;
    baseWidths[base] = ctx.measureText(TEST_STRING).width;
  }

  return baseWidths;
}

export function isLocallyInstalled(fontFamily?: string): boolean {
  if (!fontFamily || typeof document === "undefined") return false;

  if (fontFamily in FONT_CHECK_CACHE) {
    return FONT_CHECK_CACHE[fontFamily];
  }

  const ctx = getMeasureContext();

  if (!ctx) {
    FONT_CHECK_CACHE[fontFamily] = false;
    return false;
  }

  const widths = getBaseWidths(ctx);
  const cleanName = fontFamily.replace(/["'\\]/g, "");
  let differentCount = 0;

  for (const base of BASE_FONTS) {
    ctx.font = `${TEST_SIZE} '${cleanName}', ${base}`;
    const { width } = ctx.measureText(TEST_STRING);

    if (Math.abs(width - widths[base]) > 0.5) {
      differentCount += 1;
    }
  }

  const installed = differentCount >= 2;
  FONT_CHECK_CACHE[fontFamily] = installed;
  return installed;
}

export function setupDefaultSiteFont(): void {
  if (typeof window === "undefined") return;
  const isAradVFInstalled = isLocallyInstalled("AradVF");

  if (!isAradVFInstalled) {
    const aradUrl =
      "https://cdn.jsdelivr.net/gh/MohamadDarvishi/Arad@main/Fonts/Main_Fonts/AradVF.woff2";

    if (typeof FontFace !== "undefined") {
      try {
        const face = new FontFace(
          "AradVF",
          `url('${aradUrl}') format('woff2')`,
          { weight: "100 1000", display: "swap" }
        );
        face
          .load()
          .then(loaded => {
            document.fonts.add(loaded);
          })
          .catch(e => {
            console.warn("Could not download AradVF font:", e);
          });
      } catch (err) {
        console.warn("FontFace creation failed for AradVF:", err);
      }
    }
  }

  document.documentElement.style.setProperty(
    "--font-fa",
    "'AradVF', ui-sans-serif, system-ui, -apple-system, sans-serif"
  );
  document.documentElement.style.setProperty(
    "--font-ui",
    "'AradVF', ui-sans-serif, system-ui, -apple-system, sans-serif"
  );
}

export function isDefaultAxis(axisId: string | null): boolean {
  return !axisId || axisId === "default";
}

export function activeKeys(record: Record<string, boolean>): string[] {
  return Object.keys(record).filter(key => record[key]);
}

export function hasActiveKeys(record: Record<string, boolean>): boolean {
  return activeKeys(record).length > 0;
}

const MOBILE_BREAKPOINT_PX = 760;
const MOBILE_SIZE_FACTOR = 0.75;

export function resolvePreviewSize(size: number, minSize: number): number {
  const isMobile =
    typeof window !== "undefined" && window.innerWidth <= MOBILE_BREAKPOINT_PX;

  return isMobile
    ? Math.max(minSize, Math.round(size * MOBILE_SIZE_FACTOR))
    : size;
}

export function isVariable(font?: Font | null): boolean {
  return Boolean(font?.isVariable);
}

function axesForVariableFont(font: Font, lang: Language): FontAxisOption[] {
  const result: FontAxisOption[] = [];

  const defaultWord = T[lang].default;

  font.axes?.forEach(axis => {
    const tag = axis.tag || "DSTY";
    const min = axis.min ?? 1;
    const max = axis.max ?? 1;
    const axisName = axis.name?.[lang] ?? tag;

    for (let v = min; v <= max; v++) {
      let id: string;

      if (v === min) {
        id = "default";
      } else if (tag === "DSTY") {
        id = `Dots${v}`;
      } else {
        id = `${tag}:${v}`;
      }

      const name =
        v === min ? `${axisName} ${v} (${defaultWord})` : `${axisName} ${v}`;

      result.push({
        id,
        suffix: id,
        name,
      });
    }
  });

  return result;
}

function optionsForStaticStyles(font: Font): FontAxisOption[] {
  const result: FontAxisOption[] = [];
  const { lang } = useAppearance();

  font.styles?.forEach(st => {
    if (!st) {
      result.push({
        id: "default",
        suffix: "",
        name: T[lang].normal,
      });
    } else {
      result.push({
        id: st,
        suffix: st,
        name: T[lang].normal,
      });
    }
  });

  return result;
}

export function getFontAxes(font: Font | null, lang: Language): FontAxisOption[] {
  if (!font) return [];
  if (font.axes?.length) return axesForVariableFont(font, lang);
  if (font.styles?.length) return optionsForStaticStyles(font);
  return [];
}

/** @deprecated Use `getFontAxes` instead. */
export const getFontVariants = getFontAxes;

export function formatWeightsText(
  font?: Font | null,
  lang: Language = "fa"
): string {
  if (!font) return "";
  if (isVariable(font)) {
    return T[lang].variable
  }

  const count = Array.isArray(font.weights) ? font.weights.length : 1;

  if (lang === "fa") {
    return `${count} ${T[lang].weights}`;
  }

  const wWord = count === 1 ? "weight" : "weights";
  return `${count} ${wWord}`;
}

export function availableWeights(
  font?: Font | null,
  _axisId: string | null = null
): number[] {
  if (!font) return [400];
  if (isVariable(font)) {
    return [100, 200, 300, 400, 500, 600, 700, 800, 900];
  }
  if (Array.isArray(font.weights) && font.weights.length > 0) {
    return [...font.weights].sort((a, b) => a - b);
  }

  return [400];
}

export function woff2UrlFor(
  font?: Font | null,
  weight: number = 400,
  axisId: string | null = null
): string | null {
  if (!font?.woff2) return null;
  if (isVariable(font)) {
    return font.woff2;
  }

  let url = font.woff2;

  url = url.replace("{weight}", String(weight));

  if (url.includes("{style}")) {
    if (!isDefaultAxis(axisId)) {
      url = url.replace("{style}", (axisId ?? "").toLowerCase());
    } else {
      // Strip the style segment and its adjacent dash so the URL stays valid,
      // e.g. "Font-{weight}-{style}.woff2" → "Font-400.woff2".
      url = url
        .replace("-{style}", "")
        .replace("{style}-", "")
        .replace("{style}", "");
    }
  }

  return url;
}

export function fontVariationSettingsCSS(
  font?: Font | null,
  weight: number = 400,
  axisId: string | null = null
): string {
  if (!font || !isVariable(font)) {
    return "normal";
  }

  const settingsMap: Record<string, number> = {
    wght: weight,
  };

  if (font.axes && Array.isArray(font.axes)) {
    font.axes.forEach(axis => {
      if (axis.tag) {
        settingsMap[axis.tag] = axis.min ?? 1;
      }
    });
  }

  if (!isDefaultAxis(axisId) && axisId) {
    const dotsMatch = /^dots(\d+)$/i.exec(axisId);

    if (dotsMatch) {
      settingsMap["DSTY"] = parseInt(dotsMatch[1], 10);
    } else {
      const axisMatch = /^(\w{4})\s*(?:[:=]\s*)?([-.0-9]+)$/.exec(axisId);

      if (axisMatch) {
        settingsMap[axisMatch[1]] = parseFloat(axisMatch[2]);
      }
    }
  }

  return Object.entries(settingsMap)
    .map(([tag, val]) => `"${tag}" ${val}`)
    .join(", ");
}

export function familyCSS(
  font?: Font | null,
  axisId: string | null = null
): string {
  if (!font) return "sans-serif";
  let fam = font.family;

  if (!isDefaultAxis(axisId) && !isVariable(font)) {
    fam = `${font.family}-${axisId ?? ""}`;
  }

  const parts = [`'${fam}'`];

  if (fam !== font.family) {
    parts.push(`'${font.family}'`);
  }

  const st = font.style?.en;
  parts.push(
    st === "Monospace" ? "monospace" : st === "Serif" ? "serif" : "sans-serif"
  );
  return parts.join(", ");
}

export function generateFontCSS(
  font?: Font | null,
  axisId: string | null = null
): string {
  if (!font) return "";
  const hasVar = isVariable(font);

  const fam =
    axisId && !isDefaultAxis(axisId) && !hasVar
      ? `${font.family}-${axisId}`
      : font.family;
  const famRule = familyCSS(font, axisId);

  const fontFaces: string[] = [];

  if (hasVar) {
    const url = font.woff2 ?? "";
    fontFaces.push(
      `@font-face {\n  font-family: '${fam}';\n  src: url('${url}') format('woff2');\n  font-weight: 100 900;\n  font-display: swap;\n}`
    );
  } else {
    const weights = availableWeights(font, axisId);
    weights.forEach(w => {
      const url = woff2UrlFor(font, w, axisId) ?? "";
      fontFaces.push(
        `@font-face {\n  font-family: '${fam}';\n  src: url('${url}') format('woff2');\n  font-weight: ${w};\n  font-display: swap;\n}`
      );
    });
  }

  let extraProps = "";

  if (hasVar) {
    const fvs = fontVariationSettingsCSS(font, 400, axisId);

    if (fvs && fvs !== "normal") {
      extraProps = `\n  font-variation-settings: ${fvs};`;
    }
  }

  return `${fontFaces.join("\n\n")}\n\nbody {\n  font-family: ${famRule};${extraProps}\n}`;
}

export function isFontReady(
  font?: Font | null,
  weight: number = 400,
  axisId: string | null = null
): boolean {
  if (!font) return false;

  if (isDefaultAxis(axisId) && isLocallyInstalled(font.family)) return true;
  if (!font._loaded) return false;

  const key = isVariable(font)
    ? "var"
    : `${!isDefaultAxis(axisId) ? `${axisId ?? ""}:` : ""}${weight}`;

  return Boolean(font._loaded[key]);
}

type LoadTask = {
  run: () => Promise<boolean>;
  resolve: (value: boolean) => void;
};

const MAX_CONCURRENT_LOADS = 4;
let activeLoads = 0;
const loadQueue: LoadTask[] = [];

function finishTask(task: LoadTask, ok: boolean): void {
  task.resolve(ok);
  activeLoads -= 1;
  pumpQueue();
}

function runTask(task: LoadTask): Promise<void> {
  return task.run().then(
    ok => {
      finishTask(task, ok);
    },
    () => {
      finishTask(task, false);
    }
  );
}

function pumpQueue(): void {
  while (activeLoads < MAX_CONCURRENT_LOADS && loadQueue.length > 0) {
    const task = loadQueue.shift();
    if (!task) break;
    activeLoads += 1;
    void runTask(task);
  }
}

function enqueueLoad(run: () => Promise<boolean>): Promise<boolean> {
  return new Promise<boolean>(resolve => {
    loadQueue.push({ run, resolve });
    pumpQueue();
  });
}

type FontLoadContext = {
  font: Font;
  hasVar: boolean;
  axisId: string | null;
  isDefaultAxis: boolean;
  weight: number;
};

function fontLoadKey(ctx: FontLoadContext): string {
  if (ctx.hasVar) return "var";
  return `${ctx.axisId && !ctx.isDefaultAxis ? `${ctx.axisId}:` : ""}${ctx.weight}`;
}

function resolvedFamilyName(ctx: FontLoadContext): string {
  if (ctx.axisId && !ctx.isDefaultAxis && !ctx.hasVar) {
    return `${ctx.font.family}-${ctx.axisId}`;
  }

  return ctx.font.family;
}

function resolveFontSource(ctx: FontLoadContext): {
  url: string | null;
  desc: FontFaceDescriptors;
} {
  if (ctx.hasVar) {
    return {
      url: ctx.font.woff2 ?? null,
      desc: { weight: "100 900", display: "swap" },
    };
  }

  return {
    url: woff2UrlFor(ctx.font, ctx.weight, ctx.axisId),
    desc: { weight: String(ctx.weight), display: "swap" },
  };
}

function loadFontFace(
  ctx: FontLoadContext,
  url: string,
  desc: FontFaceDescriptors
): Promise<boolean> {
  const key = fontLoadKey(ctx);
  const famName = resolvedFamilyName(ctx);
  const loaded: Record<string, boolean | undefined> = ctx.font._loaded ?? {};
  const loading: Record<string, Promise<boolean> | undefined> =
    ctx.font._loading ?? {};
  ctx.font._loaded = loaded;
  ctx.font._loading = loading;
  return new Promise<boolean>(resolve => {
    try {
      const face = new FontFace(famName, `url('${url}') format('woff2')`, desc);
      face
        .load()
        .then(loadedFace => {
          document.fonts.add(loadedFace);
          loaded[key] = true;
          resolve(true);
        })
        .catch(e => {
          console.warn(
            `[FontLoader] Failed loading font file for ${famName}:`,
            e
          );
          loading[key] = undefined;
          resolve(false);
        });
    } catch (err) {
      console.warn(
        `[FontLoader] Failed creating FontFace for ${famName}:`,
        err
      );
      loading[key] = undefined;
      resolve(false);
    }
  });
}

export function ensureFontLoaded(
  font?: Font | null,
  weight: number = 400,
  axisId: string | null = null
): Promise<boolean> {
  if (!font) return Promise.resolve(false);
  const ctx: FontLoadContext = {
    font,
    hasVar: isVariable(font),
    axisId,
    isDefaultAxis: isDefaultAxis(axisId),
    weight,
  };
  const key = fontLoadKey(ctx);

  font._loaded ??= {};
  font._loading ??= {};

  if (font._loaded[key]) return Promise.resolve(true);
  if (isDefaultAxis(axisId) && isLocallyInstalled(font.family)) {
    font._loaded[key] = true;
    return Promise.resolve(true);
  }

  const pending = font._loading[key];
  if (pending !== undefined) return pending;

  const { url, desc } = resolveFontSource(ctx);
  if (!url) return Promise.resolve(false);

  const promise = enqueueLoad(() => loadFontFace(ctx, url, desc));
  font._loading[key] = promise;
  return promise;
}

export function getLocalizedName(font: Font, lang: Language): string {
  return font.name?.[lang] ?? font.family;
}

export function getStyleLabel(
  font: Font,
  meta: FontMeta,
  lang: Language
): string {
  if (!font.styleKey) return "";
  const label = meta.styleLabels[font.styleKey];
  return label[lang] ?? font.styleKey;
}
