import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";
import "./Homepage.css"

export default function Homepage({toggleMenu}) {
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

    <div className="home-booking-section">
      <div className="home-booking-segment">
        <div className="home-booking-form">
          <span className="home-ride-nepal">RideNepal</span>
          <div className="home-form-title">
            <span className="home-form-subtitle">
              Ready, set, go 
              in just a few quick taps
            </span>
          </div>
          <button className="home-button-group">
  
          </button>
          <div className="home-bicycle-bike" />
          <span className="home-reliable-ride">
            Get a reliable ride in minutes
          </span>
          <div className="home-wallet" />
          <span className="home-digital-wallet">
            Get a digital wallet feature for secure and convenient payments
          </span>
          <div className="home-location-compass" />
          <span className="home-live-location">
            Share you live location with others
          </span>
        </div>
        <div className="home-hero-image" />
      </div>
    </div>
    <div className="home-booking-section-1">
      <div className="home-booking-segment-2">
        <div className="home-hero-image-3" />
        <div className="home-booking-form-4">
          <div className="home-form-title-5">
            <span className="home-form-subtitle-6">Need a ride?</span>
            <div className="home-form-main-title">
              <span className="home-book-with">Book with </span>
              <span className="home-ridenepal">RideNepal</span>
              <span className="home-book-with-7"> now!</span>
            </div>
          </div>
          <div className="home-form-fields">
            <div className="home-form-header">
              <span className="home-find-a-ride-now">Find a ride now</span>
            </div>
            <div className="home-fields-column">
              <div className="home-select-outlined">
                <div className="home-input">
                  <div className="home-label-container">
                    <span className="home-your-pickup">Your Pickup</span>
                  </div>
                  <div className="home-active">
                    <span className="home-current-location">
                      Current Location
                    </span>
                    <div className="home-mui-autocomplete-indicator">
                      <div className="home-icon-button">
                        <div className="home-unstyled-icon-button">
                          <div className="home-filled-navigation-close" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <input className="home-select-outlined-input" />
              </div>
              <div className="home-autocomplete">
                <div className="home-input-8">
                  <div className="home-label-container-9">
                    <span className="home-your-destination">Your Destination</span>
                  </div>
                  <div className="home-active-a">
                    <span className="home-divider">|</span>
                    <div className="home-mui-autocomplete-indicator-b">
                      <div className="home-icon-button-c">
                        <div className="home-unstyled-icon-button-d">
                          <div className="home-filled-navigation-close-e" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <input className="home-autocomplete-input" />
              </div>
            </div>
            <div className="home-cta-section">
              <button className="home-find-driver-button">
                <div className="home-group">
                  <div className="home-group-f">
                    <div className="home-location-icon" />
                    <div className="home-text">
                      <span className="home-edit-label">find a driver</span>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className="home-why-choose-section">
      <span className="home-best-out-there">The best out there</span>
      <span className="home-why-ridenepal">Why choose RideNepal?</span>
      <div className="home-cards-column">
        <div className="home-why-card">
          <div className="home-card-image">
            <div className="home-riders-everywhere" />
          </div>
          <div className="home-card-text">
            <span className="home-wide-coverage">Our rides are everywhere</span>
            <span className="home-multiple-cities">
              We have a wide range of coverage. We are available in multiple
              cities in the US and in Asia.
            </span>
          </div>
        </div>
        <div className="home-why-card-10">
          <div className="home-card-image-11" />
          <div className="home-card-text-12">
            <span className="home-fast-and-easy-booking">
              Fast and easy booking
            </span>
            <span className="home-book-rides-easily">
              Book by going to RideNepal website to book rides easily.
            </span>
          </div>
        </div>
        <div className="home-why-card-13">
          <div className="home-card-image-14" />
          <div className="home-card-text-15">
            <span className="home-wallet-thank-you">
              Your wallet will thank you
            </span>
            <span className="home-lowest-fares-available">
              We have the lowest fares available now and you can pay online
              through our app.
            </span>
          </div>
        </div>
      </div>
      <div className="home-become-driver-section">
        <div className="home-car-image" />
        <div className="home-become-driver-text">
          <span className="home-become-a-driver">Become a Driver</span>
          <span className="home-register-as-driver">
            Be a part of a growing community of RideNepal. Register as a
            driver and don’t forget to register your bike as well.
          </span>
        </div>
        <button className="home-register-button">
          <span className="home-label-text">Register now</span>
        </button>
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