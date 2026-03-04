import { useState } from 'react';
import { useBudgets } from '../hooks/useBudgets';
import { budgetService } from '../services/budgetService';
import { useToast } from '../components/common/Toast';
import BudgetCard from '../components/budgets/BudgetCard';
import BudgetForm from '../components/budgets/BudgetForm';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import Spinner from '../components/common/Spinner';

const BudgetsPage = () => {
  const { budgets, loading, refetch } = useBudgets();
  const { addToast } = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [filter, setFilter] = useState('all');

  const handleCreate = async (data) => {
    setSaving(true);
    try {
      await budgetService.create(data);
      addToast('Budget created!', 'success');
      setFormOpen(false);
      refetch();
    } catch (err) {
      addToast(err.response?.data?.error?.message || 'Failed to create budget', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (data) => {
    setSaving(true);
    try {
      await budgetService.update(editTarget.id, data);
      addToast('Budget updated!', 'success');
      setEditTarget(null);
      refetch();
    } catch (err) {
      addToast(err.response?.data?.error?.message || 'Failed to update budget', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await budgetService.remove(deleteTarget.id);
      addToast('Budget deleted', 'success');
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      addToast(err.response?.data?.error?.message || 'Failed to delete budget', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleStatus = async (budget) => {
    try {
      await budgetService.toggleStatus(budget.id);
      addToast(`Budget ${budget.isActive ? 'deactivated' : 'activated'}`, 'success');
      refetch();
    } catch {
      addToast('Failed to update status', 'error');
    }
  };

  const filtered = budgets.filter((b) => {
    if (filter === 'active') return b.isActive;
    if (filter === 'inactive') return !b.isActive;
    return true;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Budgets</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {budgets.length} budget{budgets.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <button onClick={() => setFormOpen(true)} className="btn-primary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Budget
        </button>
      </div>

      {/* filter tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1 w-fit mb-6">
        {['all', 'active', 'inactive'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
              filter === f
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={filter === 'all' ? 'No budgets yet' : `No ${filter} budgets`}
          description={filter === 'all' ? 'Create your first budget to start planning your finances.' : undefined}
          action={
            filter === 'all' && (
              <button onClick={() => setFormOpen(true)} className="btn-primary">
                Create your first budget
              </button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              onEdit={(b) => setEditTarget(b)}
              onDelete={(b) => setDeleteTarget(b)}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      )}

      <Modal isOpen={formOpen} onClose={() => setFormOpen(false)} title="Create new budget">
        <BudgetForm onSubmit={handleCreate} onCancel={() => setFormOpen(false)} loading={saving} />
      </Modal>

      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Edit budget">
        <BudgetForm
          onSubmit={handleUpdate}
          onCancel={() => setEditTarget(null)}
          defaultValues={editTarget}
          loading={saving}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete budget"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? All linked allocations will be removed.`}
        loading={deleting}
      />
    </div>
  );
};

export default BudgetsPage;
