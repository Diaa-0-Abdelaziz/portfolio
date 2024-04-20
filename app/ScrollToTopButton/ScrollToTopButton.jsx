"use client"
import React, { useState, useEffect } from 'react';
import { BsRocketFill } from "react-icons/bs";

import "../home.css"
// import car from '../images/car.png'
function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  // Function to handle scroll event
  const handleScroll = () => {
    const scrollPosition = window.scrollY;
    // Show the button if the user scrolls down 200 pixels from the top
    if (scrollPosition > 500) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Function to handle scroll to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth' // Smooth scrolling behavior
    });
  };

  // Add event listener when the component mounts
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    // Clean up the event listener when the component unmounts
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`scroll-to-top-button ${isVisible ? 'show' : ''}`} onClick={scrollToTop}>
     {/* <img src={car} alt={car} width={50} height={100} /> */}
     <BsRocketFill/>
    </div>
  );
}

export default ScrollToTopButton;