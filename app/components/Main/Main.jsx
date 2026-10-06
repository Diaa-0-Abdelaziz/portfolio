"use client";
import React from "react";
import Typed from "typed.js";
import { motion } from "framer-motion";
import picture from "../../imges/diaa.png";
import "./main.css";
import Image from "next/image";
import { FaFacebookSquare, FaLinkedin, FaGithubSquare, FaWhatsappSquare } from "react-icons/fa";
import { IoMdCloudDownload } from "react-icons/io";
import { HiArrowDown, HiOutlineArrowRight } from "react-icons/hi";
import Link from "next/link";
import { useLang } from "../../i18n/LanguageProvider";

const socials = [
  { icon: <FaGithubSquare />, href: "https://github.com/Diaa-0-Abdelaziz", label: "GitHub" },
  { icon: <FaLinkedin />, href: "https://www.linkedin.com/in/diaa-abdulaziz-232530201", label: "LinkedIn" },
  { icon: <FaFacebookSquare />, href: "https://www.facebook.com/profile.php?id=100079659855523", label: "Facebook" },
  { icon: <FaWhatsappSquare />, href: "https://wa.me/201117578674", label: "WhatsApp" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.12 * i, duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function Main() {
  const el = React.useRef(null);
  const { t } = useLang();

  React.useEffect(() => {
    const typed = new Typed(el.current, {
      strings: t.hero.typed,
      typeSpeed: 35,
      backSpeed: 22,
      backDelay: 1400,
      smartBackspace: true,
      loop: true,
    });
    return () => typed.destroy();
  }, [t]);

  return (
    <section className="hero">
      <div className="container hero-grid">
        <div className="hero-copy">
          <motion.p variants={fadeUp} initial="hidden" animate="show" custom={0} className="mono hero-eyebrow">
            {t.hero.eyebrow}
          </motion.p>
          <motion.h1 variants={fadeUp} initial="hidden" animate="show" custom={1} className="hero-name">
            {t.common.name}.
          </motion.h1>
          <motion.h2 variants={fadeUp} initial="hidden" animate="show" custom={2} className="hero-role">
            {t.hero.roleIntro} <span ref={el} className="hero-typed accent" />
          </motion.h2>
          <motion.p variants={fadeUp} initial="hidden" animate="show" custom={3} className="hero-desc">
            {t.hero.desc}
          </motion.p>

          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={4} className="hero-cta">
            <Link href="/projects" className="btn btn-primary">
              {t.hero.viewProjects} <HiOutlineArrowRight className="flip-rtl" />
            </Link>
            <Link href="/contactme" className="btn btn-ghost">
              {t.hero.getInTouch}
            </Link>
          </motion.div>

          <motion.ul variants={fadeUp} initial="hidden" animate="show" custom={5} className="hero-socials-inline">
            {socials.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
                  {s.icon}
                </a>
              </li>
            ))}
          </motion.ul>
        </div>

        <motion.div
          className="hero-photo"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        >
          <div className="hero-photo-frame">
            <Image priority width={420} height={520} src={picture} className="hero-photo-img" alt={t.common.name} />
          </div>
          <Link
            href="https://drive.google.com/drive/folders/1P8ISYv-XkffPKPnjhIMtwwzs3qkmc6ao?usp=sharing"
            target="_blank"
            className="hero-cv-chip mono"
            aria-label={t.hero.downloadCvLabel}
          >
            <IoMdCloudDownload /> {t.hero.downloadCv}
          </Link>
        </motion.div>
      </div>

      <div className="scroll-cue mono">
        <span>{t.hero.scroll}</span>
        <HiArrowDown />
      </div>
    </section>
  );
}
