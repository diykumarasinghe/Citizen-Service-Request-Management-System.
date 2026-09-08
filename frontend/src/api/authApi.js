import api from './axios';

// Auth API helpers
export const loginApi = (email, password) =>
  api.post('/auth/login', { email: email.toLowerCase().trim(), password });

export const registerApi = (data) =>
  api.post('/auth/register', {
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    email: data.email.toLowerCase().trim(),
    phoneNumber: data.phoneNumber.trim(),
    password: data.password,
  });

export const forgotPasswordApi = (email, newPassword) =>
  api.post('/auth/forgot-password', {
    email: email.toLowerCase().trim(),
    newPassword,
  });

export const getMeApi = () => api.get('/auth/me');
