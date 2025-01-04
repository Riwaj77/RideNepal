import React from 'react';
import "./Signup.css";
import { Link } from "react-router-dom";

export default function Signup() {
    return (
        <div className="main-container">
            <div className="header">
                <div className="black-blue-logo"></div>
                <div className="frame">
                    <span className="next">SignUp</span>
                </div>
                <Link to="/login" className="login">Login</Link>
                <span className="book-ride">Book a Ride</span>
                <span className="about">About</span>
                <span className="contact-us">Contact Us</span>
                <span className="home">Home</span>
            </div>
            <div className="login-1">
                <div className="flex-row-e">
                    <div className="frame-2">
                        <div className="yellow-white-modern"></div>
                    </div>
                    <div className="frame-3">
                        <span className="sign-up-4">Sign up</span>
                    </div>
                    <span className="enter-mobile-number">Enter your mobile number</span>
                    <span className="plus-977">+977</span>
                    <span className="number">##########</span>
                    <button className="first-name">
                        <span className="first-name-5">Firstname</span>
                    </button>
                    <button className="last-name">
                        <span className="last-name-6">Lastname</span>
                    </button>
                    <div className="form-control">
                        <span className="enter-email">Enter your email</span>
                        <input className="form-control-input" />
                    </div>
                    <button className="button-group">
                        <div className="frame-7">
                            <span className="register">Register</span>
                        </div>
                    </button>
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
                    <div className="group-b">
                        <div className="rectangle"></div>
                        <input className="group-input" />
                    </div>
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
