import { useAppearance } from "../../context/appearance-context";
import { GH_URL } from "../../data/constants";

export default function Footer() {
  const { lang } = useAppearance();

  return (
    <footer
      className="text-tertiary font-fa mx-auto w-full px-6 py-8 text-center text-sm"
      id="site-footer"
    >
      {lang === "fa" ? (
        <>
          ستاره دادن به ما در{" "}
          <a
            href={GH_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary hover:text-primary font-semibold underline underline-offset-2 transition-colors"
          >
            گیت‌هاب
          </a>{" "}
          فراموش نشه :)
        </>
      ) : (
        <>
          Don&apos;t forget to star us on{" "}
          <a
            href={GH_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary hover:text-primary font-semibold underline underline-offset-2 transition-colors"
          >
            GitHub
          </a>{" "}
          :)
        </>
      )}
    </footer>
  );
}
