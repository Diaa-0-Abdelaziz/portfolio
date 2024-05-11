"use client";
import React from 'react'
import Typed from 'typed.js';
import picture from '../../imges/diaa.png';
import "./main.css"
import Image from 'next/image'
import { FaFacebookSquare } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa";
import { FaGithubSquare } from "react-icons/fa";
import { IoMdCloudDownload } from "react-icons/io";
import { FaWhatsappSquare } from "react-icons/fa";
import Link from 'next/link';

export default function Main() {
  const el = React.useRef(null);

  React.useEffect(() => {
    const typed = new Typed(el.current, {
      strings: ["Diaa Mohamed Abdelaziz", "Front-end developer"],
      typeSpeed: 30,
      backSpeed: 20,
      cursorChar: '',
      loop: true,
    });

    return () => {
      typed.destroy();
    };
  }, []);
  return (
    <div className=' home vh-100  d-flex  align-items-top'>
      <div className='container'>
     <div className='row mt-4 w-100'>
       <div className='col-lg-8 col-md-6 d-flex flex-column  justify-content-center'>
          <h4 className=' fw-bolder myName'>Hello!!!!</h4>
          <div className='myName'>
          <span>I am </span>
          <span ref={el} />
          </div>
          <ul className=' list-unstyled d-flex'>
            <li><a href='https://www.facebook.com/profile.php?id=100079659855523' aria-label="go to my account on facebook"><FaFacebookSquare/></a></li>
            <li><a href='https://www.linkedin.com/in/diaa-abdulaziz-232530201' aria-label="go to my account on linked in"><FaLinkedin/></a></li>
            <li><a href='https://github.com/Diaa-Abdelaziz'aria-label="go to my account on github"><FaGithubSquare/></a></li>
            <li><a href="https://wa.me/201117578674" rel="noopener noreferrer" aria-label="send message by whatsapp"><FaWhatsappSquare/></a></li>
          </ul>
          <Link href="https://drive.google.com/drive/folders/1P8ISYv-XkffPKPnjhIMtwwzs3qkmc6ao?usp=sharing" target='_blank' className="badge text-decoration-none fs-5 download_cv" aria-label="download my cv">Download cv <IoMdCloudDownload/></Link>
       </div>
       <div className='col-lg-4 col-md-6 d-flex flex-column justify-content-center'>
       <Image priority width={300} height={400} src={picture} className='picture w-auto h-auto' alt={picture}/>
       </div>
     </div>
      </div>
    </div>
  )
}
