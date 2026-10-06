"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineMenu, HiOutlineX, HiOutlineSun, HiOutlineMoon } from "react-icons/hi";
import { IoMdCloudDownload } from "react-icons/io";
import "./navbar.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "../../i18n/LanguageProvider";
import { useTheme } from "../../i18n/ThemeProvider";

const links = [
  { num: "00", key: "home", pathName: "/" },
  { num: "01", key: "skills", pathName: "/skills" },
  { num: "02", key: "projects", pathName: "/projects" },
  { num: "03", key: "contact", pathName: "/contactme" },
];

const RESUME_URL =
  "https://drive.google.com/drive/folders/1P8ISYv-XkffPKPnjhIMtwwzs3qkmc6ao?usp=sharing";

export default function Navbar() {
  const path = usePathname();
  const { t, dir, toggleLang } = useLang();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className={`site-nav ${scrolled ? "scrolled" : ""}`}>
      <div className="container site-nav-inner">
        <Link href="/" className="brand" aria-label={t.nav.homeLabel}>
          <span className="brand-mark">D</span>
          <span className="brand-name mono">iaa.dev</span>
        </Link>

        <nav className="desktop-links" aria-label="Primary">
          {links.map((link) => (
            <Link
              key={link.pathName}
              href={link.pathName}
              className={`nav-link ${path === link.pathName ? "active" : ""}`}
            >
              <span className="mono nav-num">{link.num}.</span>
              {t.nav[link.key]}
            </Link>
          ))}
        </nav>

        <div className="nav-actions">
          <button
            className="lang-btn mono"
            onClick={toggleLang}
            aria-label={t.common.switchLabel}
          >
            {t.common.switchTo}
          </button>
          <button
            className="theme-btn"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? t.nav.toLight : t.nav.toDark}
          >
            {theme === "dark" ? <HiOutlineSun /> : <HiOutlineMoon />}
          </button>
          <Link
            href={RESUME_URL}
            target="_blank"
            className="btn btn-ghost resume-btn"
          >
            {t.nav.resume} <IoMdCloudDownload />
          </Link>
          <button
            className="menu-btn"
            onClick={() => setOpen(true)}
            aria-label={t.nav.openMenu}
          >
            <HiOutlineMenu />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="drawer"
              initial={{ x: dir === "rtl" ? "-100%" : "100%" }}
              animate={{ x: 0 }}
              exit={{ x: dir === "rtl" ? "-100%" : "100%" }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <button
                className="drawer-close"
                onClick={() => setOpen(false)}
                aria-label={t.nav.closeMenu}
              >
                <HiOutlineX />
              </button>
              <ul>
                {links.map((link, i) => (
                  <motion.li
                    key={link.pathName}
                    initial={{ opacity: 0, x: dir === "rtl" ? -24 : 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 * i + 0.1 }}
                  >
                    <Link
                      href={link.pathName}
                      className={path === link.pathName ? "active" : ""}
                      onClick={() => setOpen(false)}
                    >
                      <span className="mono nav-num">{link.num}.</span>
                      {t.nav[link.key]}
                    </Link>
                  </motion.li>
                ))}
              </ul>
              <Link
                href={RESUME_URL}
                target="_blank"
                className="btn btn-primary"
                onClick={() => setOpen(false)}
              >
                {t.nav.resume} <IoMdCloudDownload />
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
