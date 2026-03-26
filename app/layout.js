import { Inter } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css"
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import ScrollToTopButton from "./ScrollToTopButton/ScrollToTopButton";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Diaa Abdelaziz - Frontend Developer",
  description: "Personal portfolio showcasing projects, skills, and experience in frontend development using React, Vue, and modern web technologies.",
  keywords: "Frontend Developer, React, Vue, JavaScript, HTML, CSS, Portfolio, Web Development",
  author: "Diaa Abdelaziz",
  robots: "index, follow",
  openGraph: {
    title: "Diaa Abdelaziz - Frontend Developer",
    description: "Check out my portfolio showcasing frontend projects, skills, and experience.",
    siteName: "Diaa Abdelaziz Portfolio",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar/>
        <ScrollToTopButton/>
        {children}
        <Footer/>
        </body>
    </html>
  );
}
