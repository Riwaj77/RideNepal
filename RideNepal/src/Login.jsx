import React from "react";
import { Link } from "react-router-dom";
import "./Login.css";

export default function Login() {
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
          <button className="login-group">
            <div className="login-frame-4">
              <span className="login-next">Login</span>
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
        <span className="login-access">Login to access your RideNepal account</span>
        <div className="login-flex-row-dbc">
          <span className="login-enter-mobile-number">Enter your mobile number</span>
          <button className="login-button-group">
            <div className="login-rectangle"></div>
            <span className="login-plus">+977</span>
            <div className="login-nepal"></div>
          </button>
          <div className="login-group-7">
            {/* <span className="login-number">##########</span> */}
            <input className="login-number" placeholder="##########"/>
            <div className="login-rectangle-8"></div>
            <input className="login-group-input" />
          </div>
        </div>
        <div className="login-group-9">
          <span className="login-not-registered-yet">Not registered yet?</span>
          <div className="login-group-a">
            <span>
              <Link to="/signup" className="login-register-now"> Register Now</Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
