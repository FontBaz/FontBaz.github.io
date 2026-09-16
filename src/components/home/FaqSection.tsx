import { useState } from "react";

import type { FaqItem, Language } from "../../types";

import { useAppearance } from "../../context/appearance-context";
import { FAQ } from "../../data/constants";

function renderFaqAnswer(item: FaqItem, lang: Language): { __html: string } {
  const text = item.a[lang] || "";
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");

  if (item.links) {
    for (const [name, url] of Object.entries(item.links)) {
      const linkHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-primary font-medium underline underline-offset-2 hover:text-strong">${name}</a>`;
      html = html.split(name).join(linkHtml);
    }
  }

  return { __html: html };
}

export default function FaqSection() {
  const { lang } = useAppearance();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleIndex = (idx: number) => {
    setOpenIndex(prev => (prev === idx ? null : idx));
  };

  return (
    <section className="container-main my-16 px-6" id="faq">
      <h2 className="text-strong font-fa mb-6 text-center text-2xl font-bold">
        {lang === "fa" ? "پرسش‌های رایج" : "FAQ"}
      </h2>

      <div className="flex flex-col gap-3">
        {FAQ.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={item.q.en}
              className="border-border bg-card-bg overflow-hidden rounded-2xl border shadow-xs transition-all"
            >
              <button
                type="button"
                className="text-primary hover:text-strong font-fa flex w-full cursor-pointer items-center justify-between gap-3 p-4 px-5 text-start text-[0.95rem] font-semibold transition-colors"
                onClick={() => toggleIndex(idx)}
              >
                <span>{item.q[lang]}</span>
                <span
                  className={`text-tertiary text-xl transition-transform duration-200 ${isOpen ? "text-primary rotate-45" : ""}`}
                >
                  +
                </span>
              </button>

              <div
                className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                  isOpen
                    ? "grid-rows-[1fr] opacity-100"
                    : "pointer-events-none grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="px-5 pt-1 pb-5">
                    <p
                      className="text-secondary font-fa text-sm leading-relaxed"
                      dangerouslySetInnerHTML={renderFaqAnswer(item, lang)}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
