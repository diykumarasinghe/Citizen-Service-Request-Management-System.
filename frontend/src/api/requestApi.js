import api from './axios';

// Service Request API helpers
export const createRequestApi = (data) => api.post('/requests', data);

export const getRequestsApi = (params) => api.get('/requests', { params });

export const getRequestByIdApi = (id) => api.get(`/requests/${id}`);

export const updateRequestApi = (id, data) => api.put(`/requests/${id}`, data);

export const adminUpdateRequestApi = (id, data) => api.put(`/requests/${id}/admin`, data);

export const deleteRequestApi = (id) => api.delete(`/requests/${id}`);

export const getStatsApi = () => api.get('/requests/stats');

export const getRecentRequestsApi = () => api.get('/requests/recent');

// Report (PDF) API helpers
export const downloadRequestPdfApi = (id) =>
  api.get(`/reports/request/${id}`, { responseType: 'blob' });

export const downloadReportPdfApi = (params) =>
  api.get('/reports/all', { params, responseType: 'blob' });
