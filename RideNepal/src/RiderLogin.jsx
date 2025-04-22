import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";
import "./RiderLogin.css"

export default function RiderLogin() {
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
            // Make the API request to check phone number and send OTP for rider
            const response = await axios.post("http://localhost:4000/riders/logins", { phone });
            
            console.log('Rider login response:', response.data);

            if (response.data && response.data.email && response.data.token) {
                // Clear any existing session data
                localStorage.clear();
                
                // Store the rider's email and token
                localStorage.setItem('riderEmail', response.data.email);
                localStorage.setItem('riderToken', response.data.token);
                
                // Verify both email and token were stored
                const storedEmail = localStorage.getItem('riderEmail');
                const storedToken = localStorage.getItem('riderToken');
                console.log('Stored rider email:', storedEmail);
                console.log('Stored rider token:', storedToken);
                
                if (storedEmail && storedToken) {
                    alert('OTP has been sent to your email');
                    navigate("/riderverify");
                } else {
                    alert('Error storing session data. Please try again.');
                }
            } else {
                alert('Invalid response from server. Please try again.');
            }
        } catch (err) {
            console.error('Rider login error:', err);
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
                        <span className="login-3">Rider Login</span>
                    </div>
                </div>
                <div className="login-flex-row-b">
                    <div className="login-black-blue-minimalist"></div>
                    <div className="login-group-5">
                        <span className="login-ride-nepal">RideNepal</span>
                    </div>
                    <div className="login-black-blue-minimalist-6"></div>
                </div>
                <span className="login-access">Login to access your RideNepal Rider account</span>
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

                <div className="login-group">
                    <button className="login-frame-4" onClick={handleSubmit}>Login</button>
                </div>

                <div className="login-group-9">
                    <span className="login-not-registered-yet">Not registered as a rider yet?</span>
                    <div className="login-group-a">
                        <span>
                            <Link to="/DriverRegister" className="rider-login-register-now">Register as Rider</Link>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
} 