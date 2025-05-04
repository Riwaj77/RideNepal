import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Edit, Trash2, Plus, X, Check, Calendar, User, Truck, Tag, BarChart2 } from 'lucide-react';
import './AdminDashboard.css';
import './EditPromo.css';

const EditPromo = () => {
  const navigate = useNavigate();
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentPromo, setCurrentPromo] = useState(null);
  
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
  
  // Form data state
  const [formData, setFormData] = useState({
    code: '',
    discount: 0,
    description: '',
    maxUses: '',
    expiryDate: '',
    status: 'active'
  });
  
  // Fetch all promos
  const fetchPromos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        navigate('/admin/login');
        return;
      }
      
      const response = await axios.get('http://localhost:4000/api/promos', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setPromos(response.data.promos);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching promos:', error);
      setError('Failed to fetch promo codes. Please try again.');
      setLoading(false);
      
      if (error.response && error.response.status === 401) {
        navigate('/admin/login');
      }
    }
  };
  
  // Load promos on component mount
  useEffect(() => {
    fetchPromos();
  }, [navigate]);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'No expiry';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // Open add promo modal
  const handleAddClick = () => {
    setFormData({
      code: '',
      discount: 0,
      description: '',
      maxUses: '',
      expiryDate: '',
      status: 'active'
    });
    setShowAddModal(true);
  };
  
  // Open edit promo modal
  const handleEditClick = (promo) => {
    setCurrentPromo(promo);
    setFormData({
      code: promo.code,
      discount: promo.discount,
      description: promo.description,
      maxUses: promo.maxUses || '',
      expiryDate: promo.expiryDate ? new Date(promo.expiryDate).toISOString().split('T')[0] : '',
      status: promo.status
    });
    setShowEditModal(true);
  };
  
  // Open delete confirmation modal
  const handleDeleteClick = (promo) => {
    setCurrentPromo(promo);
    setShowDeleteModal(true);
  };
  
  // Add new promo
  const handleAddPromo = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        navigate('/admin/login');
        return;
      }
      
      const payload = {
        ...formData,
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
        expiryDate: formData.expiryDate || null
      };
      
      await axios.post('http://localhost:4000/api/promos', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setShowAddModal(false);
      fetchPromos();
    } catch (error) {
      console.error('Error adding promo:', error);
      setError(error.response?.data?.message || 'Failed to add promo code');
    }
  };
  
  // Update existing promo
  const handleUpdatePromo = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        navigate('/admin/login');
        return;
      }
      
      const payload = {
        ...formData,
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
        expiryDate: formData.expiryDate || null
      };
      
      await axios.put(`http://localhost:4000/api/promos/${currentPromo._id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setShowEditModal(false);
      fetchPromos();
    } catch (error) {
      console.error('Error updating promo:', error);
      setError(error.response?.data?.message || 'Failed to update promo code');
    }
  };
  
  // Delete promo
  const handleDeletePromo = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        navigate('/admin/login');
        return;
      }
      
      await axios.delete(`http://localhost:4000/api/promos/${currentPromo._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setShowDeleteModal(false);
      fetchPromos();
    } catch (error) {
      console.error('Error deleting promo:', error);
      setError(error.response?.data?.message || 'Failed to delete promo code');
    }
  };
  
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
              <li>
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
              <li className="ad_active">
                <a href="/editpromo">
                  <Tag size={18} style={{marginRight: '8px'}} /> 
                  Promo Codes
                </a>
              </li>
            </ul>
          </nav>
        </aside>
        <main className="ad_main">
          <div className="promo-header">
            <h2>Manage Promo Codes</h2>
            <button className="add-promo-btn" onClick={handleAddClick}>
              <Plus size={16} /> Add New Promo
            </button>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          {loading ? (
            <div className="loading">Loading promo codes...</div>
          ) : (
            <div className="promo-table-container">
              <table className="promo-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Discount (%)</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Max Uses</th>
                    <th>Used</th>
                    <th>Expiry Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {promos.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="no-promos">
                        No promo codes found. Add your first promo code!
                      </td>
                    </tr>
                  ) : (
                    promos.map((promo) => (
                      <tr key={promo._id}>
                        <td className="promo-code">{promo.code}</td>
                        <td>{promo.discount}%</td>
                        <td>{promo.description}</td>
                        <td>
                          <span className={`status-badge ${promo.status}`}>
                            {promo.status}
                          </span>
                        </td>
                        <td>{promo.maxUses || 'Unlimited'}</td>
                        <td>{promo.usageCount || 0}</td>
                        <td>{formatDate(promo.expiryDate)}</td>
                        <td className="actions">
                          <button 
                            className="edit-btn" 
                            onClick={() => handleEditClick(promo)}
                            title="Edit Promo"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            className="delete-btn" 
                            onClick={() => handleDeleteClick(promo)}
                            title="Delete Promo"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Add Promo Modal */}
          {showAddModal && (
            <div className="modal-overlay">
              <div className="modal">
                <div className="modal-header">
                  <h3>Add New Promo Code</h3>
                  <button className="close-btn" onClick={() => setShowAddModal(false)}>
                    <X size={18} />
                  </button>
                </div>
                <form onSubmit={handleAddPromo}>
                  <div className="form-group">
                    <label>Code</label>
                    <input 
                      type="text" 
                      name="code" 
                      value={formData.code} 
                      onChange={handleChange}
                      placeholder="e.g. SUMMER20"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Discount (%)</label>
                    <input 
                      type="number" 
                      name="discount" 
                      min="0"
                      max="100"
                      value={formData.discount} 
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Description</label>
                    <input 
                      type="text" 
                      name="description" 
                      value={formData.description} 
                      onChange={handleChange}
                      placeholder="e.g. Summer Special Discount"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Max Uses (leave empty for unlimited)</label>
                    <input 
                      type="number" 
                      name="maxUses" 
                      min="1"
                      value={formData.maxUses} 
                      onChange={handleChange}
                      placeholder="Unlimited"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Expiry Date (leave empty for no expiry)</label>
                    <div className="date-input-container">
                      <input 
                        type="date" 
                        name="expiryDate" 
                        value={formData.expiryDate} 
                        onChange={handleChange}
                      />
                      <Calendar className="calendar-icon" size={16} />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Status</label>
                    <select 
                      name="status" 
                      value={formData.status} 
                      onChange={handleChange}
                      required
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  
                  <div className="modal-actions">
                    <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="save-btn">
                      <Plus size={16} /> Add Promo
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          
          {/* Edit Promo Modal */}
          {showEditModal && (
            <div className="modal-overlay">
              <div className="modal">
                <div className="modal-header">
                  <h3>Edit Promo Code</h3>
                  <button className="close-btn" onClick={() => setShowEditModal(false)}>
                    <X size={18} />
                  </button>
                </div>
                <form onSubmit={handleUpdatePromo}>
                  <div className="form-group">
                    <label>Code</label>
                    <input 
                      type="text" 
                      name="code" 
                      value={formData.code} 
                      onChange={handleChange}
                      placeholder="e.g. SUMMER20"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Discount (%)</label>
                    <input 
                      type="number" 
                      name="discount" 
                      min="0"
                      max="100"
                      value={formData.discount} 
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Description</label>
                    <input 
                      type="text" 
                      name="description" 
                      value={formData.description} 
                      onChange={handleChange}
                      placeholder="e.g. Summer Special Discount"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Max Uses (leave empty for unlimited)</label>
                    <input 
                      type="number" 
                      name="maxUses" 
                      min="1"
                      value={formData.maxUses} 
                      onChange={handleChange}
                      placeholder="Unlimited"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Expiry Date (leave empty for no expiry)</label>
                    <div className="date-input-container">
                      <input 
                        type="date" 
                        name="expiryDate" 
                        value={formData.expiryDate} 
                        onChange={handleChange}
                      />
                      <Calendar className="calendar-icon" size={16} />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Status</label>
                    <select 
                      name="status" 
                      value={formData.status} 
                      onChange={handleChange}
                      required
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Usage Count (read-only)</label>
                    <input 
                      type="number" 
                      value={currentPromo?.usageCount || 0} 
                      readOnly
                      disabled
                    />
                  </div>
                  
                  <div className="modal-actions">
                    <button type="button" className="cancel-btn" onClick={() => setShowEditModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="save-btn">
                      <Check size={16} /> Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          
          {/* Delete Confirmation Modal */}
          {showDeleteModal && (
            <div className="modal-overlay">
              <div className="modal confirm-modal">
                <div className="modal-header">
                  <h3>Confirm Delete</h3>
                  <button className="close-btn" onClick={() => setShowDeleteModal(false)}>
                    <X size={18} />
                  </button>
                </div>
                <div className="confirm-content">
                  <p>Are you sure you want to delete the promo code <strong>{currentPromo?.code}</strong>?</p>
                  <p>This action cannot be undone.</p>
                </div>
                <div className="modal-actions">
                  <button className="cancel-btn" onClick={() => setShowDeleteModal(false)}>
                    Cancel
                  </button>
                  <button className="delete-confirm-btn" onClick={handleDeletePromo}>
                    <Trash2 size={16} /> Delete Promo
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default EditPromo; 