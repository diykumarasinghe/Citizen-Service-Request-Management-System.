import React from 'react';

/**
 * LoadingSpinner — Full-page or inline loading state.
 */
const LoadingSpinner = ({ fullPage = false, message = 'Loading...' }) => {
  if (fullPage) {
    return (
      <div
        className="d-flex flex-column align-items-center justify-content-center"
        style={{ minHeight: '60vh' }}
      >
        <div
          className="spinner-border mb-3"
          role="status"
          style={{ width: '2.5rem', height: '2.5rem', color: 'var(--accent-blue)' }}
        >
          <span className="visually-hidden">{message}</span>
        </div>
        <p className="text-muted small">{message}</p>
      </div>
    );
  }

  return (
    <div className="spinner-wrapper">
      <div className="spinner-border" role="status" style={{ color: 'var(--accent-blue)' }}>
        <span className="visually-hidden">{message}</span>
      </div>
    </div>
  );
};

export default LoadingSpinner;
