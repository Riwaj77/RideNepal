import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./RiderWallet.css";

export default function RiderWallet() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);

  return (
    <div className="rider-wallet-container">
      {/* Header Section */}
      <header className="rider-header">
        <div className="rider-header-logo"></div>
        <div className="rider-status">
          <button className="rider-status-toggle offline">Offline</button>
        </div>
        <Link to="/riderprofile" className="rider-nav-link">Profile</Link>
        <Link to="/riderwallet" className="rider-nav-link">Wallet</Link>
        <Link to="/riderhistory" className="rider-nav-link">History</Link>
        <Link to="/about" className="rider-nav-link">About</Link>
        <Link to="/help" className="rider-nav-link">Help</Link>
        <Link to="/riderhome" className="rider-nav-link">Home</Link>
      </header>

      {/* Main Section */}
      <div className="rider-wallet-content">
        <div className="rider-wallet-balance">
          <h2>Wallet Balance</h2>
          <div className="rider-balance-amount">
            <span className="rider-currency">Rs.</span>
            <span className="rider-amount">{balance}</span>
          </div>
        </div>

        <div className="rider-transactions">
          <h2>Transaction History</h2>
          <div className="rider-transaction-list">
            {transactions.length === 0 ? (
              <div className="rider-no-transactions">
                <p>No transactions yet</p>
              </div>
            ) : (
              transactions.map((transaction) => (
                <div key={transaction.id} className="rider-transaction-card">
                  <div className="rider-transaction-info">
                    <div className="rider-transaction-type">
                      {transaction.type === 'credit' ? 'Earned' : 'Withdrawn'}
                    </div>
                    <div className="rider-transaction-date">
                      {new Date(transaction.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className={`rider-transaction-amount ${transaction.type}`}>
                    {transaction.type === 'credit' ? '+' : '-'} Rs. {transaction.amount}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <footer className="rider-footer">
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