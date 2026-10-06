"use client";
import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { HiOutlineExternalLink } from "react-icons/hi";
import { FaGithubSquare } from "react-icons/fa";
import { projects } from "../../data/projects";
import { useLang } from "../../i18n/LanguageProvider";
import "./projects.css";

export default function Projects() {
  const { t } = useLang();
  const p = t.projectsPage;
  const roles = useMemo(
    () => ["All", ...new Set(projects.map((p) => p.role))],
    []
  );
  const [filter, setFilter] = useState("All");

  const filtered =
    filter === "All" ? projects : projects.filter((p) => p.role === filter);

  return (
    <section className="section projects-page">
      <div className="container">
        <p className="section-kicker mono">{p.kicker}</p>
        <h1 className="section-title">
          {p.titleA} <span className="accent">{p.titleB}</span>
        </h1>
        <p className="projects-intro">
          {p.intro}
        </p>

        <div className="filter-tabs">
          {roles.map((role) => (
            <button
              key={role}
              className={`filter-tab ${filter === role ? "active" : ""}`}
              onClick={() => setFilter(role)}
            >
              {role === "All" ? p.all : t.roles[role] || role}
            </button>
          ))}
        </div>

        <div className="projects-grid">
          {filtered.map((project, index) => (
            <motion.div
              key={project.title}
              className="project-card"
              layout
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <div className="project-card-media">
                <Image
                  width={480}
                  height={340}
                  src={project.img}
                  className="project-card-img"
                  alt={project.title}
                />
                <div className="project-card-overlay">
                  {project.live && (
                    <Link href={project.live} target="_blank" className="btn-icon" aria-label={p.liveLabel}>
                      <HiOutlineExternalLink />
                    </Link>
                  )}
                  {project.code && (
                    <Link href={project.code} target="_blank" className="btn-icon" aria-label={t.featured.sourceCode}>
                      <FaGithubSquare />
                    </Link>
                  )}
                </div>
                <span className="tag project-role-tag">{t.roles[project.role] || project.role}</span>
              </div>
              <div className="project-card-body">
                <h3>{project.title}</h3>
                <p>{t.projects[project.title]?.description || project.description}</p>
                <ul className="project-card-tags">
                  {project.tags.slice(0, 4).map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
