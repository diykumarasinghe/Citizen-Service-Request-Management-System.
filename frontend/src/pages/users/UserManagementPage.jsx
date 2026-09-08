import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal';

const UserManagementPage = () => {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setServerError('');
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      setServerError('Failed to load registered users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleActive = async (targetUser) => {
    if (targetUser.email.toLowerCase() === currentUser?.email?.toLowerCase()) {
      setServerError('You cannot deactivate your own admin account.');
      return;
    }

    setServerError('');
    setSuccessMsg('');
    try {
      const res = await api.patch(`/users/${targetUser.id}/toggle-status`);
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? res.data : u))
      );
      setSuccessMsg(
        `User ${targetUser.fullName} has been ${res.data.active ? 'activated' : 'deactivated'}.`
      );
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to update user status.');
    }
  };

  const handleChangeRole = async (targetUser, newRole) => {
    if (targetUser.email.toLowerCase() === currentUser?.email?.toLowerCase() && newRole !== 'ROLE_ADMIN') {
      setServerError('You cannot remove your own ADMIN role.');
      return;
    }

    setServerError('');
    setSuccessMsg('');
    try {
      const res = await api.patch(`/users/${targetUser.id}/role`, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? res.data : u))
      );
      setSuccessMsg(`Role updated to ${newRole === 'ROLE_ADMIN' ? 'ADMIN' : 'USER'} for ${targetUser.fullName}.`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to change user role.');
    }
  };

  const handleOpenDelete = (targetUser) => {
    if (targetUser.email.toLowerCase() === currentUser?.email?.toLowerCase()) {
      setServerError('You cannot delete your own admin account.');
      return;
    }
    setUserToDelete(targetUser);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/users/${userToDelete.id}`);
      setDeleteModalOpen(false);
      setUserToDelete(null);
      setSuccessMsg('User deleted successfully.');
      fetchUsers();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to delete user.');
      setDeleteModalOpen(false);
      setUserToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      u.fullName?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.phoneNumber?.includes(term)
    );
  });

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1 brand-font text-dark">User Management</h2>
          <p className="text-muted small mb-0">
            Oversee registered citizen accounts, toggle active status, and manage administrative roles.
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

      {/* Search Input Card */}
      <div className="custom-card p-3 mb-4">
        <div className="row g-2 align-items-center">
          <div className="col-md-6 col-lg-5">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                id="search-users-input"
              />
            </div>
          </div>
          <div className="col-md-3 ms-auto text-md-end text-muted small">
            Total Users: <span className="fw-bold text-dark">{users.length}</span>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="custom-card p-4">
        {loading ? (
          <div className="spinner-wrapper">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading users...</span>
            </div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-people empty-state-icon"></i>
            <h6 className="text-dark fw-semibold mb-1">No Users Found</h6>
            <p className="text-muted small">No user accounts match your search filter.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Contact Info</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined Date</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const isSelf = u.email.toLowerCase() === currentUser?.email?.toLowerCase();
                  return (
                    <tr key={u.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.fullName} className="avatar-circle" style={{ width: '36px', height: '36px' }} />
                          ) : (
                            <div className="avatar-circle" style={{ width: '36px', height: '36px', fontSize: '0.9rem' }}>
                              {u.firstName?.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="fw-semibold text-dark">
                              {u.fullName} {isSelf && <span className="badge bg-light text-primary border ms-1">You</span>}
                            </div>
                            <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                              ID: #{u.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="text-dark small">{u.email}</div>
                        <div className="text-muted small">{u.phoneNumber}</div>
                      </td>
                      <td>
                        <select
                          className="form-select form-select-sm"
                          value={u.role}
                          disabled={isSelf}
                          onChange={(e) => handleChangeRole(u, e.target.value)}
                          style={{ width: '130px' }}
                          id={`select-role-${u.id}`}
                        >
                          <option value="ROLE_USER">USER</option>
                          <option value="ROLE_ADMIN">ADMIN</option>
                        </select>
                      </td>
                      <td>
                        <button
                          type="button"
                          className={`btn btn-sm ${
                            u.active ? 'btn-outline-success' : 'btn-outline-danger'
                          }`}
                          onClick={() => handleToggleActive(u)}
                          disabled={isSelf}
                          title={isSelf ? 'Cannot deactivate self' : 'Toggle status'}
                          id={`toggle-status-${u.id}`}
                        >
                          {u.active ? (
                            <>
                              <i className="bi bi-check-circle-fill me-1"></i> Active
                            </>
                          ) : (
                            <>
                              <i className="bi bi-slash-circle me-1"></i> Inactive
                            </>
                          )}
                        </button>
                      </td>
                      <td className="text-muted small">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="text-end">
                        <button
                          type="button"
                          className="btn btn-sm btn-light border text-danger"
                          onClick={() => handleOpenDelete(u)}
                          disabled={isSelf}
                          title={isSelf ? 'Cannot delete self' : 'Delete user'}
                          id={`delete-user-${u.id}`}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete User Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        title="Delete User Account"
        message="Are you sure you want to permanently delete this user account? All corresponding service requests may be affected."
        itemName={userToDelete ? `${userToDelete.fullName} (${userToDelete.email})` : ''}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default UserManagementPage;
