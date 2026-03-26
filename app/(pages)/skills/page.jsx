import React from "react";
import { IoLogoHtml5 } from "react-icons/io";
import { FaCss3Alt, FaBootstrap, FaGitAlt, FaGithubSquare, FaPhp, FaSass } from "react-icons/fa";
import { TbBrandJavascript } from "react-icons/tb";
import { RiReactjsLine } from "react-icons/ri";
import { SiNextdotjs, SiJquery, SiAxios, SiLaravel, SiTailwindcss, SiTypescript, SiFigma, SiRedux } from "react-icons/si";
import { DiResponsive } from "react-icons/di";
import { FaResolving } from "react-icons/fa6";
import "./skills.css";

export default function Skills() {
  const skillsData = [
    { icon: <IoLogoHtml5 />, text: "HTML5" },
    { icon: <FaCss3Alt />, text: "CSS3" },
    { icon: <TbBrandJavascript />, text: "JavaScript" },
    // { icon: <SiJquery />, text: "jQuery" },
    { icon: <FaBootstrap />, text: "Bootstrap" },
    { icon: <RiReactjsLine />, text: "React.js" },
    { icon: <SiNextdotjs />, text: "Next.js" },
    { icon: <DiResponsive />, text: "Responsive" },
    { icon: <FaResolving />, text: "Problem Solving" },
    { icon: <FaGitAlt />, text: "Git" },
    { icon: <FaGithubSquare />, text: "GitHub" },
    { icon: <SiAxios />, text: "Axios" },
    { icon: <FaPhp />, text: "PHP" },
    { icon: <SiLaravel />, text: "Laravel" },
    { icon: <SiTailwindcss />, text: "Tailwind CSS" },
    { icon: <SiTypescript />, text: "TypeScript" },
    { icon: <FaSass />, text: "Sass/SCSS" },
    { icon: <SiRedux />, text: "Redux" },
    { icon: <SiFigma />, text: "Figma" },
  ];

  return (
    <section className="vh-100 skills-component">
      <div className="container h-100 d-flex align-items-center justify-content-center">
        <ul className="skills-grid list-unstyled">
          {skillsData.map((skill, index) => (
            <li key={index} className="skill-item">
              <div className="icon-wrapper">{skill.icon}</div>
              <span>{skill.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}