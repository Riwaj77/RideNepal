import {React, useState} from 'react';
import "./Signup.css";
import { Link, useNavigate} from "react-router-dom";
import axios from 'axios';

export default function Signup() {
    const [firstname, setFirstName] = useState('');
    const [lastname, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
    
        // Phone number and email validation
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(phone)) {
            alert("Please enter a valid 10-digit phone number.");
            return;
        }
    
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!emailRegex.test(email)) {
            alert("Please enter a valid email address.");
            return;
        }
    
        // Make the API request to sign up the user
        axios.post("http://localhost:4000/signups", { firstname, lastname, email, phone })
            .then(result => {
                console.log(result);
                localStorage.setItem('email', result.data.email);
                alert('Registration successful, check your email for OTP');
                navigate("/verify");  // Navigate to OTP verification page
            })
            .catch(err => {
                console.error(err);
                alert("Error during registration. Please try again.");
            });
    };
    
    return (
        <div className="main-container">
            <header className="header">
                    <div className="black-blue-logo"></div>
                   <Link to= "/signup">
                          <button className="frame">
                            <span className="next">Sign Up</span>
                          </button>
                    </Link>
                
                      <Link to="/login" className="login">Login</Link>
                      <Link to="/book-ride" className="book-ride">Book a Ride</Link>
                      <Link to="/about" className="about">About</Link>
                      <Link to="/contact-us" className="contact-us">Contact Us</Link>
                      <Link to="/" className="home">Home</Link>
                  </header>
            
            <div className="login-1">
                <div className="flex-row-e">
                    <div className="frame-2">
                        <div className="yellow-white-modern"></div>
                    </div>
                    <div className="frame-3">
                        <span className="sign-up-4">Sign up</span>
                    </div>

                    <form onSubmit={handleSubmit}>
                    <span className="enter-mobile-number">Enter your mobile number</span>
                    <span className="plus-977">+977</span>
                    <input className="number" placeholder='#########' onChange={(e) => setPhone(e.target.value)}/>
                    <input className="first-name" placeholder='First Name' onChange={(e)=> setFirstName(e.target.value)}/>
                     <input className="last-name" placeholder='Last Name' onChange={(e)=> setLastName(e.target.value)}/>
                   
                    <input className="form-control" placeholder='Enter your email' onChange={(e) => setEmail(e.target.value)}/>

                    <div className="button-group">
                    <button type="submit" className="frame-7">Register</button>
                    </div>
                    {/* <button className="button-group">
                        <div className="frame-7">
                            <Link to="/verify" className="register">Register</Link>
                        </div>
                    </button> */}
                    </form>
                </div>
                <div className="flex-row-eb">
                    <div className="black-blue-minimalist"></div>
                    <div className="group">
                        <span className="ride-nepal">RideNepal</span>
                    </div>
                    <div className="black-blue-minimalist-8"></div>
                </div>
                <span className="lets-set-up">Let’s get you all set up</span>
                <div className="flex-row-eb-9">
                    <button className="button-group-a"></button>
                </div>
            </div>
            <div className="footer">
                <div className="flex-row-feb">
                    <div className="location">
                        <div className="round-place-px"></div>
                        <span className="faulconer-drive">Naxal, Kathmandu, Nepal</span>
                    </div>
                    <span className="about-us">About Us</span>
                    <span className="contact-us-c">Contact Us</span>
                    <span className="help">HELP</span>
                </div>
                <div className="flex-row-d">
                    <div className="black-blue-minimalist-d"></div>
                    <div className="round-phone-px"></div>
                    <span className="phone-number">+977 9456784590</span>
                </div>
                <span className="all-rights-reserved">
                    © 2024 RideNepal. All Rights Reserved.
                </span>
            </div>
        </div>
    );
}
