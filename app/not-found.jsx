'use client'
import React from 'react'
import Link from 'next/link';
import { HiOutlineArrowLeft } from "react-icons/hi";
import "./not-found.css"
import { useLang } from "./i18n/LanguageProvider";

export default function NotFound() {
  const { t } = useLang();
  return (
    <section className='not-found-page'>
      <div className="container not-found-inner">
        <p className="not-found-code mono accent">404</p>
        <p className="not-found-text">{t.notFound.text}</p>
        <Link href="/" className="btn btn-primary">
          <HiOutlineArrowLeft className="flip-rtl" /> {t.notFound.back}
        </Link>
      </div>
    </section>
  )
}
