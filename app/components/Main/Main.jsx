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

  React.useEffect(() => {
    const typed = new Typed(el.current, {
      strings: [
        "Front-End Developer.",
        "React &amp; Next.js Developer.",
        "Vue.js Developer.",
        "Interfaces that feel right.",
      ],
      typeSpeed: 35,
      backSpeed: 22,
      backDelay: 1400,
      smartBackspace: true,
      loop: true,
    });
    return () => typed.destroy();
  }, []);

  return (
    <section className="hero">
      <div className="container hero-grid">
        <div className="hero-copy">
          <motion.p variants={fadeUp} initial="hidden" animate="show" custom={0} className="mono hero-eyebrow">
            Hi, my name is
          </motion.p>
          <motion.h1 variants={fadeUp} initial="hidden" animate="show" custom={1} className="hero-name">
            Diaa Abdelaziz.
          </motion.h1>
          <motion.h2 variants={fadeUp} initial="hidden" animate="show" custom={2} className="hero-role">
            I&rsquo;m a <span ref={el} className="hero-typed accent" />
          </motion.h2>
          <motion.p variants={fadeUp} initial="hidden" animate="show" custom={3} className="hero-desc">
            I design and build fast, responsive web applications with React,
            Vue and Next.js — focused on clean components, smooth
            interactions, and pixel-accurate UI.
          </motion.p>

          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={4} className="hero-cta">
            <Link href="/projects" className="btn btn-primary">
              View Projects <HiOutlineArrowRight />
            </Link>
            <Link href="/contactme" className="btn btn-ghost">
              Get In Touch
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
            <Image priority width={420} height={520} src={picture} className="hero-photo-img" alt="Diaa Abdelaziz" />
          </div>
          <Link
            href="https://drive.google.com/drive/folders/1P8ISYv-XkffPKPnjhIMtwwzs3qkmc6ao?usp=sharing"
            target="_blank"
            className="hero-cv-chip mono"
            aria-label="download my cv"
          >
            <IoMdCloudDownload /> Download CV
          </Link>
        </motion.div>
      </div>

      <div className="scroll-cue mono">
        <span>Scroll</span>
        <HiArrowDown />
      </div>
    </section>
  );
}
