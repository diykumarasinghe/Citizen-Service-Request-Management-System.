import React from 'react';

/**
 * StatCard — Dashboard statistic card with circular icon, number, and label.
 */
const StatCard = ({ icon, number, label, colorClass = 'stat-icon-blue', id }) => {
  return (
    <div className="custom-card stat-card hover-lift" id={id}>
      <div className={`stat-icon-wrapper ${colorClass}`}>
        <i className={`bi ${icon}`}></i>
      </div>
      <div>
        <div className="stat-number">{number ?? 0}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
};

export default StatCard;
