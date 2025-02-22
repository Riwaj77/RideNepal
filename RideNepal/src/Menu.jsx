import React from "react";
import { Link } from "react-router-dom";
import "./Menu.css";

function Menu({ isMenuOpen, toggleMenu }) {
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

        <Link to="/becomeadriver">
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

        {/* <div className="menu_flex-row-e">
          <div className="menu_frame-b">
            <div className="menu_frame-c" />
            <span className="menu_help">Help</span>
          </div>
          <div className="menu_material-symbols-help" />
          <div className="menu_vuesax-outline-arrow-left-d" />
        </div> */}

        <div className="menu_flex-row">
          <div className="menu_frame-e">
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