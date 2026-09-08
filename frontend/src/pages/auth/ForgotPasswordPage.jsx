import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import FieldFeedback from '../../components/common/FieldFeedback';
import { validateEmail, validateRequired } from '../../utils/validators';

const ForgotPasswordPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (data) => {
    const errs = {};
    const emailErr = validateEmail(data.email);
    if (emailErr) errs.email = emailErr;

    const passErr = validateRequired(data.newPassword);
    if (passErr) {
      errs.newPassword = passErr;
    } else if (data.newPassword.length < 6) {
      errs.newPassword = 'Password must be at least 6 characters.';
    }

    const confErr = validateRequired(data.confirmPassword);
    if (confErr) {
      errs.confirmPassword = confErr;
    } else if (data.newPassword !== data.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

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
    formData.email.trim() !== '' &&
    formData.newPassword !== '' &&
    formData.confirmPassword !== '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, newPassword: true, confirmPassword: true });
    const validationErrors = validate(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    setServerError('');

    try {
      const res = await api.post('/auth/forgot-password', {
        email: formData.email,
        newPassword: formData.newPassword,
      });
      setSuccessMessage(res.data?.message || 'If your email is registered, your password has been reset successfully.');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setServerError(err.response.data.message);
      } else {
        setServerError('Unable to process request. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-icon">
            <i className="bi bi-key-fill"></i>
          </div>
          <div>
            <h4 className="mb-0 fw-bold brand-font text-dark">Citizen Care</h4>
            <span className="text-secondary small">Service Request Portal</span>
          </div>
        </div>

        <h3 className="fw-bold mb-1 brand-font text-dark">Reset Password</h3>
        <p className="text-muted small mb-4">
          Enter your registered email and choose a new password.
        </p>

        {successMessage ? (
          <div className="p-3 bg-success bg-opacity-10 border border-success border-opacity-25 rounded text-success small mb-4">
            <div className="d-flex align-items-center gap-2 mb-2 fw-semibold">
              <i className="bi bi-check-circle-fill fs-5"></i>
              Password Reset Request Submitted
            </div>
            <p className="mb-3">{successMessage}</p>
            <Link to="/login" className="btn btn-sm btn-primary-custom w-100" id="back-to-login-btn">
              Return to Login
            </Link>
          </div>
        ) : (
          <>
            {serverError && (
              <div className="p-3 mb-3 bg-danger bg-opacity-10 border border-danger border-opacity-25 rounded text-danger small fw-medium">
                <i className="bi bi-exclamation-circle-fill me-2"></i>
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Email */}
              <div className="mb-3">
                <label className="form-label" htmlFor="forgot-email">
                  Registered Email Address <span className="text-danger">*</span>
                </label>
                <input
                  type="email"
                  id="forgot-email"
                  name="email"
                  className={`form-control ${touched.email && errors.email ? 'is-invalid' : ''}`}
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  autoComplete="email"
                />
                {touched.email && <FieldFeedback error={errors.email} />}
              </div>

              {/* New Password */}
              <div className="mb-3">
                <label className="form-label" htmlFor="forgot-newpassword">
                  New Password <span className="text-danger">*</span>
                </label>
                <input
                  type="password"
                  id="forgot-newpassword"
                  name="newPassword"
                  className={`form-control ${touched.newPassword && errors.newPassword ? 'is-invalid' : ''}`}
                  placeholder="••••••••"
                  value={formData.newPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {touched.newPassword && <FieldFeedback error={errors.newPassword} />}
              </div>

              {/* Confirm Password */}
              <div className="mb-3">
                <label className="form-label" htmlFor="forgot-confirmpassword">
                  Confirm New Password <span className="text-danger">*</span>
                </label>
                <input
                  type="password"
                  id="forgot-confirmpassword"
                  name="confirmPassword"
                  className={`form-control ${touched.confirmPassword && errors.confirmPassword ? 'is-invalid' : ''}`}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {touched.confirmPassword && <FieldFeedback error={errors.confirmPassword} />}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                id="reset-submit-btn"
                className="btn btn-primary-custom w-100 py-2 mt-2"
                disabled={!isFormValid || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Updating Password...
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>

            <div className="text-center mt-4 pt-2 border-top">
              <Link
                to="/login"
                className="text-primary fw-semibold small text-decoration-none"
                id="back-login-link"
              >
                <i className="bi bi-arrow-left me-1"></i> Back to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
