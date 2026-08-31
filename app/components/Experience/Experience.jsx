"use client";
import React from "react";
import { motion } from "framer-motion";
import "./Experience.css";

const experience = [
  {
    role: "Frontend Developer (Vue.js)",
    company: "Barq Solution",
    companyUrl: "https://barq.solutions",
    period: "Feb 2025 — Present",
    current: true,
    description:
      "Building and shipping responsive, production-ready interfaces with Vue.js as part of the development team.",
  },
  {
    role: "Frontend Developer (React) — Freelance",
    company: "Self-employed",
    period: "2024 — Feb 2025",
    current: false,
    description:
      "Delivered React-based websites and web apps for freelance clients, from landing pages to booking and consulting platforms.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

export default function Experience() {
  return (
    <section id="experience" className="section experience">
      <div className="container">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
        >
          <p className="section-kicker mono">Where I&rsquo;ve worked</p>
          <h2 className="section-title">
            Work <span className="accent">Experience</span>
          </h2>
        </motion.div>

        <div className="timeline">
          {experience.map((job, i) => (
            <motion.div
              key={job.company}
              className="timeline-item"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeUp}
              transition={{ delay: i * 0.1 }}
            >
              <span className={`timeline-dot ${job.current ? "current" : ""}`} />
              <div className="timeline-content card">
                <div className="timeline-head">
                  <h3>
                    {job.role}{" "}
                    {job.companyUrl ? (
                      <a
                        href={job.companyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="timeline-at"
                      >
                        @ {job.company}
                      </a>
                    ) : (
                      <span className="timeline-at">@ {job.company}</span>
                    )}
                  </h3>
                  <span className="mono timeline-period">{job.period}</span>
                </div>
                <p>{job.description}</p>
                {job.current && <span className="tag timeline-current-tag">Current</span>}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
