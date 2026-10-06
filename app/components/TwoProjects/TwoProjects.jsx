"use client";
import React from "react";
import "./TwoProject.css";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { HiOutlineArrowRight, HiOutlineExternalLink } from "react-icons/hi";
import { FaGithubSquare } from "react-icons/fa";
import { projects } from "../../data/projects";
import { useLang } from "../../i18n/LanguageProvider";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

export default function TwoProjects() {
  const { t } = useLang();
  const f = t.featured;
  const featured = projects.filter((p) => p.featured);

  return (
    <section id="work" className="section featured-projects">
      <div className="container">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
        >
          <p className="section-kicker mono">{f.kicker}</p>
          <h2 className="section-title">
            {f.titleA} <span className="accent">{f.titleB}</span>
          </h2>
        </motion.div>

        <div className="featured-list">
          {featured.map((project, index) => (
            <motion.article
              key={project.title}
              className={`featured-row ${index % 2 === 1 ? "reverse" : ""}`}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeUp}
            >
              <div className="featured-media">
                <Image
                  width={640}
                  height={420}
                  src={project.img}
                  className="featured-img"
                  alt={project.title}
                />
              </div>
              <div className="featured-copy">
                <span className="mono section-kicker">{t.roles[project.role] || project.role}</span>
                <h3>{project.title}</h3>
                <p className="featured-card-desc">{t.projects[project.title]?.description || project.description}</p>
                <ul className="featured-tags">
                  {project.tags.map((t) => (
                    <li key={t} className="tag">
                      {t}
                    </li>
                  ))}
                </ul>
                <div className="featured-links">
                  {project.live && (
                    <Link href={project.live} target="_blank" className="btn btn-ghost">
                      {f.liveSite} <HiOutlineExternalLink />
                    </Link>
                  )}
                  {project.code && (
                    <Link href={project.code} target="_blank" className="btn-icon" aria-label={f.sourceCode}>
                      <FaGithubSquare />
                    </Link>
                  )}
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="featured-cta">
          <Link href="/projects" className="btn btn-primary">
            {f.viewAll} <HiOutlineArrowRight className="flip-rtl" />
          </Link>
        </div>
      </div>
    </section>
  );
}
