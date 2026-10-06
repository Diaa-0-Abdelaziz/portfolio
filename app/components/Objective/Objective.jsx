"use client";
import React from "react";
import { motion } from "framer-motion";
import { IoLogoHtml5 } from "react-icons/io";
import { FaCss3Alt, FaBootstrap, FaGitAlt, FaGithubSquare, FaSass, FaVuejs } from "react-icons/fa";
import { TbBrandJavascript } from "react-icons/tb";
import { RiReactjsLine } from "react-icons/ri";
import { SiNextdotjs, SiTailwindcss, SiTypescript, SiFigma, SiRedux } from "react-icons/si";
import { useLang } from "../../i18n/LanguageProvider";
import "./Objective.css";

const statValues = ["2+", "6+", "15+"];

const marqueeIcons = [
  <IoLogoHtml5 key="html" />,
  <FaCss3Alt key="css" />,
  <TbBrandJavascript key="js" />,
  <RiReactjsLine key="react" />,
  <SiNextdotjs key="next" />,
  <SiTailwindcss key="tw" />,
  <FaBootstrap key="bs" />,
  <FaVuejs key="vue" />,
  <SiTypescript key="ts" />,
  <SiRedux key="redux" />,
  <FaSass key="sass" />,
  <FaGitAlt key="git" />,
  <FaGithubSquare key="gh" />,
  <SiFigma key="figma" />,
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

export default function Objective() {
  const { t } = useLang();
  const a = t.about;
  return (
    <section id="about" className="section about">
      <div className="container about-grid">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
        >
          <p className="section-kicker mono">{a.kicker}</p>
          <h2 className="section-title">
            {a.titleA} <span className="accent">{a.titleB}</span> {a.titleC}
          </h2>
          <p className="about-text">
            {a.p1}
          </p>
          <p className="about-text">
            {a.p2}
          </p>

          <div className="stats-row">
            {statValues.map((value, i) => (
              <div key={value} className="stat">
                <span className="stat-value">{value}</span>
                <span className="stat-label">{a.stats[i]}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="marquee-wrap"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
        >
          <span className="mono marquee-caption">{a.toolbox}</span>
          <div className="marquee">
            <div className="marquee-track">
              {[...marqueeIcons, ...marqueeIcons].map((icon, i) => (
                <div className="marquee-item" key={i}>
                  {icon}
                </div>
              ))}
            </div>
          </div>
          <div className="marquee marquee-reverse">
            <div className="marquee-track">
              {[...marqueeIcons.slice().reverse(), ...marqueeIcons.slice().reverse()].map((icon, i) => (
                <div className="marquee-item" key={i}>
                  {icon}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
