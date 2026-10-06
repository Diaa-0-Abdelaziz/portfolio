import { Inter, JetBrains_Mono, Cairo } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import ScrollToTopButton from "./ScrollToTopButton/ScrollToTopButton";
import { LanguageProvider } from "./i18n/LanguageProvider";
import { translations, LANGS, DEFAULT_LANG, LANG_COOKIE } from "./i18n/translations";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-ar",
  weight: ["400", "500", "600", "700", "800"],
});

function getLang() {
  const value = cookies().get(LANG_COOKIE)?.value;
  return LANGS.includes(value) ? value : DEFAULT_LANG;
}

export function generateMetadata() {
  const { meta } = translations[getLang()];
  return {
  title: meta.title,
  description: meta.description,
  keywords:
    "Frontend Developer, React, Next.js, Vue, JavaScript, HTML, CSS, Portfolio, Web Development",
  authors: [{ name: "Diaa Abdelaziz" }],
  robots: "index, follow",
  openGraph: {
    title: meta.title,
    description: meta.description,
    siteName: "Diaa Abdelaziz Portfolio",
    type: "website",
  },
  };
}

export default function RootLayout({ children }) {
  const lang = getLang();
  return (
    <html lang={lang} dir={lang === "ar" ? "rtl" : "ltr"}>
      <body className={`${inter.variable} ${jetbrainsMono.variable} ${cairo.variable}`}>
        <LanguageProvider initialLang={lang}>
          <div className="noise-grid" aria-hidden="true" />
          <Navbar />
          <ScrollToTopButton />
          {children}
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
