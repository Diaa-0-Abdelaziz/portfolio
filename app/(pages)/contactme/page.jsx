"use client"
import React from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker } from "react-icons/hi";
import { FaFacebookSquare, FaLinkedin, FaGithubSquare, FaWhatsappSquare } from "react-icons/fa";
import "./ContactInfo.css"

const socials = [
  { icon: <FaGithubSquare />, href: "https://github.com/Diaa-0-Abdelaziz", label: "GitHub" },
  { icon: <FaLinkedin />, href: "https://www.linkedin.com/in/diaa-abdulaziz-232530201", label: "LinkedIn" },
  { icon: <FaFacebookSquare />, href: "https://www.facebook.com/profile.php?id=100079659855523", label: "Facebook" },
  { icon: <FaWhatsappSquare />, href: "https://wa.me/201117578674", label: "WhatsApp" },
];

export default function ContactForm() {

    let mySchema = Yup.object({
        name:Yup.string().required('name is required').min(3,'min is 3 char').max(15, 'max is 15 char') ,
        email:Yup.string().email("email isn't valid").required('email is required'),
        message:Yup.string().required('message is required').min(10,'You shold write 10 char or more').max(100, 'max length 100 char')
      })
      let formik = useFormik({
        initialValues:{
          name: "",
          email:"",
          message:"",
        },
        validationSchema:mySchema,
        onSubmit:(values, { resetForm })=>{
          return getData(values, { resetForm })
        }
      })

      async function getData(values, { resetForm }){
        try {
          const response = await fetch('https://api.web3forms.com/submit', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                  apikey: '3357b040-dfdf-44c3-8349-c42cd501f8c6',
                  ...values,
              }),
          });
          const data = await response.json();
          toast.success(data.message);
          resetForm();
      } catch (error) {
          toast.error("Something went wrong, please try again.");
      }

      }
  return (
    <section className='section contactForm'>
     <div className="container contact-grid">
        <Toaster position="bottom-center" reverseOrder={false} />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="section-kicker mono">Get in touch</p>
          <h1 className="section-title">
            Let&rsquo;s build something <span className="accent">great</span> together
          </h1>
          <p className="contact-intro">
            Have a project in mind or just want to say hi? My inbox is always
            open — I try to reply within a day or two.
          </p>

          <ul className="contact-info-list">
            <li>
              <span className="contact-info-icon"><HiOutlineMail /></span>
              <a href="mailto:diaaa5350@gmail.com">diaaa5350@gmail.com</a>
            </li>
            <li>
              <span className="contact-info-icon"><HiOutlinePhone /></span>
              <a href="https://wa.me/201117578674" target="_blank" rel="noopener noreferrer">+20 111 757 8674</a>
            </li>
            <li>
              <span className="contact-info-icon"><HiOutlineLocationMarker /></span>
              <span>Egypt</span>
            </li>
          </ul>

          <ul className="contact-socials">
            {socials.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
                  {s.icon}
                </a>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.form
          onSubmit={formik.handleSubmit}
          className="contact-form card"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        >
          <div className="field">
            <input
              type="text"
              className="inputsForm"
              placeholder=" "
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.name}
              name='name'
              id="name"
            />
            <label htmlFor="name">Your Name</label>
            {formik.touched.name && formik.errors.name ? <p className='field-error'>{formik.errors.name}</p>: ""}
          </div>

          <div className="field">
            <input
              type="email"
              className="inputsForm"
              placeholder=" "
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
              name='email'
              id="email"
            />
            <label htmlFor="email">Your Email</label>
            {formik.touched.email && formik.errors.email ? <p className='field-error'>{formik.errors.email}</p>: ""}
          </div>

          <div className="field">
            <textarea
              className="inputsForm"
              placeholder=" "
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.message}
              name='message'
              id="message"
              rows="5"
            ></textarea>
            <label htmlFor="message">Your Message</label>
            {formik.touched.message && formik.errors.message ? <p className='field-error'>{formik.errors.message}</p>: ""}
          </div>

          <button
            disabled={!(formik.isValid && formik.dirty) || formik.isSubmitting}
            type="submit"
            className="btn btn-primary submit-btn"
          >
            {formik.isSubmitting ? "Sending..." : "Send Message"}
          </button>
        </motion.form>

     </div>
    </section>
  )
}
