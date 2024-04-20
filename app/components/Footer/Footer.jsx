import React from 'react'
import { FaFacebookSquare } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa";
import { FaGithubSquare } from "react-icons/fa";
import { FaWhatsappSquare } from "react-icons/fa";
import"./footer.css"
export default function Footer() {
  return (
    <>
      <footer>
          <div className="container d-flex justify-content-center">
          <ul className=' list-unstyled d-flex m-auto'>
            <li><a href='https://www.facebook.com/profile.php?id=100079659855523' aria-label="go to my account on facebook"><FaFacebookSquare/></a></li>
            <li><a href='https://www.linkedin.com/in/diaa-abdulaziz-232530201' aria-label="go to my account on linked in"><FaLinkedin/></a></li>
            <li><a href='https://github.com/Diaa-Abdelaziz' aria-label="go to my account on github"><FaGithubSquare/></a></li>
            <li><a href="https://wa.me/201117578674" rel="noopener noreferrer" aria-label="send message by whatsapp"><FaWhatsappSquare/></a></li>
          </ul>
          </div>
      </footer>
    </>
  )
}
