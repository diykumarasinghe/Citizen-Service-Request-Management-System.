import React from 'react';
import { Link } from 'react-router-dom';

/**
 * EmptyState — Displayed when a list or table has no results.
 */
const EmptyState = ({
  icon = 'bi-inbox',
  title = 'No Records Found',
  description = 'There are no items to display.',
  actionLabel,
  actionTo,
  actionOnClick,
}) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <i className={`bi ${icon}`}></i>
      </div>
      <h6 className="text-dark fw-semibold mb-1">{title}</h6>
      <p className="text-muted small mb-3">{description}</p>
      {actionLabel && actionTo && (
        <Link to={actionTo} className="btn btn-sm btn-primary-custom" id="empty-state-action">
          {actionLabel}
        </Link>
      )}
      {actionLabel && actionOnClick && !actionTo && (
        <button
          type="button"
          className="btn btn-sm btn-primary-custom"
          onClick={actionOnClick}
          id="empty-state-action-btn"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
