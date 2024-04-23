import React from 'react'
import Image from 'next/image'
import { GrFormNext } from "react-icons/gr";
import project1 from '../../imges/project1.jpg';
import project2 from '../../imges/project2.jpg';
import project3 from '../../imges/project3.jpg';
import project4 from '../../imges/project4.jpg';
import project5 from '../../imges/project5.jpg';
import project6 from '../../imges/project6.jpg';
import project7 from '../../imges/project7.jpg';
import project8 from '../../imges/project8.jpg';
import project9 from '../../imges/project9.jpg';
import"./projects.css"
import Link from 'next/link';
export default function projects() {
    let progects = [
        {
            img:project9,
            title:"Tajeer",
            tecnoUsed:"Html, Css, js, Bootstrap, responsive, React,formik and yup for validation",
            live:"https://tajeer-v376.vercel.app/",
            code:"https://github.com/Diaa-0-Abdelaziz/tageer",
            role:"web app"
        },
        {
            img:project1,
            title:"fresh cart",
            tecnoUsed:"Html, Css, js, Bootstrap, responsive, React, api",
            live:"https://ecommerce-cq61q9log-diaa-abdelazizs-projects.vercel.app/",
            code:"https://github.com/Diaa-0-Abdelaziz/Ecommerce",
            role:"E-Commerce app"
        },
        {
            img:project2,
            title:"Fast-Food",
            tecnoUsed:"Html, Css, js, Bootstrap, Next.js, api, animation, responsive",
            live:"https://fast-food-eosin-gamma.vercel.app/",
            code:"https://github.com/Diaa-0-Abdelaziz/FastFood",
            role:"web app"
        },
        {
            img:project3,
            title:"Fernature",
            tecnoUsed:"Html5, Css3, js, Bootstrap, React, animation, responsive",
            live:"https://fernature-six.vercel.app/",
            code:"https://github.com/Diaa-0-Abdelaziz/fernature",
            role:"landing page"
        },
        {
            img:project4,
            title:"CRUD System",
            tecnoUsed:"Html5, Css3, js, Bootstrap, animation, Regux",
            live:"https://diaa-0-abdelaziz.github.io/CRUD-APP/",
            code:"https://github.com/Diaa-0-Abdelaziz/CRUD-APP",
            role:"js app"
        },
        {
            img:project5,
            title:"Yummy",
            tecnoUsed:"Html5, Css3, js, Bootstrap, animation, Regux, api",
            live:"https://diaa-0-abdelaziz.github.io/Exam2-Yummy/",
            code:"https://github.com/Diaa-0-Abdelaziz/Exam2-Yummy",
            role:"js app"
        },
        {
            img:project6,
            title:"Mealify",
            tecnoUsed:"Html5, Css3, animation, darkmode, responsive",
            live:"https://diaa-0-abdelaziz.github.io/Mealify/",
            code:"https://github.com/Diaa-0-Abdelaziz/Mealify",
            role:"landing page"
        },
        {
            img:project7,
            title:"Daniels",
            tecnoUsed:"Html5, Css3, Bootstrap, animation, responsive",
            live:"https://diaa-0-abdelaziz.github.io/Exam1-DANIELS/",
            code:"https://github.com/Diaa-0-Abdelaziz/Exam1-DANIELS",
            role:"landing page"
        },
        {
            img:project8,
            title:"Hehia Clinics",
            tecnoUsed:"Html5, Css3, js, Bootstrap, animation, responsive",
            live:"https://diaa-0-abdelaziz.github.io/Hehia-City-Clinics/",
            code:"https://github.com/Diaa-0-Abdelaziz/Hehia-City-Clinics",
            role:"web app"
        }
    ]
  return (
    <>
    <section className='projects'>
        <div className="container">
           <div className="row">
          {
            progects.map((project, index)=>
            <div key={index} className="col-lg-3 col-md-4 col-sm-6 p-2">
            <div className="cart overflow-hidden position-relative">
                <div className="role badge position-absolute top-0 end-0 text-uppercase">{project.role}</div>
            <Image priority width={400} height={600} src={project.img} className='w-100 h-auto' alt={project.img} />
               <div className="card-body">
                 <h5 className="card-title">{project.title}</h5>
                 <h6>Tech-used:</h6>
                 <p className="card-text">{project.tecnoUsed}</p>
                 <Link href={project.live} target='_blank' className='show_more badge text-decoration-none my-4'><span>Live</span> 
            <div className="load">
            <GrFormNext className='right right1'/>
            <GrFormNext className='right right2'/>
            <GrFormNext className='right right3'/>
             </div>
            </Link>
            <Link href={project.code} target='_blank' className='show_more badge text-decoration-none my-4'><span>Code</span> 
            <div className="load">
            <GrFormNext className='right right1'/>
            <GrFormNext className='right right2'/>
            <GrFormNext className='right right3'/>
             </div>
            </Link>
              </div>
            </div>
                </div>
            )
          }
           </div>
        </div>
    </section>
    </>
  )
}
