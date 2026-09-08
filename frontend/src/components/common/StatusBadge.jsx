import React from 'react';

const StatusBadge = ({ status }) => {
  const getBadgeConfig = (st) => {
    switch (st) {
      case 'PENDING':
        return {
          className: 'badge-status pending',
          icon: 'bi-clock-history',
          label: 'Pending',
        };
      case 'IN_PROGRESS':
        return {
          className: 'badge-status in_progress',
          icon: 'bi-arrow-repeat',
          label: 'In Progress',
        };
      case 'COMPLETED':
        return {
          className: 'badge-status completed',
          icon: 'bi-check-circle-fill',
          label: 'Completed',
        };
      case 'REJECTED':
        return {
          className: 'badge-status rejected',
          icon: 'bi-x-circle-fill',
          label: 'Rejected',
        };
      default:
        return {
          className: 'badge bg-secondary',
          icon: 'bi-info-circle',
          label: st || 'Unknown',
        };
    }
  };

  const config = getBadgeConfig(status);

  return (
    <span className={config.className}>
      <i className={`bi ${config.icon}`}></i>
      {config.label}
    </span>
  );
};

export default StatusBadge;
