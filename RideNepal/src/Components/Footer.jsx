import React from "react";
import { Link } from "react-router-dom";
import "../Home.css";
import "../Homepage.css"

export default function footer() {
  return (
    <div className="home-main-container">

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