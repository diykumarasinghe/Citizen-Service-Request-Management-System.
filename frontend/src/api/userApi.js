import api from './axios';

// User Management API helpers (ADMIN only)
export const getAllUsersApi = () => api.get('/users');

export const getUserByIdApi = (id) => api.get(`/users/${id}`);

export const toggleUserStatusApi = (id) => api.patch(`/users/${id}/toggle-status`);

export const changeUserRoleApi = (id, role) => api.patch(`/users/${id}/role`, { role });

export const deleteUserApi = (id) => api.delete(`/users/${id}`);

// Profile API helpers (any authenticated user)
export const getProfileApi = () => api.get('/profile');

export const updateProfileApi = (data) => api.put('/profile', data);

export const uploadAvatarApi = (file) => {
  const form = new FormData();
  form.append('file', file);
  return api.post('/profile/photo', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
