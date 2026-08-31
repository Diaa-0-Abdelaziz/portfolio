"use client";
import React from "react";
import { motion } from "framer-motion";
import { IoLogoHtml5 } from "react-icons/io";
import { FaCss3Alt, FaBootstrap, FaGitAlt, FaGithubSquare, FaSass, FaVuejs } from "react-icons/fa";
import { TbBrandJavascript, TbDatabase, TbStack2 } from "react-icons/tb";
import { RiReactjsLine } from "react-icons/ri";
import { SiNextdotjs, SiAxios, SiTailwindcss, SiTypescript, SiFigma, SiRedux } from "react-icons/si";
import { DiResponsive } from "react-icons/di";
import { FaResolving } from "react-icons/fa6";
import "./skills.css";

const categories = [
  {
    title: "Languages",
    items: [
      { icon: <IoLogoHtml5 />, text: "HTML5" },
      { icon: <FaCss3Alt />, text: "CSS3" },
      { icon: <TbBrandJavascript />, text: "JavaScript" },
      { icon: <SiTypescript />, text: "TypeScript" },
    ],
  },
  {
    title: "Frameworks & Libraries",
    items: [
      { icon: <RiReactjsLine />, text: "React.js" },
      { icon: <SiNextdotjs />, text: "Next.js" },
      { icon: <FaVuejs />, text: "Vue.js (2 & 3)" },
      { icon: <SiRedux />, text: "Redux" },
      { icon: <TbStack2 />, text: "Vuex" },
      { icon: <TbDatabase />, text: "Pinia" },
      { icon: <SiAxios />, text: "Axios" },
    ],
  },
  {
    title: "Styling",
    items: [
      { icon: <FaBootstrap />, text: "Bootstrap" },
      { icon: <SiTailwindcss />, text: "Tailwind CSS" },
      { icon: <FaSass />, text: "Sass/SCSS" },
      { icon: <DiResponsive />, text: "Responsive Design" },
    ],
  },
  {
    title: "Tools & Practices",
    items: [
      { icon: <FaGitAlt />, text: "Git" },
      { icon: <FaGithubSquare />, text: "GitHub" },
      { icon: <SiFigma />, text: "Figma" },
      { icon: <FaResolving />, text: "Problem Solving" },
    ],
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

export default function Skills() {
  return (
    <section className="section skills-page">
      <div className="container">
        <p className="section-kicker mono">What I work with</p>
        <h1 className="section-title">
          Skills &amp; <span className="accent">Technologies</span>
        </h1>
        <p className="skills-intro">
          Tools and technologies I reach for daily to design, build and ship
          production-ready interfaces.
        </p>

        <div className="skills-categories">
          {categories.map((category, ci) => (
            <motion.div
              key={category.title}
              className="skill-category"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeUp}
              transition={{ delay: ci * 0.08 }}
            >
              <h2 className="mono skill-category-title">{category.title}</h2>
              <div className="skills-grid">
                {category.items.map((skill) => (
                  <div key={skill.text} className="skill-item">
                    <div className="icon-wrapper">{skill.icon}</div>
                    <span>{skill.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
