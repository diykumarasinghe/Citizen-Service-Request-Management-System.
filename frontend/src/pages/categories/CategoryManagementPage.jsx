import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import FieldFeedback from '../../components/common/FieldFeedback';
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal';
import { validateRequired } from '../../utils/validators';

const CategoryManagementPage = () => {
  const { isAdmin } = useAuth();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form State for Create / Edit (inline form, NOT a popup modal)
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete modal state (Modal ONLY used for delete confirmation as required)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    setServerError('');
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      setServerError('Failed to load categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const validate = (data) => {
    const errs = {};
    const nameErr = validateRequired(data.name);
    if (nameErr) errs.name = nameErr;
    else if (data.name.trim().length > 100) {
      errs.name = 'Category name cannot exceed 100 characters.';
    }

    if (data.description && data.description.length > 500) {
      errs.description = 'Description cannot exceed 500 characters.';
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
  const isFormValid = Object.keys(currentErrors).length === 0 && formData.name.trim() !== '';

  const handleStartEdit = (cat) => {
    setEditingId(cat.id);
    setFormData({
      name: cat.name,
      description: cat.description || '',
    });
    setErrors({});
    setTouched({});
    setServerError('');
    setSuccessMsg('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelForm = () => {
    setEditingId(null);
    setFormData({ name: '', description: '' });
    setErrors({});
    setTouched({});
    setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, description: true });
    const valErrors = validate(formData);
    setErrors(valErrors);

    if (Object.keys(valErrors).length > 0) return;

    setIsSubmitting(true);
    setServerError('');
    setSuccessMsg('');

    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, formData);
        setSuccessMsg('Category updated successfully.');
      } else {
        await api.post('/categories', formData);
        setSuccessMsg('Category created successfully.');
      }
      handleCancelForm();
      fetchCategories();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      if (err.response?.data?.message) {
        setServerError(err.response.data.message);
      } else {
        setServerError('Failed to save category.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDelete = (cat) => {
    setCategoryToDelete(cat);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/categories/${categoryToDelete.id}`);
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
      fetchCategories();
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to delete category.');
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1 brand-font text-dark">Category Management</h2>
          <p className="text-muted small mb-0">
            Configure and maintain service request classification categories.
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
        {/* Inline Category Form (Only visible to Admin) */}
        {isAdmin && (
          <div className="col-lg-5">
            <div className="custom-card p-4">
              <h5 className="card-title-custom mb-3 pb-2 border-bottom">
                {editingId ? 'Edit Category' : 'Add New Category'}
              </h5>

              <form onSubmit={handleSubmit} noValidate>
                {/* Category Name */}
                <div className="mb-3">
                  <label className="form-label" htmlFor="category-name">
                    Category Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    id="category-name"
                    name="name"
                    className={`form-control ${touched.name && errors.name ? 'is-invalid' : ''}`}
                    placeholder="e.g. Park Maintenance"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {touched.name && <FieldFeedback error={errors.name} />}
                </div>

                {/* Description */}
                <div className="mb-3">
                  <label className="form-label" htmlFor="category-description">
                    Description
                  </label>
                  <textarea
                    id="category-description"
                    name="description"
                    rows={3}
                    className={`form-control ${
                      touched.description && errors.description ? 'is-invalid' : ''
                    }`}
                    placeholder="Short description of this service category..."
                    value={formData.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  ></textarea>
                  {touched.description && <FieldFeedback error={errors.description} />}
                </div>

                <div className="d-flex justify-content-end gap-2 pt-2 border-top">
                  {editingId && (
                    <button
                      type="button"
                      className="btn btn-light btn-sm"
                      onClick={handleCancelForm}
                      id="cancel-edit-category-btn"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="btn btn-primary-custom btn-sm px-3"
                    disabled={!isFormValid || isSubmitting}
                    id="save-category-btn"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1"></span>
                        Saving...
                      </>
                    ) : editingId ? (
                      'Update Category'
                    ) : (
                      'Create Category'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Categories Table */}
        <div className={isAdmin ? 'col-lg-7' : 'col-12'}>
          <div className="custom-card p-4">
            <h5 className="card-title-custom mb-3 pb-2 border-bottom">
              Available Categories ({categories.length})
            </h5>

            {loading ? (
              <div className="spinner-wrapper">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading categories...</span>
                </div>
              </div>
            ) : categories.length === 0 ? (
              <div className="empty-state">
                <i className="bi bi-tags empty-state-icon"></i>
                <h6 className="text-dark fw-semibold mb-1">No Categories Found</h6>
                <p className="text-muted small">No categories are currently defined.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Description</th>
                      {isAdmin && <th className="text-end">Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((cat) => (
                      <tr key={cat.id}>
                        <td className="fw-semibold text-dark">{cat.name}</td>
                        <td className="text-muted small" style={{ maxWidth: '280px' }}>
                          {cat.description || '—'}
                        </td>
                        {isAdmin && (
                          <td className="text-end">
                            <div className="btn-group btn-group-sm">
                              <button
                                type="button"
                                className="btn btn-light border text-secondary"
                                title="Edit Category"
                                onClick={() => handleStartEdit(cat)}
                                id={`edit-cat-${cat.id}`}
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button
                                type="button"
                                className="btn btn-light border text-danger"
                                title="Delete Category"
                                onClick={() => handleOpenDelete(cat)}
                                id={`delete-cat-${cat.id}`}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal (Used only for delete) */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Category"
        message="Are you sure you want to permanently delete this category?"
        itemName={categoryToDelete?.name}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default CategoryManagementPage;
