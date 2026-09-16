import { useEffect } from "react";

import FontGallery from "./components/gallery/FontGallery";
import FaqSection from "./components/home/FaqSection";
import FilterBar from "./components/home/FilterBar";
import FontSearchBar from "./components/home/FontSearchBar";
import Hero from "./components/home/Hero";
import Footer from "./components/layout/Footer";
import Header from "./components/layout/Header";
import FontModal from "./components/modal/FontModal";
import { AppearanceProvider } from "./context/AppearanceProvider";
import { FontProvider } from "./context/FontProvider";
import { setupDefaultSiteFont } from "./utils/fontUtils";

function AppContent() {
  useEffect(() => {
    setupDefaultSiteFont();
  }, []);

  return (
    <>
      <Header />
      <main>
        <Hero />
        <FilterBar />
        <FontSearchBar />
        <FontGallery />
        <FaqSection />
      </main>
      <Footer />
      <FontModal />
    </>
  );
}

export default function App() {
  return (
    <AppearanceProvider>
      <FontProvider>
        <AppContent />
      </FontProvider>
    </AppearanceProvider>
  );
}
