import { useAppearance } from "../../context/appearance-context";
import { GH_URL, T } from "../../data/constants";

export default function Footer() {
  const { lang } = useAppearance();

  const githubLink = (
    <a
      href={GH_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="text-secondary hover:text-primary font-semibold underline underline-offset-2 transition-colors"
    >
      {lang === "fa" ? "گیت‌هاب" : "GitHub"}
    </a>
  );

  return (
    <footer
      className="text-tertiary font-fa mx-auto w-full px-6 py-8 text-center text-sm"
      id="site-footer"
    >
      {T[lang].footerStar.split("{github}").map((part, i) =>
        i === 0 ? (
          part
        ) : (
          <>
            {githubLink}
            {part}
          </>
        )
      )}
    </footer>
  );
}
