import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import FieldFeedback from '../../components/common/FieldFeedback';
import {
  validateName,
  validateEmail,
  validatePhone,
  validateRequired,
} from '../../utils/validators';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    const passErr = validateRequired(data.password);
    if (passErr) {
      errs.password = passErr;
    } else if (data.password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }

    const confErr = validateRequired(data.confirmPassword);
    if (confErr) {
      errs.confirmPassword = confErr;
    } else if (data.password !== data.confirmPassword) {
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
    formData.firstName.trim() !== '' &&
    formData.lastName.trim() !== '' &&
    formData.email.trim() !== '' &&
    formData.phoneNumber.trim() !== '' &&
    formData.password !== '' &&
    formData.confirmPassword !== '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      phoneNumber: true,
      password: true,
      confirmPassword: true,
    });

    const validationErrors = validate(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    setServerError('');

    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
      });
      navigate('/dashboard');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setServerError(err.response.data.message);
      } else {
        setServerError('Registration failed. Please check your information and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ maxWidth: '520px' }}>
        <div className="auth-brand">
          <div className="auth-brand-icon">
            <i className="bi bi-person-plus-fill"></i>
          </div>
          <div>
            <h4 className="mb-0 fw-bold brand-font text-dark">Citizen Care</h4>
            <span className="text-secondary small">Service Request Portal</span>
          </div>
        </div>

        <h3 className="fw-bold mb-1 brand-font text-dark">Create Account</h3>
        <p className="text-muted small mb-4">
          Register as a citizen to submit and track municipal service requests.
        </p>

        {serverError && (
          <div className="p-3 mb-3 bg-danger bg-opacity-10 border border-danger border-opacity-25 rounded text-danger small fw-medium">
            <i className="bi bi-exclamation-circle-fill me-2"></i>
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="row g-2 mb-2">
            {/* First Name */}
            <div className="col-sm-6">
              <label className="form-label" htmlFor="register-firstname">
                First Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                id="register-firstname"
                name="firstName"
                className={`form-control ${touched.firstName && errors.firstName ? 'is-invalid' : ''}`}
                placeholder="John"
                value={formData.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {touched.firstName && <FieldFeedback error={errors.firstName} />}
            </div>

            {/* Last Name */}
            <div className="col-sm-6">
              <label className="form-label" htmlFor="register-lastname">
                Last Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                id="register-lastname"
                name="lastName"
                className={`form-control ${touched.lastName && errors.lastName ? 'is-invalid' : ''}`}
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {touched.lastName && <FieldFeedback error={errors.lastName} />}
            </div>
          </div>

          {/* Email */}
          <div className="mb-3">
            <label className="form-label" htmlFor="register-email">
              Email Address <span className="text-danger">*</span>
            </label>
            <input
              type="email"
              id="register-email"
              name="email"
              className={`form-control ${touched.email && errors.email ? 'is-invalid' : ''}`}
              placeholder="john.doe@example.com"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="email"
            />
            {touched.email && <FieldFeedback error={errors.email} />}
          </div>

          {/* Phone Number */}
          <div className="mb-3">
            <label className="form-label" htmlFor="register-phone">
              Phone Number (10 digits) <span className="text-danger">*</span>
            </label>
            <input
              type="tel"
              id="register-phone"
              name="phoneNumber"
              className={`form-control ${touched.phoneNumber && errors.phoneNumber ? 'is-invalid' : ''}`}
              placeholder="0712345678"
              maxLength={10}
              value={formData.phoneNumber}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {touched.phoneNumber && <FieldFeedback error={errors.phoneNumber} />}
          </div>

          {/* Password */}
          <div className="row g-2 mb-3">
            <div className="col-sm-6">
              <label className="form-label" htmlFor="register-password">
                Password <span className="text-danger">*</span>
              </label>
              <input
                type="password"
                id="register-password"
                name="password"
                className={`form-control ${touched.password && errors.password ? 'is-invalid' : ''}`}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {touched.password && <FieldFeedback error={errors.password} />}
            </div>

            {/* Confirm Password */}
            <div className="col-sm-6">
              <label className="form-label" htmlFor="register-confirmpassword">
                Confirm Password <span className="text-danger">*</span>
              </label>
              <input
                type="password"
                id="register-confirmpassword"
                name="confirmPassword"
                className={`form-control ${touched.confirmPassword && errors.confirmPassword ? 'is-invalid' : ''}`}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {touched.confirmPassword && <FieldFeedback error={errors.confirmPassword} />}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            id="register-submit-btn"
            className="btn btn-primary-custom w-100 py-2 mt-2"
            disabled={!isFormValid || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="text-center mt-4 pt-2 border-top">
          <span className="text-muted small">Already have an account? </span>
          <Link
            to="/login"
            className="text-primary fw-semibold small text-decoration-none"
            id="login-link"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
