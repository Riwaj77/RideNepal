import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Search } from 'lucide-react';
import axios from 'axios';
import './edituser.css';

export default function EditUser() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);

  // Fetch users from MongoDB when the component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:4000/user/all');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  // Handle delete user
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`http://localhost:4000/user/${id}`);
        setUsers(users.filter(user => user._id !== id));
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  // Handle edit user
  const handleEdit = (user) => {
    setEditingUser({ ...user });
  };

  // Handle save edited user
  const handleSave = async () => {
    if (!editingUser || !editingUser._id) {
      console.error('User ID is missing');
      return;
    }
  
    try {
      await axios.put(`http://localhost:4000/user/${editingUser._id}`, {
        firstname: editingUser.firstname,
        lastname: editingUser.lastname,
        email: editingUser.email,
        phone: editingUser.phone,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        }
      });
  
      setUsers(users.map(user => (user._id === editingUser._id ? editingUser : user)));
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };
  

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    `${user.firstname} ${user.lastname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
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
              <li>
                <a href="/adDashboard">Dashboard</a>
              </li>
              <li className="active">
                <a href="/edituser">Users</a>
              </li>
              <li>
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
            <h2>User Management</h2>
          </div>
          <div className="e_search-container">
            <div className="e_search-input">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="e_table-container">
            <table className="e_data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user._id}>
                    <td>
                      {editingUser && editingUser._id === user._id ? (
                        <>
                          <input
                            value={editingUser.firstname}
                            onChange={(e) => setEditingUser({ ...editingUser, firstname: e.target.value })}
                            placeholder="First Name"
                          />
                          <input
                            value={editingUser.lastname}
                            onChange={(e) => setEditingUser({ ...editingUser, lastname: e.target.value })}
                            placeholder="Last Name"
                          />
                        </>
                      ) : (
                        `${user.firstname} ${user.lastname}`
                      )}
                    </td>
                    <td>
                      {editingUser && editingUser._id === user._id ? (
                        <input
                          value={editingUser.email}
                          onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                        />
                      ) : (
                        user.email
                      )}
                    </td>
                    <td>
                      {editingUser && editingUser._id === user._id ? (
                        <input
                          value={editingUser.phone}
                          onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                        />
                      ) : (
                        user.phone
                      )}
                    </td>
                    <td className="e_action-buttons">
                      {editingUser && editingUser._id === user._id ? (
                        <button className="e_save-button" onClick={handleSave}>Save</button>
                      ) : (
                        <>
                          <button className="e_edit-button" onClick={() => handleEdit(user)}>
                            <Edit size={16} /> Edit
                          </button>
                          <button className="e_delete-button" onClick={() => handleDelete(user._id)}>
                            <Trash2 size={16} /> Delete
                          </button>
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
