import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";
import "./Aboutus.css"

export default function Aboutus({toggleMenu}) {
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

      {/* Main Section */}
      <div className="about_positive-caring-relationships-teachers">
        <div className="about_frame">
          <span className="about_about-us-1">About Us</span>
          <span className="about_lorem-ipsum">
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry's standard dummy text
            ever since the 1500s,
          </span>
        </div>
        <button className="about_frame-2">
          <span className="about_see-more">See More</span>
        </button>
      </div>
      <div className="about_about">
        <div className="about_flex-column-c">
          <span className="about_about-us-3">About Us</span>
          <span className="about_dummy-text-industry">
            Lorem Ipsum is simply dummy text of
            <br />
            the printing and typesetting industry. Lorem Ipsum has been the
            industry's standard dummy text ever since the 1500s, when an unknown
            printer took
            <br />a galley of type and scrambled it to make a type specimen
            book. It has survived not only five centuries, but
            <br />
            also the leap into electronic
            <br />
            typesetting, remaining essentially unchanged.
          </span>
        </div>
        <div className="about_group">
          <div className="about_group-4">
            <span className="about_dummy-text-industry-5">
              Lorem Ipsum is simply dummy
              <br />
              text of the printing and typesetting
              <br />
              industry. Lorem Ipsum has been
              <br />
              the industry's standard dummy
              <br />
              text ever since the 1500s,
            </span>
          </div>
          <div className="about_group-6">
            <span className="about_text-7">
              Lorem Ipsum is simply dummy
              <br />
              text of the printing and typesetting
              <br />
              industry. Lorem Ipsum has been
              <br />
              the industry's standard dummy
              <br />
              text ever since the 1500s,
            </span>
          </div>
          <div className="about_box-2">
            <span className="about_text-8">
              Lorem Ipsum is simply dummy
              <br />
              text of the printing and typesetting
              <br />
              industry. Lorem Ipsum has been
              <br />
              the industry's standard dummy
              <br />
              text ever since the 1500s,
            </span>
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