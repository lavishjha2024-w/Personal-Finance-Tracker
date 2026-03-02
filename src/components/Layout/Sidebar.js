import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { AuthContext } from '../../contexts/AuthContext';
import { useContext } from 'react';
import './Sidebar.css';

const Sidebar = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/profile', icon: '👤', label: 'Profile' },
    { path: '/portfolio', icon: '💼', label: 'Portfolio' },
    { path: '/expenses', icon: '💰', label: 'Expenses' },
    { path: '/flowchart', icon: '📈', label: 'Asset Flowchart' },
    { path: '/insights', icon: '🤖', label: 'Smart Insights' },
    { path: '/goals', icon: '🎯', label: 'Goals' },
    { path: '/analytics', icon: '📉', label: 'Analytics' },
    { path: '/investments', icon: '💎', label: 'Investments' },
    { path: '/gamification', icon: '🏆', label: 'Gamification' },
    { path: '/help', icon: '❓', label: 'Help & Guide' },
  ];

  return (
    <aside className={`sidebar ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="sidebar-header" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <h2>💰 Finance Tracker</h2>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;

