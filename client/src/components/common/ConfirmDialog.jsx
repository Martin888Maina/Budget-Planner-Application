import Modal from './Modal';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Delete', loading }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
    <p className="text-gray-600 mb-6">{message}</p>
    <div className="flex justify-end gap-3">
      <button onClick={onClose} className="btn-secondary">Cancel</button>
      <button onClick={onConfirm} disabled={loading} className="btn-danger">
        {loading ? 'Deleting...' : confirmLabel}
      </button>
    </div>
  </Modal>
);

export default ConfirmDialog;
