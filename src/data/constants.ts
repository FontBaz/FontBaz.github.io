import type { FaqItem, HeroSlide, Language } from "../types";

export const FONTS_DATA_URL =
  "https://cdn.jsdelivr.net/gh/alr-rashidi/Awesome-Persian-Fonts/data/fonts.json";

export const HERO_SLIDES: HeroSlide[] = [
  { image: "amiri.webp", family: "amiri" },
  { image: "arad.webp", family: "aradvf" },
  { image: "ario.webp", family: "ario" },
  { image: "mim-bold.webp", family: "mim-bold" },
  { image: "iranNastaliq.webp", family: "iranNastaliq" },
  { image: "mikhak.webp", family: "mikhak" },
  { image: "rooyinFree.webp", family: "rooyinFree" },
  { image: "vira.webp", family: "vira" },
  { image: "xb-titre.webp", family: "xb-titre" },
  { image: "xp-vosta.webp", family: "xp-vosta" },
];

export const SLIDES_DIR = "/images/slides/";

export const LANG_LABELS: Record<
  string,
  { en: string; fa: string } | undefined
> = {
  fa: { en: "Persian", fa: "فارسی" },
  ar: { en: "Arabic", fa: "عربی" },
  ckb: { en: "Kurdish", fa: "کردی" },
  la: { en: "English", fa: "انگلیسی" },
  ps: { en: "Pashto", fa: "پشتو" },
  sd: { en: "Sindhi", fa: "سندی" },
  ug: { en: "Uyghur", fa: "اویغوری" },
  ur: { en: "Urdu", fa: "اردو" },
};

export function langLabel(code: string, lang: Language): string {
  const labelObj = LANG_LABELS[code];
  return labelObj ? labelObj[lang] || code : code;
}

export const LICENSE_NOTES: Record<
  string,
  { en: string; fa: string } | undefined
> = {
  OFL: {
    en: "Open, free for any use; modifiable and redistributable with credit",
    fa: "آزاد، رایگان برای هر کاربرد؛ قابل تغییر و بازتوزیع با ذکر منبع",
  },
  GPL: {
    en: "Free, copyleft; derivatives must stay under GPL",
    fa: "آزاد، کپی‌لفت؛ مشتقات باید تحت GPL بمانند",
  },
  Apache: {
    en: "Open, permissive; keep the notice",
    fa: "آزاد، مجوز؛ حفظ اعلان",
  },
  BVL: {
    en: "Free for personal and commercial use",
    fa: "آزاد برای استفاده شخصی و تجاری",
  },
};

export const STYLE_NOTES: Record<
  string,
  { en: string; fa: string } | undefined
> = {
  sans: {
    en: "Clean, modern sans-serif with even strokes",
    fa: "سنسِ مدرن و تمیز با خطوطی یکنواخت",
  },
  serif: {
    en: "Traditional serif with finishing strokes",
    fa: "سریف سنتی با انتهای خطوط تزئینی",
  },
  display: {
    en: "Bold display face for headlines and posters",
    fa: "فونتِ نمایشیِ درشت برای تیتر و پوستر",
  },
  decorative: {
    en: "Decorative; Suited for special designs",
    fa: "تزئینی؛ مناسب طراحی‌های خاص",
  },
  monospace: {
    en: "Fixed-width; every glyph shares the same advance",
    fa: "هر نویسه پهنای برابر دارد",
  },
  nastaliq: { en: "Persian calligraphic script", fa: "خط خوشنویسی فارسی" },
  pixel: {
    en: "Pixel glyphs reminiscent of retro games",
    fa: "حروف پیکسلی شبیه به بازی‌های قدیمی",
  },
  casual: {
    en: "Friendly, informal everyday face",
    fa: "دوستانه و غیررسمی برای استفادهٔ روزمره",
  },
};

export const STYLE_ICONS: Record<
  string,
  { fa: string; en: string } | undefined
> = {
  sans: {
    fa: "/images/style-icons/sans.webp",
    en: "/images/style-icons/sans-en.webp",
  },
  serif: {
    fa: "/images/style-icons/serif.webp",
    en: "/images/style-icons/serif-en.webp",
  },
  display: {
    fa: "/images/style-icons/display.webp",
    en: "/images/style-icons/display-en.webp",
  },
  decorative: {
    fa: "/images/style-icons/decorative.webp",
    en: "/images/style-icons/decorative-en.webp",
  },
  monospace: {
    fa: "/images/style-icons/monospace.webp",
    en: "/images/style-icons/monospace-en.webp",
  },
  nastaliq: {
    fa: "/images/style-icons/nastaliq.webp",
    en: "/images/style-icons/nastaliq-en.webp",
  },
  pixel: {
    fa: "/images/style-icons/pixel.webp",
    en: "/images/style-icons/pixel-en.webp",
  },
  casual: {
    fa: "/images/style-icons/casual.webp",
    en: "/images/style-icons/casual-en.webp",
  },
};

export const DEFAULT_SPECIMEN =
  "ضحاک ژنده‌پوش، غازچرانِ خبیثِ عصمت‌السلطنه ظفرقندی جذام گرفت.";
export const STACK_TEXT = "ضحاک ژنده‌پوش جذام گرفت";
export const ENGLISH_TEXT = "A quick brown fox jumps over the lazy dog.";
export const ENGLISH_NUMS = "0987654321\n۰۹۸۷۶۵۴۳۲۱";
export const ENGLISH_SYMS = "$ @ ﷼ & % # * + − = / \\ < > { } [ ]";

export const T: Record<Language, Record<string, string>> = {
  en: {
    brand: "FontBaz",
    hero: "Write Persian, more beautifully",
    sub: "A collection of free and open-licensed Persian fonts for developers and designers.",
    explore: "Explore fonts",
    nameSearch: "Search font names…",
    style: "Style",
    language: "Language",
    weightCount: "Weights",
    variable: "Variable",
    reset: "Reset",
    noResults: "No fonts match your filters.",
    loadingFonts: "Loading fonts…",
    previewPh: "Write something to preview fonts",
    size: "Size",
    dlDirect: "Direct download",
    dlSource: "View source",
    note: "Note",
    designer: "Designer",
    languages: "Supports",
    license: "License",
    weights: "weights",
    copyCss: "Copy CSS",
    copied: "Copied!",
    pinFont: "Pin font",
    unpinFont: "Unpin font",
    footerStar: "Don't forget to star us on {github} :)",
    faq: "FAQ",
    default: "Default",
    normal: "Normal",
    font: "Font"

  },
  fa: {
    brand: "فونت‌باز",
    hero: "فارسی را زیباتر بنویسید",
    sub: "مجموعه‌ای از فونت‌های فارسی رایگان و دارای مجوز باز برای توسعه‌دهندگان و طراحان.",
    explore: "کاوش در فونت‌ها",
    nameSearch: "جستجو نام فونت‌ها…",
    style: "سبک",
    language: "زبان",
    weightCount: "تعداد وزن",
    variable: "متغیر",
    reset: "بازنشانی",
    noResults: "هیچ فونتی با پالایش شما همخوان نیست.",
    loadingFonts: "در حال بارگیری قلم‌ها…",
    previewPh: "برای پیش‌نمایش فونت‌ها چیزی بنویسید",
    size: "اندازه",
    dlDirect: "دریافت مستقیم",
    dlSource: "مشاهده منبع",
    note: "یادداشت",
    designer: "طراح",
    languages: "پشتیبانی",
    license: "مجوز",
    weights: "وزن",
    copyCss: "رونویسی CSS",
    copied: "رونویسی شد!",
    pinFont: "سنجاق کردن",
    unpinFont: "برداشتن سنجاق",
    footerStar: "ستاره دادن به ما در {github} فراموش نشه :)",
    faq: "پرسش‌های متداول",
    default: "پیشفرض",
    normal: "معمولی",
    font: "فونت"
  },
};

export const FAQ: FaqItem[] = [
  {
    q: { fa: "فونت انگلیسی هم دارید؟", en: "Do you have English fonts?" },
    a: {
      fa: "خیر، تمرکز ما روی فونت‌های فارسیه، ولی می‌تونید از Google Fonts یا Font Squirrel یا Font Library فونت‌های انگلیسی هم دریافت کنید.",
      en: "No, our focus is on Persian fonts, but you can get English fonts from Google Fonts or Font Squirrel or Font Library.",
    },
    links: {
      "Google Fonts": "https://fonts.google.com",
      "Font Squirrel": "https://www.fontsquirrel.com",
      "Font Library": "https://fontlibrary.org",
    },
  },
  {
    q: {
      fa: "تفاوت فونت رایگان و آزاد چیه؟",
      en: "What's the difference between free and open-licensed fonts?",
    },
    a: {
      fa: "شما با فونت‌های رایگان موجود در اینترنت فقط مجوز استفاده شخصی دارید (مگر اینکه فونت رو خریداری کنید)، ولی با فونت‌هایی که مجوز آزاد دارن می‌تونید کتاب چاپ کنید، پوستر تجاری طراحی کنید و…\nولی پیش از استفاده تجاری؛ بهتره مجوز خود فونت رو بررسی کنید.",
      en: "With free fonts found on the internet you typically only have personal-use rights (unless you purchase the font), but with open-licensed fonts you can print books, design corporate posters, and more.\nStill, before commercial use, it's best to check the font's own license.",
    },
  },
  {
    q: {
      fa: "آیا می‌تونم متن پیش‌نمایش رو ویرایش کنم؟",
      en: "Can I edit the font preview text?",
    },
    a: {
      fa: "بله، می‌تونین پیش‌نمایش هر فونتی که باز کردید رو ویرایش کنید.",
      en: "Yes, you can edit the preview of any font you opened.",
    },
  },
];

export const GH_URL = "https://github.com/alr-rashidi/Awesome-Persian-Fonts";
