import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AppLayout from '../components/layout/AppLayout';

// Pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import ServiceRequestListPage from '../pages/requests/ServiceRequestListPage';
import ServiceRequestFormPage from '../pages/requests/ServiceRequestFormPage';
import ServiceRequestDetailPage from '../pages/requests/ServiceRequestDetailPage';
import CategoryManagementPage from '../pages/categories/CategoryManagementPage';
import UserManagementPage from '../pages/users/UserManagementPage';
import ProfilePage from '../pages/profile/ProfilePage';

// Error Pages
import NotFoundPage from '../pages/errors/NotFoundPage';
import AccessDeniedPage from '../pages/errors/AccessDeniedPage';
import ServerErrorPage from '../pages/errors/ServerErrorPage';
import BadRequestPage from '../pages/errors/BadRequestPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Error Standalone Routes */}
      <Route path="/access-denied" element={<AccessDeniedPage />} />
      <Route path="/400" element={<BadRequestPage />} />
      <Route path="/500" element={<ServerErrorPage />} />
      <Route path="/404" element={<NotFoundPage />} />

      {/* Authenticated User Routes */}
      <Route element={<ProtectedRoute adminOnly={false} />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/requests" element={<ServiceRequestListPage />} />
          <Route path="/requests/new" element={<ServiceRequestFormPage />} />
          <Route path="/requests/:id" element={<ServiceRequestDetailPage />} />
          <Route path="/requests/:id/edit" element={<ServiceRequestFormPage />} />
          <Route path="/categories" element={<CategoryManagementPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Admin Only Protected Subroutes */}
          <Route element={<ProtectedRoute adminOnly={true} />}>
            <Route path="/users" element={<UserManagementPage />} />
          </Route>
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
