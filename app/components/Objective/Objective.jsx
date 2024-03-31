import React from 'react'
import { FaQuoteRight } from "react-icons/fa";
import { SiNextdotjs } from "react-icons/si";
import { IoLogoHtml5 } from "react-icons/io";
import { FaCss3Alt } from "react-icons/fa";
import { TbBrandJavascript } from "react-icons/tb";
import { RiReactjsLine } from "react-icons/ri";
import { GrFormNext } from "react-icons/gr";

import "./Objective.css"
import Link from 'next/link';
export default function Objective() {
  return (
    <>
   <div id='objective' className=" text-center objective container mt-5 mb-5 pb-5 ">
    <h3>Objective</h3>
    <div className=" d-flex flex-wrap justify-content-around">
        <div className="mt-5">
        <div className="content">
            <div className="circle"><IoLogoHtml5/></div>
            <div className="circle2"><TbBrandJavascript/></div>
             <div className="circle3"><FaCss3Alt/></div>
             <div className="circle4"><RiReactjsLine/></div>
             <div className="circle_center">
                <div className="circle5">
                  <SiNextdotjs/>
                </div>
             </div>
          </div>  
        </div>
        <div className=" mt-5 d-flex flex-column justify-content-center align-items-center px-3">
        <div className="icon">
        <FaQuoteRight/>
        </div>
        <p className='message mt-5 mb-3'>I am a motivated and detail-oriented Junior front-end Developer with a passion for
building user-friendly and responsive web applications. Experienced in front-end
technologies such as HTML, CSS, JavaScript, and React.js. I am seeking an opportunity to
contribute to innovative projects and further develop skills in front-end or UI development.</p>
        <Link href="/skills" className='show_more badge text-decoration-none'><span>Show More</span> 
        <div className="load">
        <GrFormNext className='right right1'/>
        <GrFormNext className='right right2'/>
        <GrFormNext className='right right3'/>
         </div>
        </Link>
        </div>
    </div>
   </div>
   </>
  )
}
