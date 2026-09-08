import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal';
import FieldFeedback from '../../components/common/FieldFeedback';
import { validateSearch } from '../../utils/validators';

const ServiceRequestListPage = () => {
  const { user, isAdmin } = useAuth();

  const [requests, setRequests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [searchError, setSearchError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch categories for filter dropdown
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data);
      } catch {
        // Ignore category fetch error
      }
    };
    fetchCats();
  }, []);

  // Fetch service requests
  const fetchRequests = useCallback(async () => {
    // If search term is invalid, do not query
    if (searchError) return;

    setLoading(true);
    setErrorMsg('');
    try {
      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (selectedCategory) params.category = selectedCategory;
      if (selectedStatus) params.status = selectedStatus;

      const res = await api.get('/requests', { params });
      setRequests(res.data);
    } catch (err) {
      if (err.response?.data?.message) {
        setErrorMsg(err.response.data.message);
      } else {
        setErrorMsg('Failed to load service requests.');
      }
    } finally {
      setLoading(false);
    }
  }, [searchTerm, searchError, selectedCategory, selectedStatus]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    const err = validateSearch(val);
    setSearchError(err);
  };

  const handleOpenDelete = (req) => {
    setRequestToDelete(req);
    setDeleteModalOpen(true);
  };

  const handleCloseDelete = () => {
    setDeleteModalOpen(false);
    setRequestToDelete(null);
    setIsDeleting(false);
  };

  const handleConfirmDelete = async () => {
    if (!requestToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/requests/${requestToDelete.id}`);
      setRequests((prev) => prev.filter((r) => r.id !== requestToDelete.id));
      handleCloseDelete();
    } catch (err) {
      if (err.response?.data?.message) {
        setErrorMsg(err.response.data.message);
      } else {
        setErrorMsg('Failed to delete request.');
      }
      handleCloseDelete();
    }
  };

  return (
    <div>
      {/* Top Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1 brand-font text-dark">Service Requests</h2>
          <p className="text-muted small mb-0">
            {isAdmin
              ? 'Manage, track, and assign citizen service requests.'
              : 'View and track your submitted municipal service requests.'}
          </p>
        </div>
        {!isAdmin && (
          <Link
            to="/requests/new"
            className="btn btn-primary-custom d-flex align-items-center gap-2"
            id="create-new-request-btn"
          >
            <i className="bi bi-plus-lg"></i>
            <span>New Request</span>
          </Link>
        )}
      </div>

      {errorMsg && (
        <div className="p-3 mb-3 bg-danger bg-opacity-10 border border-danger border-opacity-25 rounded text-danger small">
          <i className="bi bi-exclamation-circle-fill me-2"></i>
          {errorMsg}
        </div>
      )}

      {/* Filter and Search Bar Card */}
      <div className="custom-card p-3 mb-4">
        <div className="row g-3 align-items-center">
          {/* Search Input with regex validation */}
          <div className="col-12 col-md-5">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className={`form-control border-start-0 ${searchError ? 'is-invalid' : ''}`}
                placeholder="Search by ID, keyword, citizen, location..."
                value={searchTerm}
                onChange={handleSearchChange}
                id="search-requests-input"
              />
            </div>
            {/* Inline validation error below search */}
            <FieldFeedback error={searchError} />
          </div>

          {/* Category Filter */}
          <div className="col-6 col-md-3">
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              id="filter-category-select"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="col-6 col-md-3">
            <select
              className="form-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              id="filter-status-select"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {/* Reset button */}
          <div className="col-12 col-md-1 text-md-end">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm w-100 py-2"
              onClick={() => {
                setSearchTerm('');
                setSearchError('');
                setSelectedCategory('');
                setSelectedStatus('');
              }}
              title="Reset Filters"
              id="reset-filters-btn"
            >
              <i className="bi bi-arrow-counterclockwise"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="custom-card p-4">
        {loading ? (
          <div className="spinner-wrapper">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading requests...</span>
            </div>
          </div>
        ) : requests.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-clipboard2-x empty-state-icon"></i>
            <h6 className="text-dark fw-semibold mb-1">No Service Requests Found</h6>
            <p className="text-muted small mb-3">
              {searchTerm || selectedCategory || selectedStatus
                ? 'No requests match your selected filters. Try broadening your search.'
                : isAdmin
                ? 'No requests have been filed yet in the system.'
                : 'You have not submitted any service requests yet.'}
            </p>
            {!isAdmin && !searchTerm && !selectedCategory && !selectedStatus && (
              <Link to="/requests/new" className="btn btn-sm btn-primary-custom" id="empty-create-req-btn">
                Create Request
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
                  <th>Location</th>
                  <th>Service Date</th>
                  <th>Status</th>
                  <th>Officer</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => {
                  const isCompleted = req.status === 'COMPLETED';
                  const canEdit = isAdmin || (!isAdmin && !isCompleted);
                  const canDelete = isAdmin || (!isAdmin && !isCompleted);

                  return (
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
                      <td className="text-truncate" style={{ maxWidth: '160px' }} title={req.location}>
                        {req.location}
                      </td>
                      <td>{req.requiredServiceDate}</td>
                      <td>
                        <StatusBadge status={req.status} />
                      </td>
                      <td>
                        <span className="small text-secondary">
                          {req.assignedOfficer || '—'}
                        </span>
                      </td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          {/* View */}
                          <Link
                            to={`/requests/${req.id}`}
                            className="btn btn-light border text-primary"
                            title="View Details"
                            id={`view-btn-${req.id}`}
                          >
                            <i className="bi bi-eye"></i>
                          </Link>

                          {/* Edit (disabled if completed for citizen) */}
                          {canEdit && (
                            <Link
                              to={`/requests/${req.id}/edit`}
                              className="btn btn-light border text-secondary"
                              title="Edit Request"
                              id={`edit-btn-${req.id}`}
                            >
                              <i className="bi bi-pencil"></i>
                            </Link>
                          )}

                          {/* Delete (Opens delete modal) */}
                          {canDelete && (
                            <button
                              type="button"
                              className="btn btn-light border text-danger"
                              title="Delete Request"
                              onClick={() => handleOpenDelete(req)}
                              id={`delete-btn-${req.id}`}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Service Request"
        message="Are you sure you want to delete this service request? This action is permanent."
        itemName={
          requestToDelete
            ? `${requestToDelete.requestId} - ${requestToDelete.category}`
            : ''
        }
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default ServiceRequestListPage;
