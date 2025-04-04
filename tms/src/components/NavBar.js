// src/components/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isLoggedIn, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login'); 
  };

  return (
    <nav style={navStyle}>
      <div style={brandStyle}>
        <Link to="/" style={linkStyle}>Task Manager</Link>
      </div>
      <ul style={navListStyle}>
        {isLoggedIn ? (
          <>
            <li style={navItemStyle}>
                <span style={{marginRight: '15px'}}>Welcome, {user?.email || 'User'}!</span>
            </li>
             <li style={navItemStyle}>
               <Link to="/tasks" style={linkStyle}>My Tasks</Link>
            </li>
            <li style={navItemStyle}>
              <button onClick={handleLogout} style={buttonStyle}>Logout</button>
            </li>
          </>
        ) : (
          <>
            <li style={navItemStyle}>
              <Link to="/login" style={linkStyle}>Login</Link>
            </li>
            <li style={navItemStyle}>
              <Link to="/register" style={linkStyle}>Register</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};


const navStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px 20px',
  backgroundColor: '#f0f0f0',
  borderBottom: '1px solid #ccc',
};

const brandStyle = {
  fontWeight: 'bold',
  fontSize: '1.2em',
};

const navListStyle = {
  listStyle: 'none',
  display: 'flex',
  alignItems: 'center',
  margin: 0,
  padding: 0,
};

const navItemStyle = {
  marginLeft: '15px',
};

const linkStyle = {
  textDecoration: 'none',
  color: '#333',
};

const buttonStyle = {
  background: 'none',
  border: 'none',
  color: '#333',
  cursor: 'pointer',
  padding: '5px 10px',
  fontSize: '1em',
};


export default Navbar;