import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ onToggleSidebar }) => {
  const { user, isAdmin, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const displayName = user?.firstName || (isAdmin ? 'Admin' : 'Citizen');

  return (
    <header className="top-navbar">
      <div className="d-flex align-items-center gap-3">
        <button
          type="button"
          className="hamburger-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation"
          id="sidebar-toggle-btn"
        >
          <i className="bi bi-list fs-5"></i>
        </button>
        <div className="d-none d-sm-block">
          <span className="user-greeting">
            {getGreeting()}, <span className="text-primary">{displayName}</span>
          </span>
        </div>
      </div>

      <div className="d-flex align-items-center gap-3">
        {/* Role badge */}
        <span className={`role-badge ${isAdmin ? 'role-badge-admin' : 'role-badge-user'}`}>
          {isAdmin ? 'ADMIN' : 'CITIZEN'}
        </span>

        {/* Notification Icon with dropdown */}
        <div className="position-relative">
          <button
            type="button"
            className="notif-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
            id="notifications-btn"
          >
            <i className="bi bi-bell fs-5"></i>
            <span className="notif-badge"></span>
          </button>

          {showNotifications && (
            <div
              className="position-absolute end-0 mt-2 bg-white border rounded shadow-lg p-3"
              style={{ width: '280px', zIndex: 1050 }}
            >
              <div className="d-flex justify-content-between align-items-center pb-2 border-bottom mb-2">
                <span className="fw-semibold text-dark small">Notifications</span>
                <span className="badge bg-primary rounded-pill">System</span>
              </div>
              <div className="small text-muted py-2">
                <i className="bi bi-check-circle text-success me-2"></i>
                Welcome to Citizen Service Portal. Real-time updates enabled.
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar Link */}
        <Link to="/profile" className="text-decoration-none d-flex align-items-center gap-2" id="profile-nav-link">
          {user?.avatar ? (
            <img src={user.avatar} alt="Avatar" className="avatar-circle" />
          ) : (
            <div className="avatar-circle">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
