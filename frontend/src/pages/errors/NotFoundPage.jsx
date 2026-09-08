import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="auth-wrapper">
      <div className="text-center p-4" style={{ maxWidth: '480px' }}>
        <div className="display-1 fw-bold text-primary mb-2">404</div>
        <h3 className="fw-bold text-dark mb-2 brand-font">Page Not Found</h3>
        <p className="text-muted small mb-4">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link to="/dashboard" className="btn btn-primary-custom px-4" id="error-404-home-btn">
          <i className="bi bi-house-door me-2"></i>Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
