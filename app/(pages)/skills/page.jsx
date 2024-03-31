import React from 'react'
import { FaCss3Alt } from "react-icons/fa";
import { TbBrandJavascript } from "react-icons/tb";
import { RiReactjsLine } from "react-icons/ri";
import { IoLogoHtml5 } from "react-icons/io";
import { SiNextdotjs } from "react-icons/si";
import { FaBootstrap } from "react-icons/fa";
import { SiJquery } from "react-icons/si";
import { DiResponsive } from "react-icons/di";
import { FaResolving } from "react-icons/fa6";
import { FaGitAlt } from "react-icons/fa";
import { FaGithubSquare } from "react-icons/fa";
import { SiAxios } from "react-icons/si";
import "./skills.css"
export default function Skills() {
    let data = [
        {
         icon:<IoLogoHtml5/>,
         text:"Html5"
        },
        {
         icon:<FaCss3Alt/>,
         text:"Css3"
        },
        {
         icon:<TbBrandJavascript/>,
         text:"Javascript"
        },
        {
         icon:<SiJquery/>,
         text:"jQuery"
        },
        {
         icon:<FaBootstrap/>,
         text:"Bootstrap"
        },
        {
         icon:<RiReactjsLine/>,
         text:"React.js"
        },
        {
         icon:<SiNextdotjs/>,
         text:"NEXT.js"
        },
        {
         icon:<DiResponsive/>,
         text:"Responsive"
        },
        {
         icon:<FaResolving/>,
         text:"Problem Solving"
        },
        {
         icon:<FaGitAlt/>,
         text:"Git"
        },
        {
         icon:<FaGithubSquare/>,
         text:"Github"
        },
        {
         icon:<SiAxios/>,
         text:"Axios"
        },
    ]
  return (
    <>
    <section className='vh-100 Skills_Component'>
     <div className="container h-100 d-flex align-items-center justify-content-center mt-5">
        <ul className=' list-unstyled d-flex flex-wrap justify-content-center'>
            {
                data.map((data, index)=>
                <li key={index} className='icons d-flex flex-column align-items-center mx-2 my-4'>
               <div className='icon'>
                {data.icon}
               </div>
                <span>{data.text}</span>
              </li>
                )
            }
        </ul>
     </div>
    </section>
    </>
  )
}
