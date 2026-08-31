"use client"
import React, { useState, useEffect } from 'react';
import { HiArrowUp } from "react-icons/hi";
import "./scrollToTop.css"

function ScrollToTopButton() {
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
      aria-label="Scroll back to top"
    >
      <HiArrowUp />
    </button>
  );
}

export default ScrollToTopButton;
