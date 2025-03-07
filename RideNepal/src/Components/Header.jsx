import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";
import "./Homepage.css"

export default function Header({toggleMenu}) {
  return (
    <div className="home-main-container">
      {/* Header Section */}
      <header className="header">
        <div className="black-blue-logo"></div>
        <div className="group" />
        <div className="material-symbols-menu" onClick={toggleMenu} />
          <Link to="/book-ride" className="book-ride">Book a Ride</Link>
          <Link to="/about" className="about">About</Link>
          <Link to="/contact-us" className="contact-us">Contact Us</Link>
          <Link to="/home" className="home">Home</Link>
      </header>
    </div>
  );
}