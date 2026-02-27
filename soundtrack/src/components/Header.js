import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!user) return null;

  const navLinks = [
    { to: '/timeline', label: 'Timeline' },
    { to: '/favorites/songs', label: 'Top 25' },
    { to: '/favorites/albums', label: 'Top 10' },
    { to: '/browse', label: 'Browse' },
    { to: '/superchart', label: 'Super Chart' },
  ];

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/timeline" className="header-logo">
          <span className="logo-icon">🎵</span>
          <span className="logo-text">Soundtrack</span>
        </Link>

        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          <span className={`hamburger ${menuOpen ? 'open' : ''}`} />
        </button>

        <nav className={`nav ${menuOpen ? 'nav-open' : ''}`}>
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`nav-link ${location.pathname === to ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
          <div className="nav-user">
            <span className="nav-username">{user.name}</span>
            <button className="btn-logout" onClick={logout}>Log out</button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
