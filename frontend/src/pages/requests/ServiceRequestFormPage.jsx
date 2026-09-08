import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import FieldFeedback from '../../components/common/FieldFeedback';
import {
  validateRequired,
  validateDescription,
  validateLocation,
  validateFutureDate,
  getTodayDateString,
} from '../../utils/validators';

const ServiceRequestFormPage = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEditMode);
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    location: '',
    requiredServiceDate: '',
    status: 'PENDING',
    assignedOfficer: '',
    adminNotes: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Fetch categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data);
        if (!isEditMode && res.data.length > 0) {
          setFormData((prev) => ({ ...prev, category: res.data[0].name }));
        }
      } catch {
        // Handle error silently
      }
    };
    loadCategories();
  }, [isEditMode]);

  // Load existing request data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const loadRequest = async () => {
        try {
          const res = await api.get(`/requests/${id}`);
          const data = res.data;

          // If Citizen and status is completed, cannot edit
          if (!isAdmin && data.status === 'COMPLETED') {
            setServerError('Completed service requests cannot be edited.');
            setLoading(false);
            return;
          }

          setFormData({
            category: data.category || '',
            description: data.description || '',
            location: data.location || '',
            requiredServiceDate: data.requiredServiceDate || '',
            status: data.status || 'PENDING',
            assignedOfficer: data.assignedOfficer || '',
            adminNotes: data.adminNotes || '',
          });
        } catch (err) {
          setServerError(err.response?.data?.message || 'Failed to load service request details.');
        } finally {
          setLoading(false);
        }
      };
      loadRequest();
    }
  }, [id, isEditMode, isAdmin]);

  const validate = (data) => {
    const errs = {};

    const catErr = validateRequired(data.category);
    if (catErr) errs.category = catErr;

    const descErr = validateDescription(data.description);
    if (descErr) errs.description = descErr;

    const locErr = validateLocation(data.location);
    if (locErr) errs.location = locErr;

    const dateErr = validateFutureDate(data.requiredServiceDate);
    if (dateErr) errs.requiredServiceDate = dateErr;

    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextData = { ...formData, [name]: value };
    setFormData(nextData);
    setServerError('');

    if (touched[name]) {
      const errs = validate(nextData);
      setErrors(errs);
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const errs = validate(formData);
    setErrors(errs);
  };

  const currentErrors = validate(formData);
  const isFormValid =
    Object.keys(currentErrors).length === 0 &&
    formData.category.trim() !== '' &&
    formData.description.trim().length >= 10 &&
    formData.location.trim().length >= 5 &&
    formData.requiredServiceDate !== '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      category: true,
      description: true,
      location: true,
      requiredServiceDate: true,
    });

    const validationErrors = validate(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    setServerError('');

    try {
      if (isEditMode) {
        if (isAdmin) {
          await api.put(`/requests/${id}/admin`, {
            category: formData.category,
            description: formData.description,
            location: formData.location,
            requiredServiceDate: formData.requiredServiceDate,
            status: formData.status,
            assignedOfficer: formData.assignedOfficer,
            adminNotes: formData.adminNotes,
          });
        } else {
          await api.put(`/requests/${id}`, {
            category: formData.category,
            description: formData.description,
            location: formData.location,
            requiredServiceDate: formData.requiredServiceDate,
          });
        }
      } else {
        await api.post('/requests', {
          category: formData.category,
          description: formData.description,
          location: formData.location,
          requiredServiceDate: formData.requiredServiceDate,
        });
      }

      navigate('/requests');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setServerError(err.response.data.message);
      } else {
        setServerError('An error occurred while saving the service request.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="spinner-wrapper">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading form...</span>
        </div>
      </div>
    );
  }

  const todayStr = getTodayDateString();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 className="fw-bold mb-1 brand-font text-dark">
            {isEditMode ? 'Edit Service Request' : 'Submit Service Request'}
          </h2>
          <p className="text-muted small mb-0">
            {isEditMode
              ? 'Update the details of your municipal service request.'
              : 'Fill in the information below to report a civic service requirement.'}
          </p>
        </div>
        <Link to="/requests" className="btn btn-outline-secondary btn-sm" id="back-to-list-btn">
          <i className="bi bi-arrow-left me-1"></i> Back
        </Link>
      </div>

      {serverError && (
        <div className="p-3 mb-4 bg-danger bg-opacity-10 border border-danger border-opacity-25 rounded text-danger small">
          <i className="bi bi-exclamation-circle-fill me-2"></i>
          {serverError}
        </div>
      )}

      <div className="custom-card p-4">
        <form onSubmit={handleSubmit} noValidate>
          {/* Category */}
          <div className="mb-3">
            <label className="form-label" htmlFor="request-category">
              Service Category <span className="text-danger">*</span>
            </label>
            <select
              id="request-category"
              name="category"
              className={`form-select ${touched.category && errors.category ? 'is-invalid' : ''}`}
              value={formData.category}
              onChange={handleChange}
              onBlur={handleBlur}
            >
              <option value="">-- Select a Category --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
            {touched.category && <FieldFeedback error={errors.category} />}
          </div>

          {/* Location / Address */}
          <div className="mb-3">
            <label className="form-label" htmlFor="request-location">
              Location / Address <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              id="request-location"
              name="location"
              className={`form-control ${touched.location && errors.location ? 'is-invalid' : ''}`}
              placeholder="e.g. 104 Main Street, Corner of Oak Avenue"
              value={formData.location}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <div className="d-flex justify-content-between align-items-center">
              {touched.location && <FieldFeedback error={errors.location} />}
              <span className="text-muted ms-auto small" style={{ fontSize: '0.75rem' }}>
                {formData.location.length}/250 (min 5)
              </span>
            </div>
          </div>

          {/* Required Service Date */}
          <div className="mb-3">
            <label className="form-label" htmlFor="request-date">
              Required Service Date <span className="text-danger">*</span>
            </label>
            <input
              type="date"
              id="request-date"
              name="requiredServiceDate"
              min={todayStr}
              className={`form-control ${
                touched.requiredServiceDate && errors.requiredServiceDate ? 'is-invalid' : ''
              }`}
              value={formData.requiredServiceDate}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {touched.requiredServiceDate && (
              <FieldFeedback error={errors.requiredServiceDate} />
            )}
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="form-label" htmlFor="request-description">
              Service Description <span className="text-danger">*</span>
            </label>
            <textarea
              id="request-description"
              name="description"
              rows={4}
              className={`form-control ${
                touched.description && errors.description ? 'is-invalid' : ''
              }`}
              placeholder="Provide specific details about the issue (minimum 10 characters)..."
              value={formData.description}
              onChange={handleChange}
              onBlur={handleBlur}
            ></textarea>
            <div className="d-flex justify-content-between align-items-center">
              {touched.description && <FieldFeedback error={errors.description} />}
              <span className="text-muted ms-auto small" style={{ fontSize: '0.75rem' }}>
                {formData.description.length}/500 (min 10)
              </span>
            </div>
          </div>

          {/* Admin-only Controls */}
          {isAdmin && isEditMode && (
            <div className="p-3 mb-4 bg-light rounded border">
              <h6 className="fw-bold text-dark mb-3">
                <i className="bi bi-shield-lock me-1"></i> Admin Management Controls
              </h6>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label" htmlFor="request-status">
                    Request Status
                  </label>
                  <select
                    id="request-status"
                    name="status"
                    className="form-select"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="request-officer">
                    Assigned Officer
                  </label>
                  <input
                    type="text"
                    id="request-officer"
                    name="assignedOfficer"
                    className="form-control"
                    placeholder="Officer Name / Team"
                    value={formData.assignedOfficer}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label" htmlFor="request-adminnotes">
                    Admin Notes
                  </label>
                  <textarea
                    id="request-adminnotes"
                    name="adminNotes"
                    rows={2}
                    className="form-control"
                    placeholder="Internal municipal notes regarding inspection or resolution..."
                    value={formData.adminNotes}
                    onChange={handleChange}
                  ></textarea>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="d-flex justify-content-end gap-2 pt-2 border-top">
            <Link to="/requests" className="btn btn-light px-3" id="cancel-request-btn">
              Cancel
            </Link>
            <button
              type="submit"
              id="save-request-submit-btn"
              className="btn btn-primary-custom px-4"
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Saving...
                </>
              ) : isEditMode ? (
                'Save Changes'
              ) : (
                'Submit Request'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceRequestFormPage;
