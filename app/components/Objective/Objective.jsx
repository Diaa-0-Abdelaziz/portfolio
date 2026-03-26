import React from 'react'
import { FaQuoteRight } from "react-icons/fa";
import { SiNextdotjs } from "react-icons/si";
import { IoLogoHtml5 } from "react-icons/io";
import { FaCss3Alt } from "react-icons/fa";
import { FaVuejs } from "react-icons/fa";
import { SiPhp } from "react-icons/si";
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
              <div className="circle"><FaVuejs /></div>
              <div className="circle2"><TbBrandJavascript /></div>
              <div className="circle3"><SiPhp /></div>
              <div className="circle4"><RiReactjsLine /></div>
              <div className="circle_center">
                <div className="circle5">
                  <SiNextdotjs />
                </div>
              </div>
            </div>
          </div>
          <div className=" mt-5 d-flex flex-column justify-content-center align-items-center px-3">
            <div className="icon">
              <FaQuoteRight />
            </div>
            <p className='message mt-5 mb-3'>I am a motivated and detail-oriented Frontend Developer with 2+ years of hands-on experience in building responsive,
              user-friendly web applications. Skilled in React.js, Vue.js, HTML, CSS, and JavaScript, I have experience integrating third-party libraries,
              creating dynamic components, and implementing interactive UI features. I am passionate about clean code, efficient component design,
              and seamless user experiences, and I strive to contribute to innovative projects while continuously improving my front-end expertise.
            </p>
            {/* <Link href="/skills" className='show_more badge text-decoration-none'><span>Show More</span>
              <div className="load">
                <GrFormNext className='right right1' />
                <GrFormNext className='right right2' />
                <GrFormNext className='right right3' />
              </div>
            </Link> */}
          </div>
        </div>
      </div>
    </>
  )
}
