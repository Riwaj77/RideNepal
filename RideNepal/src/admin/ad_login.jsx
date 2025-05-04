import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminLogin.css";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  // For development/testing only - will automatically create a test admin account and login
  const createTestAdmin = async () => {
    try {
      // First try to create a test admin account
      await axios.post("http://localhost:4000/admin/register", {
        email: "admin@test.com",
        password: "admin123"
      }).catch(err => {
        // Ignore "admin already exists" errors
        console.log("Test admin setup:", err.response?.data?.message);
      });
      
      // Then login with the test account
      const loginResponse = await axios.post("http://localhost:4000/admin/login", {
        email: "admin@test.com",
        password: "admin123"
      });
      
      // Store authentication data
      if (loginResponse.data.token) {
        localStorage.setItem('adminToken', loginResponse.data.token);
        if (loginResponse.data.admin) {
          localStorage.setItem('adminId', loginResponse.data.admin._id);
          localStorage.setItem('adminName', loginResponse.data.admin.email);
        }
        
        // Navigate to dashboard
        navigate("/adDashboard");
      }
    } catch (error) {
      console.error("Test admin setup failed:", error);
      setErrorMessage("Could not set up test admin account. See console for details.");
    }
  };

  // Temporary bypass function for development - use with caution
  const bypassLogin = async () => {
    try {
      // Get a token from the server without actual authentication
      // This endpoint should be protected in production
      const response = await axios.post("http://localhost:4000/admin/dev-token");
      
      if (response.data && response.data.token) {
        localStorage.setItem('adminToken', response.data.token);
        localStorage.setItem('adminId', 'dev-admin-id');
        localStorage.setItem('adminName', 'Development Admin');
        navigate("/adDashboard");
      } else {
        setErrorMessage("Failed to get development token");
      }
    } catch (error) {
      console.error("Failed to get development token:", error);
      setErrorMessage("Could not get development token. Please check if the dev-token endpoint is available.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Email and password validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    try {
      // Update this to use the proper authentication endpoint
      const response = await axios.post("http://localhost:4000/admin/login", { 
        email, 
        password 
      });
      
      // Store the token in localStorage
      if (response.data.token) {
        localStorage.setItem('adminToken', response.data.token);
        
        // Also store any other relevant user data
        if (response.data.admin) {
          localStorage.setItem('adminId', response.data.admin._id);
          localStorage.setItem('adminName', response.data.admin.name || response.data.admin.email);
        }
        
        // Navigate to the dashboard
        navigate("/adDashboard");
      } else {
        setErrorMessage("Invalid login response. Please contact support.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage(error.response?.data?.message || "Login failed. Please check your credentials and try again.");
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-box">
        <h2>Admin Login</h2>
        {errorMessage && <p className="admin-error-message">{errorMessage}</p>}
        <form onSubmit={handleSubmit}>
          <div className="admin-input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="admin-input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="admin-login-btn">Login</button>
        </form>
        
        {/* Development tools - remove these in production */}
        <div className="dev-tools">
          <button onClick={createTestAdmin} className="dev-btn">Create Test Admin</button>
          <button onClick={bypassLogin} className="dev-btn">Bypass Login (Dev Only)</button>
        </div>
      </div>
    </div>
  );
}
