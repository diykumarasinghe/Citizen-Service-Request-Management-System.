import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import FieldFeedback from '../../components/common/FieldFeedback';
import {
  validateName,
  validateEmail,
  validatePhone,
} from '../../utils/validators';

const ProfilePage = () => {
  const { user, updateCurrentUser, isAdmin } = useAuth();
  const fileInputRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Photo upload states
  const [uploadError, setUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
      });
    }
  }, [user]);

  const validate = (data) => {
    const errs = {};
    const fnErr = validateName(data.firstName);
    if (fnErr) errs.firstName = fnErr;

    const lnErr = validateName(data.lastName);
    if (lnErr) errs.lastName = lnErr;

    const emailErr = validateEmail(data.email);
    if (emailErr) errs.email = emailErr;

    const phoneErr = validatePhone(data.phoneNumber);
    if (phoneErr) errs.phoneNumber = phoneErr;

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
    formData.firstName.trim() !== '' &&
    formData.lastName.trim() !== '' &&
    formData.email.trim() !== '' &&
    formData.phoneNumber.trim() !== '';

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      phoneNumber: true,
    });

    const valErrors = validate(formData);
    setErrors(valErrors);

    if (Object.keys(valErrors).length > 0) return;

    setIsSubmitting(true);
    setServerError('');
    setSuccessMsg('');

    try {
      const res = await api.put('/profile', formData);
      updateCurrentUser(res.data);
      setSuccessMsg('Profile updated successfully.');
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      if (err.response?.data?.message) {
        setServerError(err.response.data.message);
      } else {
        setServerError('Failed to update profile information.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');

    // Rule: Accept only JPG, JPEG, PNG
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setUploadError('Invalid file type. Only JPG, JPEG, and PNG images are allowed.');
      e.target.value = '';
      return;
    }

    // Rule: Maximum upload size: 2MB
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError('File size exceeds 2MB limit. Please choose a smaller photo.');
      e.target.value = '';
      return;
    }

    // Upload photo
    setIsUploading(true);
    const data = new FormData();
    data.append('file', file);

    try {
      const res = await api.post('/profile/photo', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateCurrentUser(res.data);
      setSuccessMsg('Profile picture updated successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      if (err.response?.data?.message) {
        setUploadError(err.response.data.message);
      } else {
        setUploadError('Failed to upload photo.');
      }
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1 brand-font text-dark">My Profile</h2>
          <p className="text-muted small mb-0">
            View and manage your account information, contact credentials, and avatar.
          </p>
        </div>
      </div>

      {serverError && (
        <div className="p-3 mb-4 bg-danger bg-opacity-10 border border-danger border-opacity-25 rounded text-danger small">
          <i className="bi bi-exclamation-circle-fill me-2"></i>
          {serverError}
        </div>
      )}

      {successMsg && (
        <div className="p-3 mb-4 bg-success bg-opacity-10 border border-success border-opacity-25 rounded text-success small">
          <i className="bi bi-check-circle-fill me-2"></i>
          {successMsg}
        </div>
      )}

      <div className="row g-4">
        {/* Left Column: Avatar & Overview */}
        <div className="col-md-5">
          <div className="custom-card p-4 text-center">
            <div className="d-flex justify-content-center mb-3">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="Profile"
                  className="avatar-lg shadow-sm border border-2 border-white"
                />
              ) : (
                <div className="avatar-circle avatar-lg">
                  {user?.firstName?.charAt(0) || 'U'}
                </div>
              )}
            </div>

            <h5 className="fw-bold text-dark mb-1">{user?.fullName || 'User Name'}</h5>
            <span
              className={`role-badge ${
                isAdmin ? 'role-badge-admin' : 'role-badge-user'
              } d-inline-block mb-3`}
            >
              {isAdmin ? 'ADMINISTRATOR' : 'CITIZEN'}
            </span>

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept=".jpg,.jpeg,.png"
              style={{ display: 'none' }}
              onChange={handlePhotoSelect}
              id="avatar-file-input"
            />

            {/* Upload Button */}
            <div className="mt-2">
              <button
                type="button"
                className="btn btn-outline-primary btn-sm px-3 rounded-pill"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                id="upload-photo-btn"
              >
                {isUploading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1"></span>
                    Uploading...
                  </>
                ) : (
                  <>
                    <i className="bi bi-camera me-1"></i> Upload Photo
                  </>
                )}
              </button>
              <div className="text-muted small mt-1" style={{ fontSize: '0.75rem' }}>
                JPG, JPEG or PNG (Max 2MB)
              </div>
              {/* Inline red error below upload field */}
              <FieldFeedback error={uploadError} />
            </div>

            <div className="border-top pt-3 mt-4 text-start small">
              <div className="d-flex justify-content-between py-1">
                <span className="text-muted">Account ID:</span>
                <span className="fw-semibold text-dark">#{user?.id}</span>
              </div>
              <div className="d-flex justify-content-between py-1">
                <span className="text-muted">Member Since:</span>
                <span className="text-dark">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                </span>
              </div>
              <div className="d-flex justify-content-between py-1">
                <span className="text-muted">Status:</span>
                <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Account Details & Edit Form */}
        <div className="col-md-7">
          <div className="custom-card p-4">
            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
              <h5 className="card-title-custom">Account Information</h5>
              {!isEditing && (
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm px-3"
                  onClick={() => setIsEditing(true)}
                  id="edit-profile-btn"
                >
                  <i className="bi bi-pencil me-1"></i> Edit Profile
                </button>
              )}
            </div>

            {!isEditing ? (
              /* Read-only Profile Details */
              <div className="row g-3 py-2">
                <div className="col-sm-6">
                  <span className="text-muted small d-block">First Name</span>
                  <span className="fw-semibold text-dark">{user?.firstName}</span>
                </div>
                <div className="col-sm-6">
                  <span className="text-muted small d-block">Last Name</span>
                  <span className="fw-semibold text-dark">{user?.lastName}</span>
                </div>
                <div className="col-12">
                  <span className="text-muted small d-block">Email Address</span>
                  <span className="fw-semibold text-dark">{user?.email}</span>
                </div>
                <div className="col-sm-6">
                  <span className="text-muted small d-block">Phone Number</span>
                  <span className="fw-semibold text-dark">{user?.phoneNumber}</span>
                </div>
                <div className="col-sm-6">
                  <span className="text-muted small d-block">Assigned Role</span>
                  <span className="text-secondary fw-semibold">
                    {isAdmin ? 'ADMIN' : 'USER'} (Cannot be modified)
                  </span>
                </div>
              </div>
            ) : (
              /* Edit Profile Form */
              <form onSubmit={handleProfileSubmit} noValidate>
                <div className="row g-2 mb-3">
                  <div className="col-sm-6">
                    <label className="form-label" htmlFor="profile-firstname">
                      First Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      id="profile-firstname"
                      name="firstName"
                      className={`form-control ${
                        touched.firstName && errors.firstName ? 'is-invalid' : ''
                      }`}
                      value={formData.firstName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {touched.firstName && <FieldFeedback error={errors.firstName} />}
                  </div>

                  <div className="col-sm-6">
                    <label className="form-label" htmlFor="profile-lastname">
                      Last Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      id="profile-lastname"
                      name="lastName"
                      className={`form-control ${
                        touched.lastName && errors.lastName ? 'is-invalid' : ''
                      }`}
                      value={formData.lastName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {touched.lastName && <FieldFeedback error={errors.lastName} />}
                  </div>
                </div>

                {/* Email */}
                <div className="mb-3">
                  <label className="form-label" htmlFor="profile-email">
                    Email Address <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    id="profile-email"
                    name="email"
                    className={`form-control ${
                      touched.email && errors.email ? 'is-invalid' : ''
                    }`}
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {touched.email && <FieldFeedback error={errors.email} />}
                </div>

                {/* Phone */}
                <div className="mb-3">
                  <label className="form-label" htmlFor="profile-phone">
                    Phone Number (10 digits) <span className="text-danger">*</span>
                  </label>
                  <input
                    type="tel"
                    id="profile-phone"
                    name="phoneNumber"
                    maxLength={10}
                    className={`form-control ${
                      touched.phoneNumber && errors.phoneNumber ? 'is-invalid' : ''
                    }`}
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {touched.phoneNumber && <FieldFeedback error={errors.phoneNumber} />}
                </div>

                {/* Role Note: Users cannot change their own role */}
                <div className="mb-4">
                  <label className="form-label">Role</label>
                  <input
                    type="text"
                    className="form-control bg-light"
                    value={isAdmin ? 'ADMIN' : 'USER'}
                    disabled
                  />
                  <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
                    User roles can only be updated by a system administrator.
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="d-flex justify-content-end gap-2 pt-2 border-top">
                  <button
                    type="button"
                    className="btn btn-light btn-sm"
                    onClick={() => {
                      setIsEditing(false);
                      setErrors({});
                      setTouched({});
                      setServerError('');
                      if (user) {
                        setFormData({
                          firstName: user.firstName,
                          lastName: user.lastName,
                          email: user.email,
                          phoneNumber: user.phoneNumber,
                        });
                      }
                    }}
                    id="cancel-profile-btn"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary-custom btn-sm px-4"
                    disabled={!isFormValid || isSubmitting}
                    id="save-profile-btn"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1"></span>
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
