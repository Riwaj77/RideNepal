import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./personaldetails.css";

export default function Personaldetails({ toggleMenu }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Token from localStorage:", token);

    if (!token) {
      console.error("No token found.");
      setError("No token found. Please log in.");
      setLoading(false);
      
      // Redirect to login after showing the error
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      return;
    }

    console.log("Fetching user data with token:", token);
    
    axios
      .get("http://localhost:4000/user", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        console.log("User data response:", response.data);
        setUser(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
        
        // Check for token related errors
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          setError("Authentication failed. Please log in again.");
          
          // Clear invalid token
          localStorage.removeItem("token");
          
          // Redirect to login
          setTimeout(() => {
            navigate("/login");
          }, 2000);
        } else {
          setError("Failed to fetch user data. Please try again.");
        }
        
        setLoading(false);
      });
  }, [navigate]);

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
            <span className="pd_welcome-barsha">
              Welcome, {user ? user.firstname : "User"}
            </span>
          </div>
        </div>
     
        {/* Display User Info */}
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : (
          <div className="pd_flex-row-cb">
            <span className="pd_email">Email</span>
            <span className="pd_phone-number">Phone Number</span>
            <div className="pd_rectangle" />
            <div className="pd_rectangle-2" />
            <span className="pd_profile-3">Profile</span>

            <Link to="/home">
              <span className="pd_ep-back" />
            </Link>

            {/* Profile Picture */}
            <div className="pd_ellipse">
              <img
                src={user.image || "/default-profile.png"}  // Default image if none provided
                alt="Profile"
                className="pd_user-profile-img"
              />
            </div>

            {/* Edit Button */}
            <button
              className="pd_frame"
              onClick={() => navigate("/Editpersonaldetails", { state: { user } })}
            >
              <span className="pd_edit">Edit</span>
            </button>

            <div className="pd_group-4">
              <span className="pd_barsha-maharjan">
                {user.firstname} {user.lastname}
              </span>
              <span className="pd_barsha-email">{user.email}</span>
            </div>

            {/* User Details */}
            <input
              className="pd_rectangle-6"
              placeholder="Your First Name"
              value={user.firstname}
              readOnly
            />
            <input
              className="pd_rectangle-7"
              placeholder="Your Last Name"
              value={user.lastname}
              readOnly
            />
            <input
              className="pd_rectangle-8"
              placeholder="Your Email"
              value={user.email}
              readOnly
            />
            <input
              className="pd_rectangle-a"
              placeholder="##########"
              value={user.phone}
              readOnly
            />
          </div>
        )}
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
        <span className="all-rights-reserved">© 2024 RideNepal. All Rights Reserved.</span>
      </footer>

      {/* Error Message Display */}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}
