import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import FieldFeedback from '../../components/common/FieldFeedback';
import { validateEmail, validateRequired } from '../../utils/validators';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (data) => {
    const errs = {};
    const emailErr = validateEmail(data.email);
    if (emailErr) errs.email = emailErr;

    const passErr = validateRequired(data.password);
    if (passErr) errs.password = passErr;

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
    formData.password !== '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    const validationErrors = validate(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    setServerError('');

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setServerError(err.response.data.message);
      } else {
        setServerError('Invalid email or password. Please try again.');
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
            <i className="bi bi-shield-check"></i>
          </div>
          <div>
            <h4 className="mb-0 fw-bold brand-font text-dark">Citizen Care</h4>
            <span className="text-secondary small">Service Request Portal</span>
          </div>
        </div>

        <h3 className="fw-bold mb-1 brand-font text-dark">Welcome Back</h3>
        <p className="text-muted small mb-4">
          Please sign in to access your citizen service portal.
        </p>

        {serverError && (
          <div className="p-3 mb-3 bg-danger bg-opacity-10 border border-danger border-opacity-25 rounded text-danger small fw-medium">
            <i className="bi bi-exclamation-circle-fill me-2"></i>
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className="mb-3">
            <label className="form-label" htmlFor="login-email">
              Email Address <span className="text-danger">*</span>
            </label>
            <input
              type="email"
              id="login-email"
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

          {/* Password */}
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label className="form-label mb-0" htmlFor="login-password">
                Password <span className="text-danger">*</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-decoration-none small text-primary fw-medium"
                id="forgot-password-link"
              >
                Forgot Password?
              </Link>
            </div>
            <input
              type="password"
              id="login-password"
              name="password"
              className={`form-control ${touched.password && errors.password ? 'is-invalid' : ''}`}
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="current-password"
            />
            {touched.password && <FieldFeedback error={errors.password} />}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            id="login-submit-btn"
            className="btn btn-primary-custom w-100 py-2 mt-2"
            disabled={!isFormValid || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="text-center mt-4 pt-2 border-top">
          <span className="text-muted small">Don't have an account? </span>
          <Link
            to="/register"
            className="text-primary fw-semibold small text-decoration-none"
            id="create-account-link"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
