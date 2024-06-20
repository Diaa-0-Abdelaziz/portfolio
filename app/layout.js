import { Inter } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css"
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import ScrollToTopButton from "./ScrollToTopButton/ScrollToTopButton";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Diaa Abdelaziz",
  description: "Personal Portfolio",
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
