"use client"
import React, { useState, useEffect } from 'react';
import { HiArrowUp } from "react-icons/hi";
import "./scrollToTop.css"
import { useLang } from "../i18n/LanguageProvider";

function ScrollToTopButton() {
  const { t } = useLang();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsVisible(window.scrollY > 500);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      className={`scroll-to-top-button ${isVisible ? 'show' : ''}`}
      onClick={scrollToTop}
      aria-label={t.scrollTop}
    >
      <HiArrowUp />
    </button>
  );
}

export default ScrollToTopButton;
