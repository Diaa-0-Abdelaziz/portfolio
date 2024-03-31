"use client"
import React,{useState} from 'react';
import { CgMenuGridR } from "react-icons/cg";
import { AiFillCloseSquare } from "react-icons/ai";
import "./navbar.css"
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    let path =  usePathname()
    const [open, setOpen] = useState("link")
    function openWindow(){
      setOpen("link toggle")
    }
    function closeWindow(){
      setOpen("link")
    }
   let links =[
    {
      linkName:"Home",
      pathName: "/"
    },
    {
      linkName:"Skills",
      pathName: "/skills"
    },
    {
      linkName:"Projects",
      pathName: "/projects"
    },
    {
      linkName:"Contact me",
      pathName: "/contactme"
    },
   ]
  return (
    <>
    <div className="navbar fixed-top py-1 px-5">
   <div className='icon'>
   D
   </div>
   <div className="menu fs-3" onClick={openWindow}>
   <CgMenuGridR/>
   </div>
   <div className={open}>
   <span onClick={closeWindow} className=' close position-absolute end-0 m-2 fs-4 cursor'> <AiFillCloseSquare/></span>
   <ul className=' list-unstyled'>
    {links.map((link, index)=>
    <li key={index}>
    <Link className={path === link.pathName? 'active': ''} href={link.pathName} onClick={closeWindow}>{link.linkName}</Link>
  </li>
    )}
   </ul>
   </div>
   </div>
    </>
  )
}
