import React from "react";
import { Link } from "react-router-dom";
import "./personaldetails.css";

export default function Main({toggleMenu}) {
  return (
    <div className="pd_main-container">
         {/* Header Section */}
      <header className="header">
        <div className="black-blue-logo"></div>
        <div className="group" />
        <div className="material-symbols-menu" onClick={toggleMenu} />
          <Link to="/book-ride" className="book-ride">Book a Ride</Link>
          <Link to="/about" className="about">About</Link>
          <Link to="/contact-us" className="contact-us">Contact Us</Link>
          <Link to="/home" className="pd_home">Home</Link>
      </header>

      <div className="pd_profile-setting">
        <div className="pd_group">
          <div className="pd_group-1">
            <span className="pd_welcome-barsha">Welcome, Barsha</span>
          </div>
        </div>
        <div className="pd_flex-row-cb">
          <span className="pd_email">Email</span>
          <span className="pd_phone-number">Phone Number</span>
          <div className="pd_rectangle" />
          <div className="pd_rectangle-2" />
          <span className="pd_profile-3">Profile</span>
          <div className="pd_ep-back" />
          <div className="pd_ellipse" />
          <button className="pd_frame">
            <span className="pd_edit">Edit</span>
          </button>
          <div className="pd_user-profile" />
          <div className="pd_group-4">
            <span className="pd_barsha-maharjan">Barsha Maharjan</span>
            <span className="pd_barsha-email">barsha12@gmail.com</span>
          </div>
          <span className="pd_phone-number-5">+977</span>
          <span className="pd_number">##########</span>
          <span className="pd_first-name">First Name</span>
          <span className="pd_last-name">Last Name</span>
          <div className="pd_rectangle-6" />
          <div className="pd_rectangle-7" />
          <span className="pd_your-first-name">Your First Name</span>
          <span className="pd_your-last-name">Your Last Name</span>
          <div className="pd_rectangle-8" />
          <span className="pd_your-email">Your Email </span>
          <div className="pd_arrow-down">
            <div className="pd_arrow-down-9" />
          </div>
          <div className="pd_rectangle-a" />
          <div className="pd_arrow-down-b">
            <div className="pd_arrow-down-c" />
          </div>
          <span className="pd_number-d">##########</span>
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
