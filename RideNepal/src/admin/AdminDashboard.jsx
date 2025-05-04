import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Truck, Tag, BarChart2 } from 'lucide-react';
import axios from 'axios'; // Import Axios for API calls
import './AdminDashboard.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ 
    totalUsers: 0, 
    totalRiders: 0,
    totalPromos: 0
  });

  // Check admin authentication when component mounts
  useEffect(() => {
    const checkAuth = () => {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        navigate('/admin/login');
      }
    };
    
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) return;
      
      try {
        // Fetch user count
        const userResponse = await axios.get('http://localhost:4000/user/count', {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        setStats(prev => ({ ...prev, totalUsers: userResponse.data.totalUsers }));
        
        // Fetch rider count
        const riderResponse = await axios.get('http://localhost:4000/riders/count', {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        setStats(prev => ({ ...prev, totalRiders: riderResponse.data.totalRiders }));
        
        // Fetch promo count
        const promoResponse = await axios.get('http://localhost:4000/api/promos', {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        
        // Count only active promos
        const activePromos = promoResponse.data.promos?.filter(promo => promo.status === 'active') || [];
        setStats(prev => ({ ...prev, totalPromos: activePromos.length }));
      } catch (error) {
        console.error('Error fetching stats:', error);
        if (error.response?.status === 401) {
          // Token is invalid or expired
          localStorage.removeItem('adminToken');
          navigate('/admin/login');
        }
      }
    };
    
    fetchStats();
  }, [navigate]);

  return (
    <div className="ad_container">
      <header className="ad_header">
        <div className="ad_header-logo">
          <h1>RideNepal</h1>
        </div>
        <div className="admin-logout">
          <button onClick={() => {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminId');
            localStorage.removeItem('adminName');
            navigate('/admin/login');
          }} className="logout-btn">
            Logout
          </button>
        </div>
      </header>
      <div className="ad_layout">
        <aside className="ad_sidebar">
          <nav className="ad_sidebar-nav">
            <ul>
              <li className="ad_active">
                <a href="/adDashboard">
                  <BarChart2 size={18} style={{marginRight: '8px'}} /> 
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/edituser">
                  <User size={18} style={{marginRight: '8px'}} /> 
                  Users
                </a>
              </li>
              <li>
                <a href="/editrider">
                  <Truck size={18} style={{marginRight: '8px'}} /> 
                  Riders
                </a>
              </li>
              <li>
                <a href="/editpromo">
                  <Tag size={18} style={{marginRight: '8px'}} /> 
                  Promo Codes
                </a>
              </li>
            </ul>
          </nav>
        </aside>
        <main className="ad_main">
          <h2>Dashboard Overview</h2>
          <div className="ad_stats-grid">
            <div className="dashboard-card">
              <div className="dashboard-card-icon">
                <User size={24} />
              </div>
              <div className="dashboard-card-content">
                <h3>Total Users</h3>
                <p className="dashboard-card-number">{stats.totalUsers}</p>
                <button 
                  className="dashboard-card-button"
                  onClick={() => navigate('/edituser')}
                >
                  Manage Users
                </button>
              </div>
            </div>
            
            <div className="dashboard-card">
              <div className="dashboard-card-icon">
                <Truck size={24} />
              </div>
              <div className="dashboard-card-content">
                <h3>Total Riders</h3>
                <p className="dashboard-card-number">{stats.totalRiders}</p>
                <button 
                  className="dashboard-card-button"
                  onClick={() => navigate('/editrider')}
                >
                  Manage Riders
                </button>
              </div>
            </div>
            
            <div className="dashboard-card">
              <div className="dashboard-card-icon">
                <Tag size={24} />
              </div>
              <div className="dashboard-card-content">
                <h3>Active Promos</h3>
                <p className="dashboard-card-number">{stats.totalPromos}</p>
                <button 
                  className="dashboard-card-button"
                  onClick={() => navigate('/editpromo')}
                >
                  Manage Promos
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
