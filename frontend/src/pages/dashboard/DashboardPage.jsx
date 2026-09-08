import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import TrendsChart from '../../components/charts/TrendsChart';

const DashboardPage = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setFetchError('');
      try {
        const [statsRes, recentRes] = await Promise.all([
          api.get('/requests/stats'),
          api.get('/requests/recent'),
        ]);
        setStats(statsRes.data);
        setRecentRequests(recentRes.data);
      } catch (err) {
        setFetchError('Failed to load dashboard statistics. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="spinner-wrapper">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1 brand-font text-dark">
            {isAdmin ? 'Admin Dashboard' : 'Citizen Dashboard'}
          </h2>
          <p className="text-muted small mb-0">
            {isAdmin
              ? 'Real-time overview of municipal service requests and system activity.'
              : 'Track the status and progress of your submitted service requests.'}
          </p>
        </div>
        <div>
          {!isAdmin ? (
            <Link
              to="/requests/new"
              className="btn btn-primary-custom d-flex align-items-center gap-2"
              id="new-service-request-btn"
            >
              <i className="bi bi-plus-lg"></i>
              <span>New Service Request</span>
            </Link>
          ) : (
            <Link
              to="/requests"
              className="btn btn-primary-custom d-flex align-items-center gap-2"
              id="manage-requests-btn"
            >
              <i className="bi bi-list-check"></i>
              <span>Manage Requests</span>
            </Link>
          )}
        </div>
      </div>

      {fetchError && (
        <div className="p-3 mb-4 bg-danger bg-opacity-10 border border-danger border-opacity-25 rounded text-danger small">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {fetchError}
        </div>
      )}

      {/* 5 Metric Cards */}
      <div className="row g-3 mb-4">
        {/* Total Requests */}
        <div className="col-12 col-sm-6 col-xl-2dot4 col-lg-4">
          <div className="custom-card stat-card hover-lift">
            <div className="stat-icon-wrapper stat-icon-blue">
              <i className="bi bi-folder2-open"></i>
            </div>
            <div>
              <div className="stat-number">{stats?.totalRequests || 0}</div>
              <div className="stat-label">Total Requests</div>
            </div>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="col-12 col-sm-6 col-xl-2dot4 col-lg-4">
          <div className="custom-card stat-card hover-lift">
            <div className="stat-icon-wrapper stat-icon-amber">
              <i className="bi bi-clock-history"></i>
            </div>
            <div>
              <div className="stat-number">{stats?.pendingRequests || 0}</div>
              <div className="stat-label">Pending</div>
            </div>
          </div>
        </div>

        {/* In Progress Requests */}
        <div className="col-12 col-sm-6 col-xl-2dot4 col-lg-4">
          <div className="custom-card stat-card hover-lift">
            <div className="stat-icon-wrapper stat-icon-indigo">
              <i className="bi bi-arrow-repeat"></i>
            </div>
            <div>
              <div className="stat-number">{stats?.inProgressRequests || 0}</div>
              <div className="stat-label">In Progress</div>
            </div>
          </div>
        </div>

        {/* Completed Requests */}
        <div className="col-12 col-sm-6 col-xl-2dot4 col-lg-6">
          <div className="custom-card stat-card hover-lift">
            <div className="stat-icon-wrapper stat-icon-green">
              <i className="bi bi-check2-circle"></i>
            </div>
            <div>
              <div className="stat-number">{stats?.completedRequests || 0}</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>
        </div>

        {/* Rejected Requests */}
        <div className="col-12 col-sm-6 col-xl-2dot4 col-lg-6">
          <div className="custom-card stat-card hover-lift">
            <div className="stat-icon-wrapper stat-icon-red">
              <i className="bi bi-x-circle"></i>
            </div>
            <div>
              <div className="stat-number">{stats?.rejectedRequests || 0}</div>
              <div className="stat-label">Rejected</div>
            </div>
          </div>
        </div>
      </div>

      {/* Row: Trend Chart & Request Summary */}
      <div className="row g-3 mb-4">
        {/* Service Request Trends chart */}
        <div className="col-lg-8">
          <div className="custom-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div>
                <h5 className="card-title-custom">Service Request Trends</h5>
                <span className="text-muted small">Monthly submission volume (Last 6 months)</span>
              </div>
              <span className="badge bg-light text-primary border px-3 py-1 fw-medium">
                Activity
              </span>
            </div>
            <TrendsChart data={stats?.monthlyTrends} />
          </div>
        </div>

        {/* Request Summary card */}
        <div className="col-lg-4">
          <div className="custom-card p-4 h-100 d-flex flex-column justify-content-between">
            <div>
              <h5 className="card-title-custom mb-1">Request Summary</h5>
              <span className="text-muted small">Breakdown by current status</span>
              <div className="mt-4">
                {/* Progress bar */}
                {stats?.totalRequests > 0 ? (
                  <>
                    <div className="progress mb-3" style={{ height: '10px' }}>
                      <div
                        className="progress-bar bg-warning"
                        role="progressbar"
                        style={{
                          width: `${(stats.pendingRequests / stats.totalRequests) * 100}%`,
                        }}
                      ></div>
                      <div
                        className="progress-bar bg-primary"
                        role="progressbar"
                        style={{
                          width: `${(stats.inProgressRequests / stats.totalRequests) * 100}%`,
                        }}
                      ></div>
                      <div
                        className="progress-bar bg-success"
                        role="progressbar"
                        style={{
                          width: `${(stats.completedRequests / stats.totalRequests) * 100}%`,
                        }}
                      ></div>
                      <div
                        className="progress-bar bg-danger"
                        role="progressbar"
                        style={{
                          width: `${(stats.rejectedRequests / stats.totalRequests) * 100}%`,
                        }}
                      ></div>
                    </div>

                    <ul className="list-unstyled small mb-0">
                      <li className="d-flex justify-content-between py-1 border-bottom">
                        <span className="text-muted">
                          <span className="badge bg-warning me-2 p-1"> </span>Pending
                        </span>
                        <span className="fw-semibold">{stats.pendingRequests}</span>
                      </li>
                      <li className="d-flex justify-content-between py-1 border-bottom">
                        <span className="text-muted">
                          <span className="badge bg-primary me-2 p-1"> </span>In Progress
                        </span>
                        <span className="fw-semibold">{stats.inProgressRequests}</span>
                      </li>
                      <li className="d-flex justify-content-between py-1 border-bottom">
                        <span className="text-muted">
                          <span className="badge bg-success me-2 p-1"> </span>Completed
                        </span>
                        <span className="fw-semibold">{stats.completedRequests}</span>
                      </li>
                      <li className="d-flex justify-content-between py-1">
                        <span className="text-muted">
                          <span className="badge bg-danger me-2 p-1"> </span>Rejected
                        </span>
                        <span className="fw-semibold">{stats.rejectedRequests}</span>
                      </li>
                    </ul>
                  </>
                ) : (
                  <div className="text-center py-4 text-muted small">
                    No requests recorded yet.
                  </div>
                )}
              </div>
            </div>

            {isAdmin && (
              <div className="pt-3 border-top mt-3">
                <div className="d-flex justify-content-between align-items-center small">
                  <span className="text-muted">Registered Users</span>
                  <span className="badge bg-secondary fw-semibold">{stats?.totalUsers || 0}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Service Requests table */}
      <div className="custom-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="card-title-custom">Recent Service Requests</h5>
            <span className="text-muted small">Latest submitted citizen requests</span>
          </div>
          <Link
            to="/requests"
            className="btn btn-sm btn-outline-primary px-3 rounded-pill"
            id="view-all-requests-btn"
          >
            View All Requests
          </Link>
        </div>

        {recentRequests.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-inbox empty-state-icon"></i>
            <h6 className="text-dark fw-semibold mb-1">No Service Requests Found</h6>
            <p className="text-muted small mb-3">
              {isAdmin
                ? 'No citizen service requests have been registered yet.'
                : "You haven't submitted any service requests yet."}
            </p>
            {!isAdmin && (
              <Link to="/requests/new" className="btn btn-sm btn-primary-custom" id="empty-state-new-req">
                Submit Your First Request
              </Link>
            )}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Category</th>
                  {isAdmin && <th>Citizen</th>}
                  <th>Required Date</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentRequests.map((req) => (
                  <tr key={req.id}>
                    <td>
                      <span className="fw-semibold text-primary">{req.requestId}</span>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border">{req.category}</span>
                    </td>
                    {isAdmin && (
                      <td>
                        <div className="fw-medium text-dark">{req.citizenName}</div>
                        <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                          {req.citizenEmail}
                        </div>
                      </td>
                    )}
                    <td>{req.requiredServiceDate}</td>
                    <td className="text-truncate" style={{ maxWidth: '160px' }} title={req.location}>
                      {req.location}
                    </td>
                    <td>
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="text-end">
                      <Link
                        to={`/requests/${req.id}`}
                        className="btn btn-sm btn-light border px-2 py-1 text-primary"
                        title="View Details"
                        id={`view-req-${req.id}`}
                      >
                        <i className="bi bi-eye"></i> Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
