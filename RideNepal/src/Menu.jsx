import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Menu.css";

function Menu({ isMenuOpen, toggleMenu }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      navigate("/"); // Redirect to home page
    }
  };

  return (
    <div className={`menu_overlay ${isMenuOpen ? "menu_open" : ""}`}>
      <div className="menu_main-container">
        <div className="menu_rectangle">
          <span className="menu_menu-1">Menu</span>
          <div className="menu_close-px" onClick={toggleMenu} />
        </div>

        <Link to="/personaldetails">
          <div className="menu_flex-row-b">
            <div className="menu_frame-3">
              <div className="menu_pd" />
              <div className="menu_bold-setting" />
            </div>
            <span className="menu_wallet-4">Personal Details</span>
            <div className="menu_arrow-left" />
          </div>
        </Link>

        <Link to="/wallet">
          <div className="menu_flex-row-b">
            <div className="menu_frame-3">
              <div className="menu_wallet" />
              <div className="menu_bold-setting" />
            </div>
            <span className="menu_wallet-4">Wallet</span>
            <div className="menu_arrow-left" />
          </div>
        </Link>

        <Link to="/ridehistory">
          <div className="menu_flex-row-b">
            <div className="menu_frame-3">
              <div className="menu_ridehistory" />
              <div className="menu_bold-setting" />
            </div>
            <span className="menu_wallet-4">Ride History</span>
            <div className="menu_arrow-left" />
          </div>
        </Link>

        <Link to="/DriverRegister">
          <div className="menu_flex-row-b">
            <div className="menu_frame-3">
              <div className="menu_becomeadriver" />
              <div className="menu_bold-setting" />
            </div>
            <span className="menu_wallet-4">Become a Driver</span>
            <div className="menu_arrow-left" />
          </div>
        </Link>

        <Link to="/help">
          <div className="menu_flex-row-b">
            <div className="menu_frame-3">
              <div className="menu_help" />
              <div className="menu_bold-setting" />
            </div>
            <span className="menu_wallet-4">Help</span>
            <div className="menu_arrow-left" />
          </div>
        </Link>

        {/* Logout Button */}
        <div className="menu_flex-row">
          <div className="menu_frame-e" onClick={handleLogout}>
            <div className="menu_frame-f">
              <div className="menu_solar-logout-bold" />
            </div>
            <span className="menu_logout">Logout</span>
          </div>
          <div className="menu_vuesax-outline-arrow-left-10" />
        </div>
      </div>
    </div>
  );
}

export default Menu;
