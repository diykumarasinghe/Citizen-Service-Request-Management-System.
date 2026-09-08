import React from 'react';
import { Link } from 'react-router-dom';

const AccessDeniedPage = () => {
  return (
    <div className="auth-wrapper">
      <div className="text-center p-4" style={{ maxWidth: '480px' }}>
        <div className="display-1 fw-bold text-danger mb-2">403</div>
        <div className="fs-1 text-danger mb-2">
          <i className="bi bi-shield-lock-fill"></i>
        </div>
        <h3 className="fw-bold text-dark mb-2 brand-font">Access Denied</h3>
        <p className="text-muted small mb-4">
          You do not have permission to view this resource. This section requires administrative clearance or valid authorization.
        </p>
        <Link to="/dashboard" className="btn btn-primary-custom px-4" id="access-denied-home-btn">
          <i className="bi bi-arrow-left me-2"></i>Return to Safe Dashboard
        </Link>
      </div>
    </div>
  );
};

export default AccessDeniedPage;
