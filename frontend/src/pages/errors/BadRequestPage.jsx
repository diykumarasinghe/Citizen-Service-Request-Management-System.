import React from 'react';
import { Link } from 'react-router-dom';

const BadRequestPage = () => {
  return (
    <div className="auth-wrapper">
      <div className="text-center p-4" style={{ maxWidth: '480px' }}>
        <div className="display-1 fw-bold text-secondary mb-2">400</div>
        <h3 className="fw-bold text-dark mb-2 brand-font">Bad Request</h3>
        <p className="text-muted small mb-4">
          The request could not be understood or was missing required parameters.
        </p>
        <Link to="/dashboard" className="btn btn-primary-custom px-4" id="error-400-home-btn">
          <i className="bi bi-house me-2"></i>Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default BadRequestPage;
