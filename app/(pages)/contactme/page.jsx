"use client"
import React, { useState } from 'react'
import styles from './contact.module.css'
export default function ContactUs() {
  const [lengthOfUserNameInputs, setLengthOfUserNameInputs] = useState(true)
 const [lengthOfuserEmailInputs, setLengthOfuserEmailInputs] = useState(true)
 const [lengthOfuserMessage, setLengthOfuserMessage] = useState(true)
  
 function showUserNameMessage(e){
  const lengthOf = e.target.value.length
  if(lengthOf >= 1){
    setLengthOfUserNameInputs(false)
  }else{
    setLengthOfUserNameInputs(true)
  }
  
}
function showUserEmailMessage(e){
  const lengthOf = e.target.value.length
  if(lengthOf >= 1){
    setLengthOfuserEmailInputs(false)
  }else{
    setLengthOfuserEmailInputs(true)
  }
  
}
function showUserPasswordMessage(e){
  const lengthOf = e.target.value.length
  if(lengthOf >= 1){
    setLengthOfuserMessage(false)
  }else{
    setLengthOfuserMessage(true)
  }
  
}
 return (
  <>
 <div className={` vh-100 ${styles.cover}`}>
  <div className={styles.main}>
     <div className="container row d-flex justify-content-center p-5">
       <div className="col-sm-8">
       <div className="my-5 position-relative z-3">
         <span className={ lengthOfUserNameInputs ? `${styles.topOfInput} ${styles.changeTop}` : styles.topOfInput}>Full Name:</span>
         <input type="text"onInput={showUserNameMessage} className={styles.form_inputs} placeholder='userName'/>
       </div>
       
       <div className="my-5 position-relative z-3">
       <span className={ lengthOfuserEmailInputs ? `${styles.topOfInput} ${styles.changeTop}` : styles.topOfInput}>userEmail:</span>
         <input type="email" onInput={showUserEmailMessage} className={styles.form_inputs} aria-describedby="emailHelp" placeholder='userEmail'/>
       </div>

       <div className="my-5 position-relative z-3">
       <span className={ lengthOfuserMessage ? `${styles.topOfInput} ${styles.changeTop}` : styles.topOfInput}>Your message:</span>
         <textarea type="text" onInput={showUserPasswordMessage} className={styles.form_inputs} placeholder='write your message'/>
       </div>

       <button type="submit" className={styles.button}>Submit</button>
       </div>
     </div>
   </div>
 </div>
 </>
  )
}
