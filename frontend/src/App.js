import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = "http://localhost:8000";

function App() {
  // Navigation State: 'login', 'register', or 'admin'
  const [view, setView] = useState('login'); 
  
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', address: '', gmail: '', contact: '', dob: '' });
  const [file, setFile] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/users`);
      setUsers(res.data);
    } catch (err) { console.error("Fetch error", err); }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (file) data.append('profile_photo', file);

    try {
      await axios.post(`${API_URL}/register`, data);
      alert("Registration Successful!");
      fetchUsers();
      setView('login'); // Redirect to login after registration
    } catch (err) {
      alert(err.response?.data?.detail || "Registration Failed");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/login`, { gmail: email });
      alert("Login Successful!");
      setView('admin'); // Redirect to dashboard after login
    } catch (err) {
      alert(err.response?.data?.detail || "Login Failed");
    }
  };

  const toggleStatus = async (userId) => {
    try {
      await axios.patch(`${API_URL}/users/${userId}/status`);
      fetchUsers();
    } catch (err) { alert("Status update failed"); }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      {/* Navigation Links */}
      <nav style={{ marginBottom: '20px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
        <button onClick={() => setView('login')} style={navBtnStyle}>Login</button> | 
        <button onClick={() => setView('register')} style={navBtnStyle}>Register</button> | 
        <button onClick={() => setView('admin')} style={navBtnStyle}>Admin Dashboard</button>
      </nav>

      {/* Conditional Rendering: Show only one view at a time */}
      
      {view === 'login' && (
        <section style={sectionStyle}>
          <h2>User Login</h2>
          <form onSubmit={handleLogin}>
            <input placeholder="Enter Gmail" onChange={e => setEmail(e.target.value)} required style={inputStyle} />
            <button type="submit" style={btnStyle}>Login</button>
          </form>
        </section>
      )}

      {view === 'register' && (
        <section style={sectionStyle}>
          <h2>User Registration</h2>
          <form onSubmit={handleRegister} style={{ display: 'grid', gap: '10px', maxWidth: '400px' }}>
            <input placeholder="Name" onChange={e => setFormData({...formData, name: e.target.value})} required style={inputStyle} />
            <input placeholder="Address" onChange={e => setFormData({...formData, address: e.target.value})} required style={inputStyle} />
            <input type="email" placeholder="Gmail" onChange={e => setFormData({...formData, gmail: e.target.value})} required style={inputStyle} />
            <input placeholder="Contact" onChange={e => setFormData({...formData, contact: e.target.value})} required style={inputStyle} />
            <input type="date" onChange={e => setFormData({...formData, dob: e.target.value})} required style={inputStyle} />
            <label>Profile Photo:</label>
            <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} required />
            <button type="submit" style={btnStyle}>Register User</button>
          </form>
        </section>
      )}

      {view === 'admin' && (
        <section style={sectionStyle}>
          <h2>Admin Dashboard - User List</h2>
          <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2' }}>
                <th>ID</th><th>Name</th><th>Email</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.name}</td>
                  <td>{u.gmail}</td>
                  <td style={{ color: u.status === 'Active' ? 'green' : 'red', fontWeight: 'bold' }}>{u.status}</td>
                  <td>
                    <button onClick={() => toggleStatus(u.id)}>Toggle Status</button>
                    <button onClick={() => setSelectedUser(u)} style={{ marginLeft: '10px' }}>Check Profile</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Detailed Profile View with Photo */}
          {selectedUser && (
            <div style={profileCardStyle}>
              <div style={{ flex: 1 }}>
                {selectedUser.photo ? (
                  <img 
                    src={`${API_URL}/uploads/${selectedUser.photo}`} 
                    alt="Profile" 
                    style={{ width: '150px', borderRadius: '10px', border: '1px solid #ddd' }} 
                  />
                ) : <div style={noPhotoStyle}>No Photo</div>}
              </div>
              <div style={{ flex: 2 }}>
                <h3>Profile Details</h3>
                <p><strong>Address:</strong> {selectedUser.address}</p>
                <p><strong>DOB:</strong> {selectedUser.dob}</p>
                <p><strong>Contact:</strong> {selectedUser.contact}</p>
                <button onClick={() => setSelectedUser(null)}>Close Profile</button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

// Simple Styles
const navBtnStyle = { background: 'none', border: 'none', color: 'blue', cursor: 'pointer', textDecoration: 'underline', padding: '0 10px' };
const sectionStyle = { padding: '20px', border: '1px solid #eee', borderRadius: '8px' };
const inputStyle = { padding: '8px', marginBottom: '10px', width: '100%' };
const btnStyle = { padding: '10px 20px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' };
const profileCardStyle = { marginTop: '20px', padding: '20px', backgroundColor: '#f9f9f9', border: '1px solid #333', display: 'flex', gap: '20px', borderRadius: '8px' };
const noPhotoStyle = { width: '150px', height: '150px', background: '#ccc', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' };

export default App;