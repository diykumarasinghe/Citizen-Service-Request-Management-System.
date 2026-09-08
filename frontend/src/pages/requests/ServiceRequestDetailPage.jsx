import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal';

const ServiceRequestDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Admin inline update state
  const [adminStatus, setAdminStatus] = useState('');
  const [adminOfficer, setAdminOfficer] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusUpdateSuccess, setStatusUpdateSuccess] = useState('');

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchRequest = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const res = await api.get(`/requests/${id}`);
        setRequest(res.data);
        setAdminStatus(res.data.status);
        setAdminOfficer(res.data.assignedOfficer || '');
        setAdminNotes(res.data.adminNotes || '');
      } catch (err) {
        if (err.response?.status === 403) {
          navigate('/access-denied');
        } else if (err.response?.status === 404) {
          navigate('/404');
        } else {
          setErrorMsg(err.response?.data?.message || 'Failed to load request details.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchRequest();
  }, [id, navigate]);

  const handleAdminQuickUpdate = async (e) => {
    e.preventDefault();
    setIsUpdatingStatus(true);
    setStatusUpdateSuccess('');
    try {
      const res = await api.put(`/requests/${id}/admin`, {
        status: adminStatus,
        assignedOfficer: adminOfficer,
        adminNotes: adminNotes,
      });
      setRequest(res.data);
      setStatusUpdateSuccess('Request details updated successfully.');
      setTimeout(() => setStatusUpdateSuccess(''), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update request.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/requests/${id}`);
      navigate('/requests');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to delete service request.');
      setDeleteModalOpen(false);
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="spinner-wrapper">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading details...</span>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="custom-card p-5 text-center">
        <h5 className="text-dark">Service Request Not Found</h5>
        <Link to="/requests" className="btn btn-primary-custom mt-3">
          Back to Requests
        </Link>
      </div>
    );
  }

  const isCompleted = request.status === 'COMPLETED';
  const canEdit = isAdmin || (!isAdmin && !isCompleted);
  const canDelete = isAdmin || (!isAdmin && !isCompleted);

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Top Bar */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div className="d-flex align-items-center gap-3">
          <Link to="/requests" className="btn btn-outline-secondary btn-sm" id="back-requests-btn">
            <i className="bi bi-arrow-left"></i>
          </Link>
          <div>
            <div className="d-flex align-items-center gap-2">
              <h2 className="fw-bold mb-0 brand-font text-dark">{request.requestId}</h2>
              <StatusBadge status={request.status} />
            </div>
            <span className="text-muted small">
              Created on {new Date(request.createdDate).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="d-flex gap-2">
          {canEdit && (
            <Link
              to={`/requests/${request.id}/edit`}
              className="btn btn-outline-primary btn-sm px-3"
              id="detail-edit-btn"
            >
              <i className="bi bi-pencil me-1"></i> Edit Request
            </Link>
          )}
          {canDelete && (
            <button
              type="button"
              className="btn btn-outline-danger btn-sm px-3"
              onClick={() => setDeleteModalOpen(true)}
              id="detail-delete-btn"
            >
              <i className="bi bi-trash me-1"></i> Delete
            </button>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 mb-4 bg-danger bg-opacity-10 border border-danger border-opacity-25 rounded text-danger small">
          <i className="bi bi-exclamation-circle-fill me-2"></i>
          {errorMsg}
        </div>
      )}

      <div className="row g-4">
        {/* Main Details */}
        <div className="col-lg-8">
          <div className="custom-card p-4 mb-4">
            <h5 className="card-title-custom mb-3 pb-2 border-bottom">Request Information</h5>

            <div className="row g-3">
              <div className="col-sm-6">
                <span className="text-muted small d-block">Category</span>
                <span className="fw-semibold text-dark fs-6">{request.category}</span>
              </div>
              <div className="col-sm-6">
                <span className="text-muted small d-block">Required Service Date</span>
                <span className="fw-semibold text-dark fs-6">
                  {request.requiredServiceDate}
                </span>
              </div>

              <div className="col-12">
                <span className="text-muted small d-block">Location / Address</span>
                <div className="p-2 mt-1 bg-light rounded text-dark border">
                  <i className="bi bi-geo-alt-fill text-danger me-1"></i> {request.location}
                </div>
              </div>

              <div className="col-12">
                <span className="text-muted small d-block">Service Description</span>
                <div className="p-3 mt-1 bg-light rounded text-dark border" style={{ whiteSpace: 'pre-wrap' }}>
                  {request.description}
                </div>
              </div>
            </div>
          </div>

          {/* Admin Notes & Assigned Officer Card */}
          {(request.assignedOfficer || request.adminNotes) && (
            <div className="custom-card p-4">
              <h5 className="card-title-custom mb-3 pb-2 border-bottom">
                Municipal Action & Notes
              </h5>
              <div className="row g-3">
                {request.assignedOfficer && (
                  <div className="col-sm-6">
                    <span className="text-muted small d-block">Assigned Officer</span>
                    <span className="fw-semibold text-dark">
                      <i className="bi bi-person-badge me-1 text-primary"></i>
                      {request.assignedOfficer}
                    </span>
                  </div>
                )}
                {request.updatedDate && (
                  <div className="col-sm-6">
                    <span className="text-muted small d-block">Last Updated</span>
                    <span className="text-dark">
                      {new Date(request.updatedDate).toLocaleString()}
                    </span>
                  </div>
                )}
                {request.adminNotes && (
                  <div className="col-12">
                    <span className="text-muted small d-block">Internal Admin Notes</span>
                    <div className="p-2 mt-1 bg-warning bg-opacity-10 border border-warning border-opacity-25 rounded text-dark small">
                      {request.adminNotes}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Info & Admin Controls */}
        <div className="col-lg-4">
          {/* Citizen Details */}
          <div className="custom-card p-4 mb-4">
            <h5 className="card-title-custom mb-3 pb-2 border-bottom">Citizen Details</h5>
            <ul className="list-unstyled mb-0">
              <li className="mb-2">
                <span className="text-muted small d-block">Full Name</span>
                <span className="fw-semibold text-dark">{request.citizenName}</span>
              </li>
              <li className="mb-2">
                <span className="text-muted small d-block">Email</span>
                <span className="text-dark">{request.citizenEmail}</span>
              </li>
              <li>
                <span className="text-muted small d-block">Phone Number</span>
                <span className="text-dark">{request.phoneNumber}</span>
              </li>
            </ul>
          </div>

          {/* Admin Workflow Status Panel */}
          {isAdmin && (
            <div className="custom-card p-4">
              <h5 className="card-title-custom mb-3 pb-2 border-bottom">Update Status & Notes</h5>

              {statusUpdateSuccess && (
                <div className="p-2 mb-3 bg-success bg-opacity-10 border border-success border-opacity-25 rounded text-success small">
                  <i className="bi bi-check-circle-fill me-1"></i> {statusUpdateSuccess}
                </div>
              )}

              <form onSubmit={handleAdminQuickUpdate}>
                <div className="mb-3">
                  <label className="form-label" htmlFor="admin-quick-status">
                    Change Status
                  </label>
                  <select
                    id="admin-quick-status"
                    className="form-select form-select-sm"
                    value={adminStatus}
                    onChange={(e) => setAdminStatus(e.target.value)}
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label" htmlFor="admin-quick-officer">
                    Assigned Officer
                  </label>
                  <input
                    type="text"
                    id="admin-quick-officer"
                    className="form-control form-control-sm"
                    placeholder="Officer name"
                    value={adminOfficer}
                    onChange={(e) => setAdminOfficer(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label" htmlFor="admin-quick-notes">
                    Admin Notes
                  </label>
                  <textarea
                    id="admin-quick-notes"
                    rows={3}
                    className="form-control form-control-sm"
                    placeholder="Add progress or resolution notes..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary-custom btn-sm w-100"
                  disabled={isUpdatingStatus}
                  id="admin-update-quick-btn"
                >
                  {isUpdatingStatus ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Updating...
                    </>
                  ) : (
                    'Update Status & Notes'
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Service Request"
        message="Are you sure you want to delete this service request? This action cannot be undone."
        itemName={`${request.requestId} - ${request.category}`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default ServiceRequestDetailPage;
