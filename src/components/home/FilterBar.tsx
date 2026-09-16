import { useEffect, useMemo, useState } from "react";

import type { FontExploreContextType, FontMeta, Language } from "../../types";

import { useAppearance } from "../../context/appearance-context";
import { useFontCatalog, useFontExplore } from "../../context/font-context";
import { langLabel, STYLE_ICONS, STYLE_NOTES, T } from "../../data/constants";

function pillClass(isActive: boolean, isOpen: boolean = false): string {
  return `font-inherit inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-1 text-[0.85rem] transition-all ${
    isActive
      ? "bg-primary text-surface border-text-primary font-semibold shadow-xs"
      : "bg-card-bg/60 text-secondary border-border hover:border-text-secondary hover:text-strong"
  } ${isOpen ? "border-text-primary ring-text-primary/30 ring-1" : ""}`;
}

function panelClass(minWidthClass: string): string {
  return `border-border bg-card-bg absolute inset-s-0 top-[calc(100%+6px)] z-40 flex max-h-60 ${minWidthClass} scrollbar-none flex-col gap-0.5 overflow-y-auto rounded-xl border p-1.5 shadow-lg`;
}

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function FilterLabel({ children }: { children: string }) {
  return (
    <span className="text-tertiary cursor-default text-[0.7rem] font-semibold tracking-widest uppercase select-none after:content-[':']">
      {children}
    </span>
  );
}

function DropdownTrigger({
  label,
  isActive,
  isOpen,
  onToggle,
}: {
  label: string;
  isActive: boolean;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      className={pillClass(isActive, isOpen)}
      type="button"
      onClick={e => {
        e.stopPropagation();
        onToggle();
      }}
    >
      {label}
      <ChevronIcon isOpen={isOpen} />
    </button>
  );
}

type DropdownOption = {
  value: string;
  label: string;
  count?: number;
};

type MultiDropdownProps = {
  labelText: string;
  options: DropdownOption[];
  selection: Record<string, boolean>;
  onChange: (value: string, isChecked: boolean) => void;
  isOpen: boolean;
  onToggle: () => void;
};

function MultiDropdown({
  labelText,
  options,
  selection,
  onChange,
  isOpen,
  onToggle,
}: MultiDropdownProps) {
  const selectedCount = options.filter(o => selection[o.value]).length;
  const buttonText = selectedCount
    ? selectedCount === 1
      ? (options.find(o => selection[o.value])?.label ?? "")
      : `${labelText} · ${selectedCount}`
    : labelText;

  return (
    <div className="dropdown-container relative flex items-center gap-2">
      <FilterLabel>{labelText}</FilterLabel>
      <div className="relative inline-block">
        <DropdownTrigger
          label={buttonText}
          isActive={selectedCount > 0}
          isOpen={isOpen}
          onToggle={onToggle}
        />

        {isOpen && (
          <div className={panelClass("min-w-50")}>
            {options.map(opt => (
              <label
                key={opt.value}
                className="text-primary hover:bg-surface flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-1.5 text-[0.85rem] transition-colors select-none"
              >
                <input
                  type="checkbox"
                  className="border-border text-primary accent-text-primary cursor-pointer rounded"
                  checked={selection[opt.value]}
                  onChange={e => {
                    onChange(opt.value, e.target.checked);
                  }}
                />
                <span className="flex-1 truncate">
                  {opt.label}
                  {opt.count != null ? (
                    <span className="text-tertiary ms-1 text-xs">
                      ({opt.count})
                    </span>
                  ) : null}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

type SingleDropdownOption = {
  value: number | null;
  label: string;
};

type SingleDropdownProps = {
  options: SingleDropdownOption[];
  value: number | null;
  onChange: (value: number | null) => void;
  isOpen: boolean;
  onToggle: () => void;
};

function SingleDropdown({
  options,
  value,
  onChange,
  isOpen,
  onToggle,
}: SingleDropdownProps) {
  const cur = options.find(o => o.value === value);

  return (
    <div className="dropdown-container relative inline-block">
      <DropdownTrigger
        label={cur ? cur.label : "—"}
        isActive={value != null}
        isOpen={isOpen}
        onToggle={onToggle}
      />

      {isOpen && (
        <div className={panelClass("min-w-30")}>
          {options.map(opt => (
            <label
              key={String(opt.value)}
              className="text-primary hover:bg-surface flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-1.5 text-[0.85rem] transition-colors select-none"
            >
              <input
                type="radio"
                name="weightCountRadio"
                className="text-primary accent-text-primary cursor-pointer"
                checked={value === opt.value}
                onChange={() => {
                  onChange(opt.value);
                  onToggle();
                }}
              />
              <span className="flex-1">{opt.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

type StyleRowProps = {
  label: string;
  lang: Language;
  meta: FontMeta;
  selectedStyle: string | null;
  setFilter: FontExploreContextType["setFilter"];
};

function StyleRow({
  label,
  lang,
  meta,
  selectedStyle,
  setFilter,
}: StyleRowProps) {
  return (
    <div className="flex flex-wrap items-center gap-2" id="style-row">
      <FilterLabel>{label}</FilterLabel>
      <div className="flex flex-wrap items-center gap-1.5">
        {meta.styleOptions.map(s => {
          const iconConfig = STYLE_ICONS[s];
          const imgSrc = iconConfig
            ? iconConfig[lang] || iconConfig.fa
            : `/images/style-icons/${s}.webp`;
          const styleLabelObj = meta.styleLabels[s];
          const altText = styleLabelObj[lang] ?? s;
          const isSelected = selectedStyle === s;
          const note = STYLE_NOTES[s];
          const noteText = note ? note[lang] || "" : "";
          const tooltipText = noteText || altText;

          return (
            <button
              key={s}
              type="button"
              className={`group relative inline-flex h-8 w-auto cursor-pointer items-center justify-center rounded-full border px-3 transition-all ${
                isSelected
                  ? "bg-primary text-surface border-text-primary scale-105 shadow-xs"
                  : "bg-card-bg/60 text-secondary border-border hover:border-text-secondary hover:text-strong"
              }`}
              onClick={() => setFilter("style", isSelected ? null : s)}
              title={tooltipText}
            >
              <img
                src={imgSrc}
                className={`style-filter-img h-4.5 w-auto object-contain transition-all ${
                  isSelected
                    ? "is-selected"
                    : "opacity-90 group-hover:opacity-100"
                }`}
                alt={altText}
                referrerPolicy="no-referrer"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

type FilterOptionsRowProps = {
  t: Record<string, string>;
  licenseOptions: DropdownOption[];
  languageOptions: DropdownOption[];
  weightOptions: SingleDropdownOption[];
  licenses: Record<string, boolean>;
  langs: Record<string, boolean>;
  weightCount: number | null;
  variableMode: boolean | null;
  isAnyFilterActive: boolean;
  activeDropdown: string | null;
  onToggleDropdown: (id: string) => void;
  onLicenseChange: (lic: string, isChecked: boolean) => void;
  onLangChange: (lg: string, isChecked: boolean) => void;
  onWeightCountChange: (value: number | null) => void;
  onToggleVariable: () => void;
  onReset: () => void;
};

function FilterOptionsRow({
  t,
  licenseOptions,
  languageOptions,
  weightOptions,
  licenses,
  langs,
  weightCount,
  variableMode,
  isAnyFilterActive,
  activeDropdown,
  onToggleDropdown,
  onLicenseChange,
  onLangChange,
  onWeightCountChange,
  onToggleVariable,
  onReset,
}: FilterOptionsRowProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 pt-0.5" id="facets-row">
      <MultiDropdown
        labelText={t.license}
        options={licenseOptions}
        selection={licenses}
        onChange={onLicenseChange}
        isOpen={activeDropdown === "license"}
        onToggle={() => onToggleDropdown("license")}
      />

      <MultiDropdown
        labelText={t.language}
        options={languageOptions}
        selection={langs}
        onChange={onLangChange}
        isOpen={activeDropdown === "language"}
        onToggle={() => onToggleDropdown("language")}
      />

      <div className="flex items-center gap-2">
        <FilterLabel>{t.weightCount}</FilterLabel>
        <SingleDropdown
          options={weightOptions}
          value={weightCount}
          onChange={onWeightCountChange}
          isOpen={activeDropdown === "weightCount"}
          onToggle={() => onToggleDropdown("weightCount")}
        />
      </div>

      <button
        className={pillClass(Boolean(variableMode))}
        type="button"
        onClick={onToggleVariable}
      >
        {t.variable}
      </button>

      {isAnyFilterActive && (
        <button
          className="text-secondary hover:text-primary ms-auto cursor-pointer border-none bg-transparent text-[0.85rem] font-semibold underline underline-offset-2 transition-colors"
          type="button"
          onClick={onReset}
        >
          {t.reset}
        </button>
      )}
    </div>
  );
}

function buildLicenseOptions(meta: FontMeta): DropdownOption[] {
  return Object.keys(meta.licCounts)
    .sort((a, b) => meta.licCounts[b] - meta.licCounts[a])
    .map(l => ({ value: l, label: l, count: meta.licCounts[l] }));
}

function buildLanguageOptions(
  meta: FontMeta,
  lang: Language
): DropdownOption[] {
  return meta.langFilterOptions.map(lg => {
    const label = langLabel(lg, lang);
    return {
      value: lg,
      label,
      count: meta.langCounts[lg],
    };
  });
}

const WEIGHT_COUNT_OPTIONS: SingleDropdownOption[] = [
  { value: null, label: "—" },
  ...Array.from({ length: 10 }, (_, index) => ({
    value: index + 1,
    label: String(index + 1),
  })),
];

export default function FilterBar() {
  const { lang } = useAppearance();
  const t = T[lang];
  const { meta } = useFontCatalog();
  const { filters, setFilter, resetFilters, isAnyFilterActive } =
    useFontExplore();
  const { style, licenses, langs, weightCount, variableMode } = filters;

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const licenseOptions = useMemo(() => buildLicenseOptions(meta), [meta]);
  const languageOptions = useMemo(
    () => buildLanguageOptions(meta, lang),
    [meta, lang]
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      if (!target.closest(".dropdown-container")) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const toggleDropdown = (id: string) => {
    setActiveDropdown(prev => (prev === id ? null : id));
  };

  const handleLicenseChange = (lic: string, isChecked: boolean) => {
    setFilter("licenses", prev => ({ ...prev, [lic]: isChecked }));
  };

  const handleLangChange = (lg: string, isChecked: boolean) => {
    setFilter("langs", prev => ({ ...prev, [lg]: isChecked }));
  };

  return (
    <section className="border-border bg-surface border-b py-4" id="filter-bar">
      <div className="container-main flex flex-col gap-3 px-6">
        <StyleRow
          label={t.style}
          lang={lang}
          meta={meta}
          selectedStyle={style}
          setFilter={setFilter}
        />

        <FilterOptionsRow
          t={t}
          licenseOptions={licenseOptions}
          languageOptions={languageOptions}
          weightOptions={WEIGHT_COUNT_OPTIONS}
          licenses={licenses}
          langs={langs}
          weightCount={weightCount}
          variableMode={variableMode}
          isAnyFilterActive={isAnyFilterActive}
          activeDropdown={activeDropdown}
          onToggleDropdown={toggleDropdown}
          onLicenseChange={handleLicenseChange}
          onLangChange={handleLangChange}
          onWeightCountChange={value => setFilter("weightCount", value)}
          onToggleVariable={() =>
            setFilter("variableMode", variableMode ? null : true)
          }
          onReset={resetFilters}
        />
      </div>
    </section>
  );
}
