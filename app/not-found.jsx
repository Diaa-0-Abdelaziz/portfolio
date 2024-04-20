import React from 'react'
import notfound from "./imges/notfound.png"
import Image from 'next/image'
import Link from 'next/link';
export default function notFound() {
  return (
   <>
   <section className='notFound vh-100 bg-dark'>
    <div className="container d-flex align-items-center flex-column">
    <Image priority width={400} height={600} src={notfound} className=' w-75 h-auto' alt={notfound} />
    <p className=' text-capitalize'>*****this page not found*****</p>
    <Link href="/" className='text-capitalize'> back to home</Link>
    </div>
   </section>
   </>
  )
}
