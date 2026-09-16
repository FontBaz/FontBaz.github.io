import { useAppearance } from "../../context/appearance-context";
import { T } from "../../data/constants";
import HeroSlider from "./HeroSlider";

export default function Hero() {
  const { lang } = useAppearance();
  const t = T[lang];

  const scrollToExplore = () => {
    const filterBar = document.getElementById("filter-bar");
    if (!filterBar) return;

    const headerH =
      parseInt(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--header-h"
        ),
        10
      ) || 64;
    const y =
      filterBar.getBoundingClientRect().top + window.scrollY - headerH - 8;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <section className="overflow-hidden pt-16 pb-8 text-center md:pt-24 md:pb-12">
      <div className="container-main">
        <h1 className="text-strong font-fa cursor-text text-3xl leading-[1.1] font-bold tracking-tight select-text sm:text-4xl md:text-5xl lg:text-6xl">
          {t.hero}
        </h1>
        <p className="text-secondary font-fa mx-auto mt-4 max-w-2xl text-base leading-relaxed md:text-lg">
          {t.sub}
        </p>
        <button
          className="border-text-primary bg-primary text-surface font-inherit mt-6 inline-flex cursor-pointer items-center justify-center rounded-full border px-7 py-3 text-base font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-95"
          type="button"
          onClick={scrollToExplore}
        >
          {t.explore}
        </button>
      </div>
      <HeroSlider />
    </section>
  );
}
