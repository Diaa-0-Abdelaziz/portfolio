import React from 'react'
import Link from 'next/link';
import { HiOutlineArrowLeft } from "react-icons/hi";
import "./not-found.css"

export default function notFound() {
  return (
    <section className='not-found-page'>
      <div className="container not-found-inner">
        <p className="not-found-code mono accent">404</p>
        <p className="not-found-text">This page took a wrong turn.</p>
        <Link href="/" className="btn btn-primary">
          <HiOutlineArrowLeft /> Back to home
        </Link>
      </div>
    </section>
  )
}
