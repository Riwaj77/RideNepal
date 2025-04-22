import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";

export default function Login() {
    const [phone, setPhone] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Phone number validation
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(phone)) {
            alert("Please enter a valid 10-digit phone number.");
            return;
        }

        try {
            console.log('Sending login request with phone:', phone);
            
            // Make the API request to check phone number and send OTP
            const response = await axios.post("http://localhost:4000/logins", { phone });
            
            console.log('Login response:', response.data); // Debug log

            if (response.data && response.data.email) {
                // Store the email and token if provided
                localStorage.setItem('email', response.data.email);
                
                if (response.data.token) {
                    console.log('Token received:', response.data.token);
                    localStorage.setItem('token', response.data.token);
                    
                    // Verify token was stored
                    const storedToken = localStorage.getItem('token');
                    console.log('Stored token:', storedToken);
                } else {
                    console.warn('No token received from server');
                }
                
                // Verify email was stored
                const storedEmail = localStorage.getItem('email');
                console.log('Stored email:', storedEmail); // Debug log
                
                if (storedEmail) {
                    alert('OTP has been sent to your email');
                    navigate("/verify");
                } else {
                    alert('Error storing email. Please try again.');
                }
            } else {
                alert('No email received from server. Please try again.');
            }
        } catch (err) {
            console.error('Login error:', err);
            if (err.response && err.response.data) {
                alert(err.response.data.message || 'Login failed. Please try again.');
            } else {
                alert('An error occurred. Please try again.');
            }
        }
    };

    return (
        <div className="login-main-container">
            <div className="login-login-1">
                <div className="login-flex-row-ec">
                    <div className="login-frame">
                        <div className="login-yellow-white-modern"></div>
                    </div>
                    <div className="login-frame-2">
                        <span className="login-3">Login</span>
                    </div>
                </div>
                <div className="login-flex-row-b">
                    <div className="login-black-blue-minimalist"></div>
                    <div className="login-group-5">
                        <span className="login-ride-nepal">RideNepal</span>
                    </div>
                    <div className="login-black-blue-minimalist-6"></div>
                </div>
                <span className="login-access">Login to access your RideNepal account</span>
                <div className="login-flex-row-dbc">
                    <span className="login-enter-mobile-number">Enter your mobile number</span>
                    <button className="login-button-group">
                        <input
                            className="login-plus"
                            placeholder="+977"
                            value="+977"
                            disabled
                        />
                        <div className="login-nepal"></div>
                    </button>
                    <div className="login-group-7">
                        <input
                            className="login-number"
                            placeholder="##########"
                            maxLength={10}
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>
                </div>

                {/* This is the actual Login Button */}
                <div className="login-group">
                    <button className="login-frame-4" onClick={handleSubmit}>Login</button>
                </div>

                <div className="login-group-9">
                    <span className="login-not-registered-yet">Not registered yet?</span>
                    <div className="login-group-a">
                        <span>
                            <Link to="/signup" className="login-register-now"> Register Now</Link>
                        </span>
                    </div>
                </div>
                <div className="login-group-9" style={{ marginTop: '40px' }}>
                    <span className="login-not-registered-yet">Are you a driver?</span>
                    <div className="login-group-a">
                        <span>
                            <Link to="/riderlogin" className="login-register-now">Sign up as Driver</Link>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
