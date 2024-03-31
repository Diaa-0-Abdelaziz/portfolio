import React from 'react'
import"./TwoProject.css"
import progect1 from '../../imges/project1.jpg';
import progect2 from '../../imges/project2.jpg';
import Image from 'next/image';
import { GrFormNext } from "react-icons/gr";
import Link from 'next/link';
export default function TwoProjects() {
  return (
    <>
    <section className='projects text-center'>
    <h3>Projects</h3>
        <div className="container text-center">
        <div className="row">
            <div className="col-lg-6 p-2">
                <Image priority width={400} height={600} src={progect1} className='w-100 h-auto' alt={progect1} />
            </div>
            <div className="col-lg-6 p-2">
            <Image priority width={400} height={600} src={progect2} className='w-100 h-auto' alt={progect2} />
            </div>
        </div>
        <Link href="/projects" className='show_more badge text-decoration-none my-4'><span>Show All Projects</span> 
        <div className="load">
        <GrFormNext className='right right1'/>
        <GrFormNext className='right right2'/>
        <GrFormNext className='right right3'/>
         </div>
        </Link>
        </div>
    </section>
    </>
  )
}
