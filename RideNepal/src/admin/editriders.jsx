import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Search } from 'lucide-react';
import './editriders.css';
export default function editriders () {
  const navigate = useNavigate();
  const [riders, setRiders] = useState([{
    id: 1,
    name: 'Alex Johnson',
    email: 'alex@example.com',
    phone: '555-111-2222',
    vehicle: 'Toyota Camry',
    license: 'ABC123',
    rating: '4.8'
  }, {
    id: 2,
    name: 'Sarah Williams',
    email: 'sarah@example.com',
    phone: '555-333-4444',
    vehicle: 'Honda Civic',
    license: 'XYZ789',
    rating: '4.9'
  }, {
    id: 3,
    name: 'David Brown',
    email: 'david@example.com',
    phone: '555-555-6666',
    vehicle: 'Ford Focus',
    license: 'DEF456',
    rating: '4.7'
  }, {
    id: 4,
    name: 'Lisa Martinez',
    email: 'lisa@example.com',
    phone: '555-777-8888',
    vehicle: 'Hyundai Sonata',
    license: 'GHI789',
    rating: '4.6'
  }, {
    id: 5,
    name: 'Kevin Taylor',
    email: 'kevin@example.com',
    phone: '555-999-0000',
    vehicle: 'Chevrolet Malibu',
    license: 'JKL012',
    rating: '4.9'
  }]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingRider, setEditingRider] = useState(null);
  const handleDelete = id => {
    if (window.confirm('Are you sure you want to delete this rider?')) {
      setRiders(riders.filter(rider => rider.id !== id));
    }
  };
  const handleEdit = rider => {
    setEditingRider({
      ...rider
    });
  };
  const handleSave = () => {
    setRiders(riders.map(rider => rider.id === editingRider.id ? editingRider : rider));
    setEditingRider(null);
  };
  const filteredRiders = riders.filter(rider => rider.name.toLowerCase().includes(searchTerm.toLowerCase()) || rider.email.toLowerCase().includes(searchTerm.toLowerCase()) || rider.vehicle.toLowerCase().includes(searchTerm.toLowerCase()));
  return <div className="ad_container">
      <header className="ad_header">
        <div className="ad_header-logo">
          <h1>RideNepal</h1>
        </div>
      </header>
      <div className="ad_layout">
        <aside className="ad_sidebar">
          <nav className="ad_sidebar-nav">
            <ul>
              <li>
                <a href="/adDashboard">Dashboard</a>
              </li>
              <li>
                <a href="/edituser">Users</a>
              </li>
              <li className="active">
                <a href="/editrider">Riders</a>
              </li>
            </ul>
          </nav>
        </aside>
        <main className="ad_main">
          <div className="e_page-header">
            <button className="e_back-button" onClick={() => navigate('/adDashboard')}>
              <ArrowLeft size={16} /> Back to Dashboard
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
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Vehicle</th>
                  <th>License</th>
                  <th>Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRiders.map(rider => <tr key={rider.id}>
                    <td>{rider.id}</td>
                    <td>
                      {editingRider && editingRider.id === rider.id ? <input value={editingRider.name} onChange={e => setEditingRider({
                    ...editingRider,
                    name: e.target.value
                  })} /> : rider.name}
                    </td>
                    <td>
                      {editingRider && editingRider.id === rider.id ? <input value={editingRider.email} onChange={e => setEditingRider({
                    ...editingRider,
                    email: e.target.value
                  })} /> : rider.email}
                    </td>
                    <td>
                      {editingRider && editingRider.id === rider.id ? <input value={editingRider.phone} onChange={e => setEditingRider({
                    ...editingRider,
                    phone: e.target.value
                  })} /> : rider.phone}
                    </td>
                    <td>
                      {editingRider && editingRider.id === rider.id ? <input value={editingRider.vehicle} onChange={e => setEditingRider({
                    ...editingRider,
                    vehicle: e.target.value
                  })} /> : rider.vehicle}
                    </td>
                    <td>
                      {editingRider && editingRider.id === rider.id ? <input value={editingRider.license} onChange={e => setEditingRider({
                    ...editingRider,
                    license: e.target.value
                  })} /> : rider.license}
                    </td>
                    <td>
                      {editingRider && editingRider.id === rider.id ? <input value={editingRider.rating} onChange={e => setEditingRider({
                    ...editingRider,
                    rating: e.target.value
                  })} /> : <span className="rating">★ {rider.rating}</span>}
                    </td>
                    <td className="e_action-buttons">
                      {editingRider && editingRider.id === rider.id ? <button className="e_save-button " onClick={handleSave}>Save</button> : <>
                          <button className="e_edit-button" onClick={() => handleEdit(rider)}>
                            <Edit size={16} /> Edit
                          </button>
                          <button className="e_delete-button" onClick={() => handleDelete(rider.id)}>
                            <Trash2 size={16} /> Delete
                          </button>
                        </>}
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>;
};
