import React, { useEffect, useRef } from "react";

import { useAppearance } from "../../context/appearance-context";
import { T } from "../../data/constants";

export default function Header() {
  const { lang, setLang, toggleTheme } = useAppearance();
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        document.documentElement.style.setProperty(
          "--header-h",
          `${headerRef.current.offsetHeight}px`
        );
      }
    };

    updateHeaderHeight();

    const handleScroll = () => {
      if (headerRef.current) {
        if (window.scrollY > 20) {
          headerRef.current.classList.add("shadow-xs", "py-2");
          headerRef.current.classList.remove("py-4");
        } else {
          headerRef.current.classList.remove("shadow-xs", "py-2");
          headerRef.current.classList.add("py-4");
        }

        updateHeaderHeight();
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", updateHeaderHeight);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateHeaderHeight);
    };
  }, []);

  return (
    <header
      ref={headerRef}
      className="bg-surface border-border sticky top-0 z-30 border-b py-4 transition-all duration-300"
    >
      <div className="container-main flex items-center justify-between px-10">
        <a
          href="/"
          className="text-primary hover:text-strong font-inherit flex cursor-pointer items-center border-none bg-transparent p-0 text-[1.05rem] font-bold tracking-tight no-underline transition-colors"
          onClick={(e: React.MouseEvent) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <img src="/images/icon.png" className="h-8 dark:invert" alt="" />
          {T[lang].brand}
        </a>

        <div className="flex items-center gap-2.5">
          <button
            className="border-border bg-card-bg text-primary hover:text-strong hover:bg-tertiary/20 flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-full border transition-colors duration-200"
            type="button"
            onClick={toggleTheme}
          >
            <svg
              className="block dark:hidden"
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="4.2" />
              <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.6 4.6l1.8 1.8M17.6 17.6l1.8 1.8M4.6 19.4l1.8-1.8M17.6 6.4l1.8-1.8" />
            </svg>
            <svg
              className="hidden dark:block"
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </button>

          <div className="bg-card-bg border-border inline-flex rounded-full border p-1 text-[0.85rem]">
            <button
              className={`font-inherit cursor-pointer rounded-full border-none px-3.5 py-1 transition-colors duration-200 ${
                lang === "en"
                  ? "bg-primary text-surface font-semibold"
                  : "text-secondary hover:text-strong bg-transparent"
              }`}
              type="button"
              onClick={() => setLang("en")}
            >
              EN
            </button>
            <button
              className={`font-inherit font-fa cursor-pointer rounded-full border-none px-3.5 py-1 transition-colors duration-200 ${
                lang === "fa"
                  ? "bg-primary text-surface font-semibold"
                  : "text-secondary hover:text-strong bg-transparent"
              }`}
              type="button"
              onClick={() => setLang("fa")}
            >
              فا
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
