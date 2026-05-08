import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

const API_URL = "http://localhost:8000";

function App() {
  return (
    <Router>
      <nav style={{ padding: '10px', background: '#f4f4f4' }}>
        <Link to="/">Login</Link> | <Link to="/register">Register</Link> | <Link to="/admin">Admin Dashboard</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

// 1. Registration Component
const Register = () => {
  const [formData, setFormData] = useState({ name: '', address: '', gmail: '', contact: '', dob: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/register`, formData);
      alert("Registration Successful!");
    } catch (err) { alert("Error registering"); }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', width: '300px', margin: '20px' }}>
      <h2>User Registration</h2>
      <input placeholder="Name" onChange={e => setFormData({...formData, name: e.target.value})} required />
      <input placeholder="Address" onChange={e => setFormData({...formData, address: e.target.value})} required />
      <input type="email" placeholder="Gmail" onChange={e => setFormData({...formData, gmail: e.target.value})} required />
      <input placeholder="Contact" onChange={e => setFormData({...formData, contact: e.target.value})} required />
      <input type="date" onChange={e => setFormData({...formData, dob: e.target.value})} required />
      <button type="submit">Register</button>
    </form>
  );
};

// 2. Admin Dashboard Component
const AdminDashboard = () => {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    const res = await axios.get(`${API_URL}/users`);
    setUsers(res.data);
  };

  const toggleStatus = async (id) => {
    await axios.patch(`${API_URL}/users/${id}/status`);
    fetchUsers();
  };

  useEffect(() => { fetchUsers(); }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Admin Dashboard - User List</h2>
      <table border="1" cellPadding="10" style={{ width: '100%', textAlign: 'left' }}>
        <thead>
          <tr>
            <th>ID</th><th>Name</th><th>Email</th><th>Contact</th><th>Status</th><th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.id}</td><td>{u.name}</td><td>{u.gmail}</td><td>{u.contact}</td>
              <td style={{ color: u.status === 'Active' ? 'green' : 'red' }}>{u.status}</td>
              <td><button onClick={() => toggleStatus(u.id)}>Toggle Status</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Simple Login Placeholder
const Login = () => <h2>Login Page (Simulated)</h2>;

export default App;