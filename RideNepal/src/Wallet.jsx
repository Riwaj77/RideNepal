import React from "react";
import { Link } from "react-router-dom";
import "./personaldetails.css";
import "./Editpd.css";
import "./Wallet.css";

export default function Editpd({toggleMenu}) {
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

        <div className="pd_flex-row-cb">
          <div className="pd_rectangle" />
          <div className="pd_rectangle-2" />
          <span className="pd_profile-3">Wallet</span>

          <Link to="/home">
          <span className="pd_ep-back" />
          </Link>
          <div className="pd_ellipse" />
                
            <span className="wallet_balance">Balance</span>
        <span className="wallet_balance-amount">Rs.2000.00</span>
        <span className="wallet_payment-history">Payment History</span>
        <div className="wallet_flex-row-bce">
        <div className="wallet_rectangle" />
        <div className="wallet_rectangle-1" />
        <div className="wallet_frame">
            <div className="wallet_frame-2">
            <div className="wallet_frame-3">
                <span className="wallet_date">Mar 1, 2024</span>
            </div>
            <div className="wallet_group">
                <div className="wallet_icons" />
                <span className="wallet_price">Rs. 100</span>
            </div>
            </div>
        </div>
        <div className="wallet_group-4" />
        <button className="wallet_load-money" />
        <div className="wallet_material-symbols-light" />
        <span className="wallet_ese-wa">Esewa</span>
        </div>

        <button className="pd_button-frame">
        <span className="pd_save">Save</span>
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
