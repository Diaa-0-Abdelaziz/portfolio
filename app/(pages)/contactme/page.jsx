"use client"
import React from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import toast, { Toaster } from "react-hot-toast";
import "./ContactInfo.css"
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
          getData(values, { resetForm: formik.resetForm })
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
          console.log(data.message); 
          toast.success(data.message)
          resetForm();
      } catch (error) {
          toast.error(error);
      }
      
      }
  return (
    <section className='contactForm vh-100'>
     <div className="container h-100 d-flex align-items-center  justify-content-center">
        
        
    <form onSubmit={formik.handleSubmit}>
    <Toaster
  position="bottom-center"
  reverseOrder={false}
/>
      <div className="mb-3">
        <label htmlFor="exampleInputName1">Your Name:</label>
        <input type="text" className="inputsForm" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.name} name='name' id="exampleInputName1"/>
        {formik.touched.name && formik.errors.name ? <p className='text-danger'>{formik.errors.name}</p>: ""}
      </div>
      <div className="mb-3">
        <label htmlFor="exampleInputEmail1">Your Email:</label>
        <input type="email" className="inputsForm" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.email} name='email' id="exampleInputEmail1"/>
        {formik.touched.email && formik.errors.email ? <p className='text-danger'>{formik.errors.email}</p>: ""}
      </div>
      <div className="mb-3">
        <label htmlFor="exampleInputmessage1">Your Message:</label>
        <textarea className="inputsForm" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.message} name='message' id="exampleInputmessage1" cols="40" rows="5"></textarea>
        {formik.touched.message && formik.errors.message ? <p className='text-danger'>{formik.errors.message}</p>: ""}
      </div>
      
      <button disabled={!(formik.isValid && formik.dirty)} type="submit" className="text-uppercase">Send Message</button>
      
    </form>
       
     </div>
    </section>
  )
}
