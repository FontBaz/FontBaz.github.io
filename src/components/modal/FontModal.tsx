import type { CSSProperties, ReactNode, RefObject } from "react";

import { useCallback, useEffect, useRef, useState } from "react";

import type { Font, FontAxisOption, FontMeta, Language } from "../../types";

import { useAppearance } from "../../context/appearance-context";
import { useFontCatalog, useFontExplore } from "../../context/font-context";
import {
  DEFAULT_SPECIMEN,
  ENGLISH_NUMS,
  ENGLISH_SYMS,
  ENGLISH_TEXT,
  langLabel,
  LICENSE_NOTES,
  STACK_TEXT,
  STYLE_NOTES,
  T,
} from "../../data/constants";
import { useFontFace } from "../../hooks/useFontFace";
import {
  availableWeights,
  familyCSS,
  fontVariationSettingsCSS,
  formatWeightsText,
  generateFontCSS,
  getFontAxes,
  resolvePreviewSize,
} from "../../utils/fontUtils";

const DOT_ICONS = [
  <span key="fa" className="font-fa text-xs font-semibold">
    فا
  </span>,
  <span
    key="aa"
    className="inline-flex gap-0.5 font-mono text-xs leading-none font-bold"
  >
    <span className="font-extrabold">A</span>
    <span className="font-extralight">A</span>
  </span>,
  <span key="en" className="font-mono text-xs leading-none font-semibold">
    EN
  </span>,
];

const CLOSE_ANIMATION_MS = 220;
const COPY_FEEDBACK_MS = 2000;

function buildEnglishSpecimen(): string {
  return `${ENGLISH_TEXT}<br><br>${ENGLISH_NUMS.replace(/\n/g, "<br>")}<br><br>${ENGLISH_SYMS}`;
}

function useActiveFontTransition(modalFont: Font | null): {
  activeFont: Font | null;
  isClosing: boolean;
} {
  const [activeFont, setActiveFont] = useState<Font | null>(null);
  const [isClosing, setIsClosing] = useState<boolean>(false);

  useEffect(() => {
    if (modalFont) {
      setActiveFont(modalFont);
      setIsClosing(false);
      return;
    }

    if (!activeFont) return;

    setIsClosing(true);
    const timer = setTimeout(() => {
      setActiveFont(null);
      setIsClosing(false);
    }, CLOSE_ANIMATION_MS);

    return () => clearTimeout(timer);
  }, [modalFont, activeFont]);

  return { activeFont, isClosing };
}

function useBodyScrollLock(locked: boolean): void {
  useEffect(() => {
    if (!locked) return;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [locked]);
}

function useEscapeToClose(enabled: boolean, onClose: () => void): void {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, onClose]);
}

type SpecimenState = {
  stackText: string;
  setStackText: (text: string) => void;
  sizes: number[];
  setSizes: (updater: (prev: number[]) => number[]) => void;
};

function useSpecimenState(modalFont: Font | null): SpecimenState {
  const [stackText, setStackText] = useState<string>(STACK_TEXT);
  const [sizes, setSizes] = useState<number[]>([44, 32, 32]);

  useEffect(() => {
    setStackText(STACK_TEXT);
    setSizes([44, 32, 32]);
  }, [modalFont]);

  return { stackText, setStackText, sizes, setSizes };
}

type ModalInitSetters = {
  setAxis: (axis: string | null) => void;
  setWeight: (weight: number) => void;
  setPage: (page: number) => void;
};

function useModalDefaults(
  modalFont: Font | null,
  setters: ModalInitSetters
): void {
  const settersRef = useRef(setters);

  useEffect(() => {
    settersRef.current = setters;
  });

  useEffect(() => {
    if (!modalFont) return;

    const { current } = settersRef;
    const axes = getFontAxes(modalFont);
    const initialAxis = axes.length ? axes[0].id : null;

    current.setAxis(initialAxis);

    const weights = availableWeights(modalFont, initialAxis);
    current.setWeight(weights.includes(400) ? 400 : weights[0]);
    current.setPage(0);
  }, [modalFont]);
}

function buildLanguagesText(font: Font, lang: Language): string {
  return (font.supportedLanguages ?? [])
    .map(code => langLabel(code, lang))
    .join(" · ");
}

function ModalBackdrop({
  isClosing,
  onClose,
}: {
  isClosing: boolean;
  onClose: () => void;
}) {
  return (
    <button
      type="button"
      aria-label="Close"
      className={`bg-backdrop fixed inset-0 border-none ${
        isClosing ? "modal-backdrop-out" : "modal-backdrop-in"
      }`}
      onClick={onClose}
    />
  );
}

function ModalCloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      className="text-primary hover:text-strong hover:bg-primary/10 dark:hover:bg-primary/20 absolute end-4 top-4 z-20 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent transition-all"
      type="button"
      onClick={onClose}
    >
      <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
    </button>
  );
}

type SpecimenTextProps = {
  html: string;
  dir: "auto" | "ltr";
  notLoaded: boolean;
  style: CSSProperties;
};

function SpecimenText({ html, dir, notLoaded, style }: SpecimenTextProps) {
  return (
    <div
      contentEditable
      suppressContentEditableWarning
      className={`text-strong my-auto w-full cursor-text border-none bg-transparent text-center outline-none select-text focus:border-none focus:ring-0 focus:outline-none ${
        notLoaded ? "not-loaded" : ""
      }`}
      dangerouslySetInnerHTML={{ __html: html }}
      dir={dir}
      style={style}
    />
  );
}

type SlidePagerProps = {
  slideList: number[];
  page: number;
  onPageChange: (page: number) => void;
};

function SlidePager({ slideList, page, onPageChange }: SlidePagerProps) {
  return (
    <div className="flex justify-center pt-2">
      <div className="bg-modal-body-bg border-border/40 inline-flex h-9 items-center rounded-full border p-1 shadow-xs">
        {slideList.map((slideId, idx) => (
          <button
            key={slideId}
            type="button"
            className={`flex h-full cursor-pointer items-center justify-center rounded-full px-4 transition-all ${
              idx === page
                ? "bg-card-bg text-strong opacity-90 shadow-xs"
                : "text-tertiary hover:text-strong opacity-50 hover:opacity-80"
            }`}
            onClick={() => onPageChange(idx)}
          >
            {DOT_ICONS[slideId]}
          </button>
        ))}
      </div>
    </div>
  );
}

type SpecimenControlsProps = {
  lang: Language;
  currentSlide: number;
  axes: FontAxisOption[];
  axis: string | null;
  onAxisChange: (axis: string) => void;
  weights: number[];
  weight: number;
  onWeightChange: (weight: number) => void;
  currentSize: number;
  onSizeChange: (size: number) => void;
};

function SpecimenControls({
  lang,
  currentSlide,
  axes,
  axis,
  onAxisChange,
  weights,
  weight,
  onWeightChange,
  currentSize,
  onSizeChange,
}: SpecimenControlsProps) {
  return (
    <div
      className="z-10 mb-1 flex flex-wrap items-center gap-2 pe-10 md:pe-0"
      id="spec-controls"
    >
      {axes.length > 0 && currentSlide === 0 && (
        <select
          className="border-border bg-card-bg text-primary hover:border-text-secondary cursor-pointer rounded-full border px-3 py-1.5 text-xs transition-colors outline-none"
          value={axis ?? ""}
          onChange={e => onAxisChange(e.target.value)}
        >
          {axes.map(a => (
            <option key={a.id} value={a.id}>
              {a.name[lang]}
            </option>
          ))}
        </select>
      )}

      {weights.length > 1 && (currentSlide === 0 || currentSlide === 2) && (
        <select
          className="border-border bg-card-bg text-primary hover:border-text-secondary cursor-pointer rounded-full border px-3 py-1.5 font-mono text-xs transition-colors outline-none"
          value={weight}
          onChange={e => onWeightChange(parseInt(e.target.value, 10) || 400)}
        >
          {weights.map(w => (
            <option key={w} value={w}>
              {w}
            </option>
          ))}
        </select>
      )}

      <div className="ms-auto flex items-center gap-2">
        <span className="text-tertiary cursor-default font-mono text-[10px] select-none">
          {currentSize}px
        </span>
        <input
          className="bg-border accent-text-primary h-1 w-20 cursor-pointer appearance-none rounded-lg sm:w-28"
          type="range"
          min="10"
          max="160"
          value={currentSize}
          onChange={e => onSizeChange(parseInt(e.target.value, 10) || 32)}
        />
      </div>
    </div>
  );
}

type StackSlideProps = {
  font: Font;
  weights: number[];
  fontFamilyCss: string;
  axis: string | null;
  stackText: string;
  onStackTextChange: (text: string) => void;
  effectiveSize: number;
};

function StackSlide({
  font,
  weights,
  fontFamilyCss,
  axis,
  stackText,
  onStackTextChange,
  effectiveSize,
}: StackSlideProps) {
  return (
    <div className="absolute inset-0 flex flex-col justify-start gap-2 overflow-y-auto">
      {weights.map(w => (
        <div key={w} className="flex items-baseline gap-3">
          <span className="text-tertiary min-w-[32px] shrink-0 text-end font-mono text-xs">
            {w}
          </span>
          <input
            className="text-strong font-inherit min-w-0 flex-1 border-none bg-transparent outline-none focus:border-none focus:ring-0 focus:outline-none"
            value={stackText}
            onChange={e => onStackTextChange(e.target.value)}
            style={{
              fontFamily: fontFamilyCss,
              fontWeight: w,
              fontVariationSettings: fontVariationSettingsCSS(font, w, axis),
              fontSize: `${effectiveSize}px`,
              lineHeight: 1.25,
            }}
          />
        </div>
      ))}
    </div>
  );
}

type SpecimenColumnProps = {
  lang: Language;
  font: Font;
  fontFamilyCss: string;
  fontVariation: string;
  effectiveSize: number;
  fontLoaded: boolean;
  loadError: boolean;
  axes: FontAxisOption[];
  axis: string | null;
  onAxisChange: (axis: string) => void;
  weights: number[];
  weight: number;
  onWeightChange: (weight: number) => void;
  slideList: number[];
  currentSlide: number;
  currentSize: number;
  onSizeChange: (size: number) => void;
  stackText: string;
  onStackTextChange: (text: string) => void;
  page: number;
  onPageChange: (page: number) => void;
};

function SpecimenColumn({
  lang,
  font,
  fontFamilyCss,
  fontVariation,
  effectiveSize,
  fontLoaded,
  loadError,
  axes,
  axis,
  onAxisChange,
  weights,
  weight,
  onWeightChange,
  slideList,
  currentSlide,
  currentSize,
  onSizeChange,
  stackText,
  onStackTextChange,
  page,
  onPageChange,
}: SpecimenColumnProps) {
  const notLoaded = !fontLoaded && !loadError;
  const baseTextStyle: CSSProperties = {
    fontFamily: fontFamilyCss,
    fontWeight: weight,
    fontVariationSettings: fontVariation,
    fontSize: `${effectiveSize}px`,
    wordBreak: "break-word",
  };

  return (
    <div className="bg-modal-header-bg border-border relative flex h-[340px] flex-shrink-0 flex-col justify-between border-b p-4 sm:p-5 md:h-full md:border-e md:border-b-0">
      <SpecimenControls
        lang={lang}
        currentSlide={currentSlide}
        axes={axes}
        axis={axis}
        onAxisChange={onAxisChange}
        weights={weights}
        weight={weight}
        onWeightChange={onWeightChange}
        currentSize={currentSize}
        onSizeChange={onSizeChange}
      />

      <div
        className="relative my-1 w-full flex-1 overflow-hidden"
        id="modal-spec-content"
      >
        {currentSlide === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center overflow-y-auto p-3">
            <SpecimenText
              key={`${font.family}-specimen`}
              html={DEFAULT_SPECIMEN}
              dir="auto"
              notLoaded={notLoaded}
              style={{ ...baseTextStyle, lineHeight: 1.35 }}
            />
          </div>
        )}

        {currentSlide === 1 && (
          <StackSlide
            font={font}
            weights={weights}
            fontFamilyCss={fontFamilyCss}
            axis={axis}
            stackText={stackText}
            onStackTextChange={onStackTextChange}
            effectiveSize={effectiveSize}
          />
        )}

        {currentSlide === 2 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center overflow-y-auto p-3 [direction:ltr]">
            <SpecimenText
              key={`${font.family}-english`}
              html={buildEnglishSpecimen()}
              dir="ltr"
              notLoaded={notLoaded}
              style={{ ...baseTextStyle, lineHeight: 1.4 }}
            />
          </div>
        )}
      </div>

      <SlidePager
        slideList={slideList}
        page={page}
        onPageChange={onPageChange}
      />
    </div>
  );
}

type InfoRowProps = {
  label: string;
  children: ReactNode;
  title?: string;
  interactive?: boolean;
  valueClassName?: string;
};

function InfoRow({
  label,
  children,
  title,
  interactive = false,
  valueClassName = "",
}: InfoRowProps) {
  return (
    <div
      className={`flex items-center justify-between gap-4 py-3 text-sm ${
        interactive ? "cursor-help" : ""
      }`}
      title={title}
    >
      <span className="text-secondary font-fa shrink-0 font-semibold">
        {label}
      </span>
      <span
        className={`text-primary font-fa text-end font-medium ${valueClassName}`}
      >
        {children}
      </span>
    </div>
  );
}

type ModalActionsProps = {
  t: Record<string, string>;
  copied: boolean;
  onCopy: () => void;
  downloadHref: string;
  sourceHref: string;
};

function ModalActions({
  t,
  copied,
  onCopy,
  downloadHref,
  sourceHref,
}: ModalActionsProps) {
  return (
    <div className="mt-auto grid grid-cols-1 gap-2.5 pt-2 sm:grid-cols-3">
      <a
        className="border-text-primary bg-primary text-surface font-fa flex cursor-pointer items-center justify-center rounded-full border px-3 py-2.5 text-center text-xs font-semibold shadow-xs transition-all hover:opacity-90"
        href={downloadHref}
        target="_blank"
        rel="noopener noreferrer"
      >
        {t.dlDirect}
      </a>
      <a
        className="border-border bg-card-bg text-primary hover:border-text-secondary font-fa flex cursor-pointer items-center justify-center rounded-full border px-3 py-2.5 text-center text-xs font-semibold transition-colors"
        href={sourceHref}
        target="_blank"
        rel="noopener noreferrer"
      >
        {t.dlSource}
      </a>
      <button
        className={`font-fa flex cursor-pointer items-center justify-center rounded-full border px-3 py-2.5 text-center text-xs font-semibold transition-all ${
          copied
            ? "bg-primary text-surface border-text-primary"
            : "border-border bg-card-bg text-primary hover:border-text-secondary"
        }`}
        type="button"
        onClick={onCopy}
      >
        {copied ? t.copied : t.copyCss}
      </button>
    </div>
  );
}

type DetailsPanelProps = {
  t: Record<string, string>;
  font: Font;
  lang: Language;
  meta: FontMeta;
  copied: boolean;
  onCopy: () => void;
  titleRef: RefObject<HTMLHeadingElement | null>;
};

function FontInfoRows({
  t,
  font,
  lang,
  meta,
}: {
  t: Record<string, string>;
  font: Font;
  lang: Language;
  meta: FontMeta;
}) {
  const styleLabel =
    meta.styleLabels[font.styleKey ?? ""][lang] ?? font.styleKey;
  const styleNote = STYLE_NOTES[font.styleKey ?? ""]?.[lang];
  const licenseNote = LICENSE_NOTES[font.license ?? ""]?.[lang];
  const langsText = buildLanguagesText(font, lang);
  const designerName = font.designer?.[lang];
  const noteText = font.note?.[lang];

  return (
    <div className="border-border/40 divide-border/30 my-6 divide-y border-y">
      <InfoRow
        label={t.style}
        title={styleNote}
        interactive
        valueClassName="border-text-primary/40 hover:border-text-primary border-b border-dashed transition-colors"
      >
        {styleLabel}
      </InfoRow>

      {font.license && (
        <InfoRow
          label={t.licenseLabel}
          title={licenseNote}
          interactive
          valueClassName="border-text-primary/40 hover:border-text-primary border-b border-dashed font-mono text-xs transition-colors"
        >
          {font.license}
        </InfoRow>
      )}

      <InfoRow label={t.weights}>{formatWeightsText(font, lang)}</InfoRow>

      {designerName && <InfoRow label={t.designer}>{designerName}</InfoRow>}

      {langsText && <InfoRow label={t.languages}>{langsText}</InfoRow>}

      {noteText && (
        <InfoRow
          label={t.note}
          valueClassName="text-yellow-800 dark:text-yellow-200"
        >
          {noteText}
        </InfoRow>
      )}
    </div>
  );
}

function DetailsPanel({
  t,
  font,
  lang,
  meta,
  copied,
  onCopy,
  titleRef,
}: DetailsPanelProps) {
  const fontTitle = font.name?.[lang] ?? font.family;
  const fontDesc = font.description?.[lang] ?? "";

  return (
    <div className="bg-modal-body-bg flex h-full flex-col justify-between overflow-y-auto p-6 sm:p-7">
      <div className="flex flex-col">
        <div className="mb-1">
          <h2
            id="modal-title"
            tabIndex={-1}
            ref={titleRef}
            className="text-strong font-fa text-2xl font-bold tracking-tight"
          >
            {fontTitle}
          </h2>
          {fontDesc && (
            <p className="text-secondary font-fa mt-2 text-sm leading-relaxed">
              {fontDesc}
            </p>
          )}
        </div>

        <FontInfoRows t={t} font={font} lang={lang} meta={meta} />
      </div>

      <ModalActions
        t={t}
        copied={copied}
        onCopy={onCopy}
        downloadHref={font["download-link"] ?? "#"}
        sourceHref={font["source-link"] ?? "#"}
      />
    </div>
  );
}

export default function FontModal() {
  const { lang } = useAppearance();
  const t = T[lang];
  const { meta } = useFontCatalog();
  const { modal } = useFontExplore();
  const {
    font: modalFont,
    close: closeModal,
    page: modalPage,
    setPage: setModalPage,
    weight: modalWeight,
    setWeight: setModalWeight,
    axis: modalAxis,
    setAxis: setModalAxis,
  } = modal;

  const { activeFont, isClosing } = useActiveFontTransition(modalFont);
  const { stackText, setStackText, sizes, setSizes } =
    useSpecimenState(modalFont);
  const { ready: fontLoaded, error: loadError } = useFontFace(
    activeFont,
    modalWeight,
    modalAxis
  );

  const [copied, setCopied] = useState<boolean>(false);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useBodyScrollLock(Boolean(activeFont));
  useModalDefaults(modalFont, {
    setAxis: setModalAxis,
    setWeight: setModalWeight,
    setPage: setModalPage,
  });

  const handleClose = useCallback(() => {
    if (isClosing) return;
    closeModal();
  }, [closeModal, isClosing]);

  useEscapeToClose(Boolean(activeFont) && !isClosing, handleClose);

  useEffect(() => {
    if (activeFont) titleRef.current?.focus();
  }, [activeFont]);

  if (!activeFont) return null;

  const font = activeFont;
  const axes = getFontAxes(font);
  const weights = availableWeights(font, modalAxis);
  const slideList = weights.length > 1 ? [0, 1, 2] : [0, 2];
  const currentSlide = slideList[modalPage] ?? 0;
  const currentSize = sizes[currentSlide] ?? 32;
  const effectiveSize = resolvePreviewSize(currentSize, 10);

  const handleSizeChange = (value: number) => {
    setSizes(prev => {
      const next = [...prev];
      next[currentSlide] = value;
      return next;
    });
  };

  const handleCopyCSS = async () => {
    const css = generateFontCSS(font, modalAxis);

    try {
      if ("clipboard" in navigator && window.isSecureContext) {
        await navigator.clipboard.writeText(css);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = css;
        textarea.style.position = "fixed";
        textarea.style.top = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      setCopied(true);
      setTimeout(() => setCopied(false), COPY_FEEDBACK_MS);
    } catch (err) {
      console.error("Failed to copy CSS", err);
    }
  };

  return (
    <div
      className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
      id="modal"
      role="dialog"
    >
      <ModalBackdrop isClosing={isClosing} onClose={handleClose} />

      <div
        className={`border-border bg-card-bg relative z-10 grid max-h-[90vh] w-full max-w-5xl grid-cols-1 overflow-y-auto rounded-3xl border shadow-2xl md:h-[88vh] md:max-h-[600px] md:grid-cols-[1.3fr_1fr] md:overflow-hidden ${
          isClosing ? "modal-card-out" : "modal-card-in"
        }`}
      >
        <ModalCloseButton onClose={handleClose} />

        <SpecimenColumn
          lang={lang}
          font={font}
          fontFamilyCss={familyCSS(font, modalAxis)}
          fontVariation={fontVariationSettingsCSS(font, modalWeight, modalAxis)}
          effectiveSize={effectiveSize}
          fontLoaded={fontLoaded}
          loadError={loadError}
          axes={axes}
          axis={modalAxis}
          onAxisChange={setModalAxis}
          weights={weights}
          weight={modalWeight}
          onWeightChange={setModalWeight}
          slideList={slideList}
          currentSlide={currentSlide}
          currentSize={currentSize}
          onSizeChange={handleSizeChange}
          stackText={stackText}
          onStackTextChange={setStackText}
          page={modalPage}
          onPageChange={setModalPage}
        />

        <DetailsPanel
          t={t}
          font={font}
          lang={lang}
          meta={meta}
          copied={copied}
          onCopy={() => {
            void handleCopyCSS();
          }}
          titleRef={titleRef}
        />
      </div>
    </div>
  );
}
