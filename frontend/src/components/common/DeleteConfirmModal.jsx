import React from 'react';

const DeleteConfirmModal = ({ isOpen, title, message, itemName, onConfirm, onCancel, isDeleting }) => {
  if (!isOpen) return null;

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 1060 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '14px' }}>
          <div className="modal-header border-bottom-0 pb-0">
            <div className="d-flex align-items-center gap-2 text-danger">
              <i className="bi bi-exclamation-triangle-fill fs-4"></i>
              <h5 className="modal-title fw-bold text-dark">{title || 'Confirm Deletion'}</h5>
            </div>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={onCancel}
              disabled={isDeleting}
            ></button>
          </div>
          <div className="modal-body py-3">
            <p className="text-secondary mb-1">
              {message || 'Are you sure you want to permanently delete this item? This action cannot be undone.'}
            </p>
            {itemName && (
              <div className="p-2 mt-2 bg-light rounded text-dark fw-semibold border">
                {itemName}
              </div>
            )}
          </div>
          <div className="modal-footer border-top-0 pt-0">
            <button
              type="button"
              className="btn btn-light px-3"
              onClick={onCancel}
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger px-4 fw-medium"
              onClick={onConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Deleting...
                </>
              ) : (
                'Delete Permanently'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
