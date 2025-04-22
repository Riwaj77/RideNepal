import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./Verify.css";

export default function Verify() {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = localStorage.getItem('email');

  // Check if email exists when component mounts
  useEffect(() => {
    if (!email) {
      console.error("No email found in localStorage");
      
      alert("Please login again to receive an OTP");
      navigate("/login");
      return;
    }
    
    console.log("Email found for verification:", email);
    
    // Check if token already exists (user might have refreshed the page)
    const existingToken = localStorage.getItem('token');
    if (existingToken) {
      console.log("Token already exists, might be a refresh or duplicate session");
    }
  }, [email, navigate]);

  // Handle OTP verification
  const handleVerify = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Basic validation
    if (!email) {
      alert("Email not found. Please try logging in again.");
      navigate("/login");
      setIsLoading(false);
      return;
    }

    if (code.trim() === "") {
      alert("Please enter the verification code");
      setIsLoading(false);
      return;
    } else if (code.length !== 6) {
      alert("Verification code must be 6 digits");
      setIsLoading(false);
      return;
    }

    try {
      const requestData = { 
        email: email.trim(),
        otp: code 
      };
      
      console.log("Sending verification request with:", requestData);
      
      // Make API call to verify OTP
      const response = await axios.post("http://localhost:4000/verify-otp", requestData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log("Verification response:", response.data);
      
      if (response.data.message === 'OTP verified successfully') {
        // Store the token properly from the response
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          console.log("Token stored successfully:", response.data.token);
        } else {
          console.warn("No token received in verification response");
        }
        
        // Clear only temporary data
        localStorage.removeItem('email');
        
        // Verify token was stored
        const storedToken = localStorage.getItem('token');
        console.log("Stored token after verification:", storedToken);
        
        // Navigate to home
        navigate("/home");
      }
    } catch (error) {
      console.error('Verification error:', error);
      if (error.response?.status === 400) {
        alert(error.response.data.message || "Invalid verification code. Please try again.");
      } else if (error.response?.status === 404) {
        alert("User not found. Please try logging in again.");
        navigate("/login");
      } else {
        alert("An error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

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

      {/* Main Verification Section */}
      <div className="login-main-container">
        <div className="login-login-1">
          <div className="login-flex-row-ec">
            <div className="login-frame">
              <div className="login-yellow-white-modern"></div>
            </div>
            <div className="login-frame-2">
              <span className="login-3">Verify Code</span>
            </div>
            <button 
              className="login-group" 
              onClick={handleVerify}
              disabled={isLoading}
            >
              <div className="login-frame-4">
                <span className="login-next">
                  {isLoading ? 'Verifying...' : 'Verify'}
                </span>
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
          <span className="login-access">
            We've sent you a 6-digit confirmation code at your registered email
          </span>
          <div className="login-flex-row-dbc">
            <span className="login-enter-mobile-number">Enter your code</span>
            <input
              className="verify-number"
              placeholder="######"
              maxLength={6}
              value={code}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                setCode(value);
              }}
              disabled={isLoading}
            />
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
