import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isCollapsed, isMobileOpen, onCloseMobile }) => {
  const { isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  const navItemClick = () => {
    if (window.innerWidth < 992) {
      onCloseMobile();
    }
  };

  return (
    <>
      {isMobileOpen && <div className="sidebar-backdrop" onClick={onCloseMobile}></div>}
      <aside
        className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${
          !isMobileOpen ? 'mobile-hidden' : ''
        }`}
      >
        <div className="sidebar-header">
          <div className="sidebar-brand-icon">
            <i className="bi bi-shield-check"></i>
          </div>
          <div>
            <div className="fw-bold text-white fs-6 brand-font" style={{ letterSpacing: '0.02em' }}>
              Citizen Care
            </div>
            <div className="text-secondary small" style={{ fontSize: '0.75rem' }}>
              Service Portal
            </div>
          </div>
        </div>

        <div className="sidebar-nav d-flex flex-column justify-content-between">
          <div>
            <div className="nav-section-title">Navigation</div>

            <NavLink
              to="/dashboard"
              className={({ isActive }) => `nav-link-custom ${isActive ? 'active' : ''}`}
              onClick={navItemClick}
              id="sidebar-dashboard-link"
            >
              <i className="bi bi-grid-fill"></i>
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to="/requests"
              className={({ isActive }) => `nav-link-custom ${isActive ? 'active' : ''}`}
              onClick={navItemClick}
              id="sidebar-requests-link"
            >
              <i className="bi bi-card-checklist"></i>
              <span>Service Requests</span>
            </NavLink>

            <NavLink
              to="/categories"
              className={({ isActive }) => `nav-link-custom ${isActive ? 'active' : ''}`}
              onClick={navItemClick}
              id="sidebar-categories-link"
            >
              <i className="bi bi-tags-fill"></i>
              <span>Categories</span>
            </NavLink>

            {isAdmin && (
              <>
                <div className="nav-section-title mt-3">Administration</div>
                <NavLink
                  to="/users"
                  className={({ isActive }) => `nav-link-custom ${isActive ? 'active' : ''}`}
                  onClick={navItemClick}
                  id="sidebar-users-link"
                >
                  <i className="bi bi-people-fill"></i>
                  <span>User Management</span>
                </NavLink>
              </>
            )}

            <div className="nav-section-title mt-3">Account</div>
            <NavLink
              to="/profile"
              className={({ isActive }) => `nav-link-custom ${isActive ? 'active' : ''}`}
              onClick={navItemClick}
              id="sidebar-profile-link"
            >
              <i className="bi bi-person-circle"></i>
              <span>My Profile</span>
            </NavLink>
          </div>

          <div className="pt-4 border-top border-secondary border-opacity-25 mt-auto">
            <button
              type="button"
              className="nav-link-custom w-100 text-start bg-transparent border-0 text-danger"
              onClick={handleLogout}
              id="sidebar-logout-btn"
            >
              <i className="bi bi-box-arrow-right"></i>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
