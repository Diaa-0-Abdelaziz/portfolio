import React from 'react'
import { FaFacebookSquare, FaLinkedin, FaGithubSquare, FaWhatsappSquare } from "react-icons/fa";
import "./footer.css"

const START_YEAR = 2023;

const socials = [
  { icon: <FaGithubSquare />, href: "https://github.com/Diaa-0-Abdelaziz", label: "GitHub" },
  { icon: <FaLinkedin />, href: "https://www.linkedin.com/in/diaa-abdulaziz-232530201", label: "LinkedIn" },
  { icon: <FaFacebookSquare />, href: "https://www.facebook.com/profile.php?id=100079659855523", label: "Facebook" },
  { icon: <FaWhatsappSquare />, href: "https://wa.me/201117578674", label: "WhatsApp" },
];

export default function Footer() {
  const year = new Date().getFullYear();
  const range = year > START_YEAR ? `${START_YEAR}–${year}` : `${year}`;
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <p className="footer-brand mono">
          Diaa Abdelaziz <span>&copy; {range}</span>
        </p>

        <ul className="footer-socials">
          {socials.map((s) => (
            <li key={s.label}>
              <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
                {s.icon}
              </a>
            </li>
          ))}
        </ul>

        <a href="#" className="footer-top mono">
          Back to top
        </a>
      </div>
    </footer>
  )
}
