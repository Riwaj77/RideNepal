import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Car, Menu } from 'lucide-react';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const stats = {
    totalUsers: 1248,
    totalRiders: 567
  };

  return (
    <div className="ad_container">
      <header className="ad_header">
        <div className="ad_header-logo">
          <h1>RideNepal</h1>
        </div>
        {/* <div className="ad_header-nav">
          <button className="ad_menu-button">
            <Menu size={24} />
          </button>
        </div> */}
      </header>
      <div className="ad_layout">
        <aside className="ad_sidebar">
          <nav className="ad_sidebar-nav">
            <ul>
              <li className="ad_active">
                <a href="/adDashboard">Dashboard</a>
              </li>
              <li>
                <a href="/edituser">Users</a>
              </li>
              <li>
                <a href="/editrider">Riders</a>
              </li>
            </ul>
          </nav>
        </aside>
        <main className="ad_main">
          <h2>Dashboard Overview</h2>
          <div className="ad_stats-container">
            <div className="ad_stat-card">
              <div className="ad_stat-icon ad_user-icon">
                <Users size={32} />
              </div>
              <div className="ad_stat-details">
                <h3>Total Users</h3>
                <p className="ad_stat-value">{stats.totalUsers}</p>
                <button className="ad_manage-button" onClick={() => navigate('/edituser')}>
                  Manage Users
                </button>
              </div>
            </div>
            <div className="ad_stat-card">
              <div className="ad_stat-icon ad_rider-icon">
                <Car size={32} />
              </div>
              <div className="ad_stat-details">
                <h3>Total Riders</h3>
                <p className="ad_stat-value">{stats.totalRiders}</p>
                <button className="ad_manage-button" onClick={() => navigate('/editrider')}>
                  Manage Riders
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}