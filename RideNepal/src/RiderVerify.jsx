import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Verify.css";

export default function RiderVerify() {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [email, setEmail] = useState(localStorage.getItem('riderEmail'));
  const [token, setToken] = useState(localStorage.getItem('riderToken'));
  const initialCheckDone = useRef(false);
  const isVerifying = useRef(false);

  // Check if email and token exist
  useEffect(() => {
    if (initialCheckDone.current) return;
    
    const storedEmail = localStorage.getItem('riderEmail');
    const storedToken = localStorage.getItem('riderToken');
    
    console.log('Session check - Email:', storedEmail);
    console.log('Session check - Token:', storedToken);
    
    if (!storedEmail || !storedToken) {
      alert("Please complete the login process first.");
      navigate("/riderlogin");
    } else {
      setEmail(storedEmail);
      setToken(storedToken);
      initialCheckDone.current = true;
    }
  }, [navigate]);

  // Handle OTP verification
  const handleVerify = async (e) => {
    e.preventDefault();
    if (isVerifying.current) return;
    
    setIsLoading(true);
    isVerifying.current = true;
    
    const currentEmail = localStorage.getItem('riderEmail');
    const currentToken = localStorage.getItem('riderToken');
    
    if (!currentEmail || !currentToken) {
      alert("Please complete the login process first.");
      navigate("/riderlogin");
      return;
    }

    if (code.trim() === "") {
      alert("Please enter the verification code");
      setIsLoading(false);
      isVerifying.current = false;
      return;
    } else if (code.length !== 6) {
      alert("Verification code must be 6 digits");
      setIsLoading(false);
      isVerifying.current = false;
      return;
    }

    try {
      const requestData = { 
        email: currentEmail.trim(),
        otp: code 
      };
      
      console.log('Verification request data:', requestData);
      
      // Make API call to verify OTP for rider
      const response = await axios.post("http://localhost:4000/riders/verify-otp", requestData, {
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      });

      console.log('Verification response:', response.data);

      if (response.data.message === 'OTP verified successfully') {
        // Get rider profile data
        const profileResponse = await axios.get('http://localhost:4000/riders/profile', {
          headers: {
            'Authorization': `Bearer ${currentToken}`
          }
        });

        console.log('Profile response:', profileResponse.data);

        if (profileResponse.data.success) {
          // Log the complete profile response for debugging
          console.log('Complete profile response:', JSON.stringify(profileResponse.data, null, 2));
          
          // Extract rider data from response
          const rider = profileResponse.data.rider;
          console.log('Rider data from response:', JSON.stringify(rider, null, 2));
          
          // Extract rider ID from the token
          const token = response.data.token;
          const tokenPayload = JSON.parse(atob(token.split('.')[1]));
          const riderId = tokenPayload.riderId;
          
          console.log('Extracted rider ID from token:', riderId);
          
          // Store rider data in localStorage
          const riderData = {
            id: riderId, // Use the ID from the token
            name: `${rider.firstName} ${rider.lastName}`,
            email: rider.email,
            phone: rider.phone,
            vehicle: rider.vehicleType,
            license: rider.licenseNumber,
            rating: 0,
            earnings: 0,
            completedRides: 0
          };
          
          console.log('Storing rider data:', JSON.stringify(riderData, null, 2));
          
          // Store the new token from verification response
          if (response.data.token) {
            // Clear any existing tokens first
            localStorage.removeItem('riderToken');
            
            // Store the new token
            localStorage.setItem('riderToken', response.data.token);
            console.log('Stored new token:', response.data.token);
          } else {
            throw new Error('No token received from verification');
          }
          
          // Store rider data
          localStorage.setItem('rider', JSON.stringify(riderData));
          
          // Clear sensitive data
          localStorage.removeItem('riderEmail');
          
          // Double check that both token and rider data are stored
          const storedToken = localStorage.getItem('riderToken');
          const storedRider = localStorage.getItem('rider');
          
          console.log('Final check - Token:', storedToken);
          console.log('Final check - Rider:', storedRider);
          
          if (!storedToken || !storedRider) {
            throw new Error('Failed to store session data');
          }
          
          // Navigate to rider home
          navigate("/riderhome");
        } else {
          throw new Error('Failed to fetch rider profile');
        }
      }
    } catch (error) {
      console.error('Rider verification error:', error);
      if (error.response?.status === 400) {
        alert(error.response.data.message || "Invalid verification code. Please try again.");
      } else if (error.response?.status === 403) {
        alert("Session expired. Please login again.");
        navigate("/riderlogin");
      } else if (error.response?.status === 404) {
        alert("Rider not found. Please try logging in again.");
        navigate("/riderlogin");
      } else {
        alert("An error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
      isVerifying.current = false;
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