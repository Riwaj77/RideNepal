import React from "react";
import { Link } from "react-router-dom";
import "./Verify.css";

export default function Verify() {
  return (
    <div className="main-container">
      {/* Header Section */}
      <header className="header">
        <div className="black-blue-logo"></div>
        <div className="frame">
          <Link to="/signup" className="next">Sign Up</Link>
        </div>
    
          <Link to="/login" className="login">Login</Link>
          <Link to="/book-ride" className="book-ride">Book a Ride</Link>
          <Link to="/about" className="about">About</Link>
          <Link to="/contact-us" className="contact-us">Contact Us</Link>
          <Link to="/" className="home">Home</Link>
      </header>

      {/* Main Login Section */}
       <div className="login-main-container">
             <div className="login-login-1">
               <div className="login-flex-row-ec">
                 <div className="login-frame">
                   <div className="login-yellow-white-modern"></div>
                 </div>
                 <div className="login-frame-2">
                   <span className="login-3">Verify Code</span>
                 </div>
                 <button className="login-group">
                   <div className="login-frame-4">
                     <span> <Link to="/home" className="login-next">Done</Link></span>
                   </div>
                 </button>
               </div>
               <div className="login-flex-row-b">
                 <div className="login-black-blue-minimalist"></div>
                 <div className="login-group-5">
                   <span className="login-ride-nepal">RideNepal</span>
                 </div>
                 <div className="login-black-blue-minimalist-6"></div>
               </div>
               <span className="login-access">We’ve sent you a 6-digit confirmation code at</span>
               <div className="login-flex-row-dbc">
                 <span className="login-enter-mobile-number">Enter your code</span>

                   <input className="verify-number" placeholder="##########" maxLength={6}/>
            
                 
               </div>
             </div>
           </div>



      {/* Footer Section */}
      <footer className="footer">
        <div className="flex-row-feb">
          <div className="location">
            <div className="round-place-px"></div>
            <span className="faulconer-drive">Naxal, Kathmandu, Nepal</span>
          </div>
          <nav className="footer-navigation">
            <Link to="/about" className="about-us">About Us</Link>
            <Link to="/contact-us" className="contact-us-c">Contact Us</Link>
            <Link to="/help" className="help">HELP</Link>
          </nav>
        </div>

        <div className="flex-row-d">
          <div className="black-blue-minimalist-d"></div>
          <div className="round-phone-px"></div>
          <span className="phone-number">+977 9456784590</span>
        </div>

        <span className="all-rights-reserved">
          © 2024 RideNepal. All Rights Reserved.
        </span>
      </footer>
    </div>
  );
}
