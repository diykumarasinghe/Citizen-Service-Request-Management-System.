import React from 'react';

const TrendsChart = ({ data }) => {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="text-center py-4 text-muted small">
        <i className="bi bi-bar-chart fs-3 d-block mb-2 text-secondary"></i>
        No trend data available
      </div>
    );
  }

  const entries = Object.entries(data); // [["Apr 2026", 4], ...]
  const values = entries.map(([_, v]) => v);
  const maxVal = Math.max(...values, 5);

  return (
    <div className="w-100" style={{ height: '220px' }}>
      <div className="d-flex justify-content-between align-items-end h-100 pt-3 pb-2 px-2">
        {entries.map(([month, count]) => {
          const heightPercent = Math.max((count / maxVal) * 100, 4);
          return (
            <div
              key={month}
              className="d-flex flex-column align-items-center flex-grow-1"
              style={{ maxWidth: '60px' }}
            >
              <div
                className="w-100 d-flex flex-column justify-content-end align-items-center"
                style={{ height: '150px' }}
              >
                <span className="small text-muted mb-1 fw-semibold" style={{ fontSize: '0.75rem' }}>
                  {count}
                </span>
                <div
                  className="w-75 rounded-top transition-all"
                  style={{
                    height: `${heightPercent}%`,
                    backgroundColor: '#1479E8',
                    transition: 'height 0.4s ease',
                    minHeight: '6px',
                  }}
                  title={`${month}: ${count} requests`}
                ></div>
              </div>
              <div
                className="text-muted small mt-2 text-truncate w-100 text-center fw-medium"
                style={{ fontSize: '0.7rem' }}
                title={month}
              >
                {month.split(' ')[0]}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrendsChart;
