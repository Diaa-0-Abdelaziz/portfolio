"use client";
import React from "react";
import { motion } from "framer-motion";
import { IoLogoHtml5 } from "react-icons/io";
import { FaCss3Alt, FaBootstrap, FaGitAlt, FaGithubSquare, FaSass, FaVuejs } from "react-icons/fa";
import { TbBrandJavascript } from "react-icons/tb";
import { RiReactjsLine } from "react-icons/ri";
import { SiNextdotjs, SiTailwindcss, SiTypescript, SiFigma, SiRedux } from "react-icons/si";
import "./Objective.css";

const stats = [
  { value: "2+", label: "Years of experience" },
  { value: "6+", label: "Projects shipped" },
  { value: "15+", label: "Tools & technologies" },
];

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
  return (
    <section id="about" className="section about">
      <div className="container about-grid">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
        >
          <p className="section-kicker mono">Who I am</p>
          <h2 className="section-title">
            Building thoughtful <span className="accent">interfaces</span>
          </h2>
          <p className="about-text">
            I&rsquo;m a motivated, detail-oriented Frontend Developer with 2+
            years of hands-on experience building responsive, user-friendly
            web applications. I work mainly with React.js, Next.js and
            Vue (2 &amp; 3) — using Vuex and Pinia for state management,
            integrating third-party libraries, crafting reusable components
            and shipping interactive UI features.
          </p>
          <p className="about-text">
            I care about clean code, efficient component design and a
            seamless user experience, and I&rsquo;m always looking to grow my
            front-end craft on projects that push me forward.
          </p>

          <div className="stats-row">
            {stats.map((s) => (
              <div key={s.label} className="stat">
                <span className="stat-value">{s.value}</span>
                <span className="stat-label">{s.label}</span>
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
          <span className="mono marquee-caption">My toolbox</span>
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
