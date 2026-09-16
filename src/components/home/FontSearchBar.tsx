import { useEffect, useRef } from "react";

import { useAppearance } from "../../context/appearance-context";
import { useFontExplore } from "../../context/font-context";
import { T } from "../../data/constants";

export default function FontSearchBar() {
  const { lang } = useAppearance();
  const t = T[lang];
  const { filters, setFilter, preview } = useFontExplore();
  const { query } = filters;
  const {
    text: previewText,
    size: previewSize,
    setText: setPreviewText,
    setSize: setPreviewSize,
  } = preview;

  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const modal = document.getElementById("modal");
      if (modal) return;

      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "f" || e.key === "F" || e.code === "KeyF")
      ) {
        const input = nameInputRef.current;

        if (input) {
          e.preventDefault();
          const headerH =
            parseInt(
              getComputedStyle(document.documentElement).getPropertyValue(
                "--header-h"
              ),
              10
            ) || 64;
          const bar = document.getElementById("preview-bar");
          const top =
            (bar ?? input).getBoundingClientRect().top +
            window.scrollY -
            headerH -
            12;
          window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
          input.focus();
          input.select();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <section
      className="border-border bg-surface border-b py-3.5 transition-all"
      id="preview-bar"
    >
      <div className="container-main flex flex-wrap items-center gap-3 px-6">
        <div className="relative max-w-xs min-w-[140px] flex-1 basis-[200px]">
          <input
            ref={nameInputRef}
            className="border-border bg-card-bg text-primary placeholder:text-tertiary/80 focus:border-text-primary focus:ring-text-primary/30 w-full rounded-full border py-2 ps-4 pe-9 text-sm transition-all focus:ring-1 focus:outline-none"
            id="name-search"
            type="search"
            placeholder={t.nameSearch}
            value={query}
            onChange={e => setFilter("query", e.target.value.toLowerCase())}
          />
          {query.length > 0 && (
            <button
              className="text-secondary hover:text-primary hover:bg-surface absolute end-2 top-1/2 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-none"
              type="button"
              onClick={() => {
                setFilter("query", "");
                if (nameInputRef.current) nameInputRef.current.focus();
              }}
            >
              ✕
            </button>
          )}
        </div>

        <div className="relative max-w-lg min-w-[160px] flex-2 basis-[260px]">
          <input
            className="border-border bg-card-bg text-primary placeholder:text-tertiary/80 focus:border-text-primary focus:ring-text-primary/30 font-fa w-full rounded-full border py-2 ps-4 pe-9 text-sm transition-all focus:ring-1 focus:outline-none"
            type="text"
            placeholder={t.previewPh}
            value={previewText}
            onChange={e => setPreviewText(e.target.value)}
          />
          {previewText.length > 0 && (
            <button
              className="text-secondary hover:text-primary hover:bg-surface absolute end-2 top-1/2 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-none"
              type="button"
              onClick={() => setPreviewText("")}
            >
              ✕
            </button>
          )}
        </div>

        <div className="ms-auto flex items-center gap-2">
          <span className="text-tertiary cursor-default font-mono text-xs select-none">
            {previewSize}px
          </span>
          <input
            className="bg-border accent-text-primary h-1.5 w-24 cursor-pointer appearance-none rounded-lg sm:w-32"
            type="range"
            min="12"
            max="120"
            value={String(previewSize)}
            onChange={e => setPreviewSize(parseInt(e.target.value, 10) || 16)}
          />
        </div>
      </div>
    </section>
  );
}
