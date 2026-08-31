import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import ScrollToTopButton from "./ScrollToTopButton/ScrollToTopButton";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});

export const metadata = {
  title: "Diaa Abdelaziz — Frontend Developer",
  description:
    "Diaa Abdelaziz is a Frontend Developer building fast, responsive, user-friendly web applications with React, Next.js and modern JavaScript.",
  keywords:
    "Frontend Developer, React, Next.js, Vue, JavaScript, HTML, CSS, Portfolio, Web Development",
  authors: [{ name: "Diaa Abdelaziz" }],
  robots: "index, follow",
  openGraph: {
    title: "Diaa Abdelaziz — Frontend Developer",
    description:
      "Check out my portfolio showcasing frontend projects, skills, and experience.",
    siteName: "Diaa Abdelaziz Portfolio",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrainsMono.variable}`}>
        <div className="noise-grid" aria-hidden="true" />
        <Navbar />
        <ScrollToTopButton />
        {children}
        <Footer />
      </body>
    </html>
  );
}
