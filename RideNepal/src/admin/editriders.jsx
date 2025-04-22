import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Search } from 'lucide-react';
import axios from 'axios';
import './editriders.css';

export default function EditRiders() {
  const navigate = useNavigate();
  const [riders, setRiders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingRider, setEditingRider] = useState(null);

  useEffect(() => {
    const fetchRiders = async () => {
      try {
        const response = await axios.get('http://localhost:4000/riders');
        setRiders(response.data);
      } catch (error) {
        console.error('Error fetching riders:', error);
      }
    };
    fetchRiders();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this rider?')) {
      try {
        await axios.delete(`http://localhost:4000/riders/${id}`);
        setRiders(riders.filter(rider => rider._id !== id));
      } catch (error) {
        console.error('Error deleting rider:', error);
      }
    }
  };

  const handleEdit = rider => {
    setEditingRider({ ...rider });
  };

  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:4000/riders/${editingRider._id}`, editingRider);
      setRiders(riders.map(rider => rider._id === editingRider._id ? editingRider : rider));
      setEditingRider(null);
      alert("Saved Successfully!");
    } catch (error) {
      alert("Failed to save changes. Please try again.");
      console.error('Error updating rider:', error);
    }
  };

  const filteredRiders = riders.filter(rider =>
    rider.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rider.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="ad_container">
      <header className="ad_header">
        <div className="ad_header-logo">
          <h1>RideNepal</h1>
        </div>
      </header>
      <div className="ad_layout">
        <aside className="ad_sidebar">
          <nav className="ad_sidebar-nav">
            <ul>
              <li><a href="/adDashboard">Dashboard</a></li>
              <li><a href="/edituser">Users</a></li>
              <li className="active"><a href="/editrider">Riders</a></li>
            </ul>
          </nav>
        </aside>
        <main className="ad_main">
          <div className="e_page-header">
            <button className="e_back-button" onClick={() => navigate('/adDashboard')}>
              <ArrowLeft size={32} />
            </button>
            <h2>Rider Management</h2>
          </div>
          <div className="e_search-container">
            <div className="e_search-input">
              <Search size={18} />
              <input type="text" placeholder="Search riders..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
          </div>
          <div className="e_table-container">
            <table className="e_data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Vehicle</th>
                  <th>License Number</th>
                  <th>License</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRiders.map(rider => (
                  <tr key={rider._id}>
                    <td>
                      {editingRider && editingRider._id === rider._id ? (
                        <>
                          <input
                            value={editingRider.firstName}
                            onChange={(e) => setEditingRider({ ...editingRider, firstName: e.target.value })}
                          />
                          <input
                            value={editingRider.lastName}
                            onChange={(e) => setEditingRider({ ...editingRider, lastName: e.target.value })}
                          />
                        </>
                      ) : (
                        `${rider.firstName} ${rider.lastName}`
                      )}
                    </td>
                    <td>{editingRider && editingRider._id === rider._id ? <input value={editingRider.email} onChange={e => setEditingRider({...editingRider, email: e.target.value})} /> : rider.email}</td>
                    <td>{editingRider && editingRider._id === rider._id ? <input value={editingRider.phone} onChange={e => setEditingRider({...editingRider, phone: e.target.value})} /> : rider.phone}</td>

                    <td>{rider.vehicleModel}</td>
                    <td>{rider.licensePlate}</td>
                    <td><a href={rider.licenseImage} target="_blank" rel="noopener noreferrer">View License</a></td>
                    <td className="e_action-buttons">
                      {editingRider && editingRider._id === rider._id ? (
                        <button className="e_save-button" onClick={handleSave}>Save</button>
                      ) : (
                        <>
                          <button className="e_edit-button" onClick={() => handleEdit(rider)}><Edit size={16} /> Edit</button>
                          <button className="e_delete-button" onClick={() => handleDelete(rider._id)}><Trash2 size={16} /> Delete</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
