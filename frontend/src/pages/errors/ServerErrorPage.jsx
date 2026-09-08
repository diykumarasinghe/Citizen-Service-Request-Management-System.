import React from 'react';
import { Link } from 'react-router-dom';

const ServerErrorPage = () => {
  return (
    <div className="auth-wrapper">
      <div className="text-center p-4" style={{ maxWidth: '480px' }}>
        <div className="display-1 fw-bold text-warning mb-2">500</div>
        <h3 className="fw-bold text-dark mb-2 brand-font">Internal Server Error</h3>
        <p className="text-muted small mb-4">
          Something went wrong on our end. Please try refreshing or return to your dashboard.
        </p>
        <Link to="/dashboard" className="btn btn-primary-custom px-4" id="error-500-home-btn">
          <i className="bi bi-arrow-clockwise me-2"></i>Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default ServerErrorPage;
