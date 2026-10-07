"use client";
import React from "react";
import { motion } from "framer-motion";
import { useLang } from "../../i18n/LanguageProvider";
import "./Highlights.css";

const POST_URL =
  "https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:7513622640671227904?collapsed=1";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

export default function Highlights() {
  const { t } = useLang();
  const h = t.highlights;
  return (
    <section id="highlights" className="section highlights">
      <div className="container">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
        >
          <p className="section-kicker mono">{h.kicker}</p>
          <h2 className="section-title">
            {h.titleA} <span className="accent">{h.titleB}</span>
          </h2>
        </motion.div>

        <motion.div
          className="highlights-embed card"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
        >
          <iframe
            src={POST_URL}
            title={h.frameTitle}
            loading="lazy"
            allowFullScreen
          />
        </motion.div>
      </div>
    </section>
  );
}
