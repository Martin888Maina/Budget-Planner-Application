import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useBudget } from '../hooks/useBudgets';
import { budgetService } from '../services/budgetService';
import { useToast } from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/dateHelpers';
import BudgetProgress from '../components/budgets/BudgetProgress';
import BudgetForm from '../components/budgets/BudgetForm';
import AllocationBar from '../components/allocations/AllocationBar';
import AllocationForm from '../components/allocations/AllocationForm';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';

const BudgetDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { budget, loading, error, refetch } = useBudget(id);
  const { addToast } = useToast();
  const { user } = useAuth();
  const currency = user?.currency || 'KES';

  const [editBudgetOpen, setEditBudgetOpen] = useState(false);
  const [deleteBudgetOpen, setDeleteBudgetOpen] = useState(false);
  const [allocFormOpen, setAllocFormOpen] = useState(false);
  const [editAlloc, setEditAlloc] = useState(null);
  const [deleteAlloc, setDeleteAlloc] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleUpdateBudget = async (data) => {
    setSaving(true);
    try {
      await budgetService.update(id, data);
      addToast('Budget updated!', 'success');
      setEditBudgetOpen(false);
      refetch();
    } catch (err) {
      addToast(err.response?.data?.error?.message || 'Failed to update budget', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBudget = async () => {
    try {
      await budgetService.remove(id);
      addToast('Budget deleted', 'success');
      navigate('/app/budgets');
    } catch (err) {
      addToast(err.response?.data?.error?.message || 'Failed to delete budget', 'error');
    }
  };

  const handleAddAllocation = async (data) => {
    setSaving(true);
    try {
      await budgetService.createAllocation(id, data);
      addToast('Allocation added!', 'success');
      setAllocFormOpen(false);
      refetch();
    } catch (err) {
      addToast(err.response?.data?.error?.message || 'Failed to add allocation', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateAllocation = async (data) => {
    setSaving(true);
    try {
      await budgetService.updateAllocation(id, editAlloc.id, { amount: data.amount });
      addToast('Allocation updated!', 'success');
      setEditAlloc(null);
      refetch();
    } catch (err) {
      addToast(err.response?.data?.error?.message || 'Failed to update allocation', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAllocation = async () => {
    try {
      await budgetService.deleteAllocation(id, deleteAlloc.id);
      addToast('Allocation removed', 'success');
      setDeleteAlloc(null);
      refetch();
    } catch (err) {
      addToast(err.response?.data?.error?.message || 'Failed to remove allocation', 'error');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Spinner /></div>;
  }

  if (error || !budget) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">{error || 'Budget not found'}</p>
        <Link to="/app/budgets" className="text-brand-coral hover:underline text-sm mt-2 inline-block">
          Back to budgets
        </Link>
      </div>
    );
  }

  const spent = budget.totalSpent || 0;
  const total = budget.totalAmount || 0;
  const remaining = total - spent;
  const totalAllocated = budget.allocations?.reduce((s, a) => s + a.amount, 0) || 0;
  const unallocated = total - totalAllocated;
  const existingCategoryIds = budget.allocations?.map((a) => a.categoryId) || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/app/budgets" className="hover:text-brand-coral transition-colors">Budgets</Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white font-medium">{budget.title}</span>
      </div>

      {/* budget header card */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{budget.title}</h1>
              <span className={`badge ${budget.isActive ? 'bg-brand-sage/20 text-brand-dark' : 'bg-gray-100 text-gray-500'}`}>
                {budget.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            {budget.description && (
              <p className="text-sm text-gray-500">{budget.description}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              {formatDate(budget.startDate)} – {formatDate(budget.endDate)}
            </p>
          </div>

          <div className="flex gap-2 flex-shrink-0">
            <button onClick={() => setEditBudgetOpen(true)} className="btn-secondary text-sm py-1.5">
              Edit
            </button>
            <button onClick={() => setDeleteBudgetOpen(true)} className="btn-danger text-sm py-1.5">
              Delete
            </button>
          </div>
        </div>

        {/* summary numbers */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
          {[
            { label: 'Total Budget', value: formatCurrency(total, currency), color: 'text-gray-900' },
            { label: 'Total Spent', value: formatCurrency(spent, currency), color: spent > total ? 'text-brand-danger' : 'text-gray-900' },
            { label: 'Remaining', value: formatCurrency(Math.abs(remaining), currency), color: remaining < 0 ? 'text-brand-danger' : 'text-brand-sage' },
            { label: 'Unallocated', value: formatCurrency(Math.abs(unallocated), currency), color: unallocated < 0 ? 'text-brand-danger' : 'text-brand-blue' },
          ].map((item) => (
            <div key={item.label} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">{item.label}</p>
              <p className={`text-sm font-bold tabular ${item.color}`}>{item.value}</p>
            </div>
          ))}
        </div>

        <BudgetProgress spent={spent} total={total} height="h-3" />
        <p className="text-xs text-gray-500 mt-1 text-right">
          {total > 0 ? Math.round((spent / total) * 100) : 0}% of budget used
        </p>
      </div>

      {/* allocations section */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Category Allocations</h2>
          <button onClick={() => setAllocFormOpen(true)} className="btn-primary text-sm py-1.5 flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add allocation
          </button>
        </div>

        {budget.allocations?.length === 0 ? (
          <EmptyState
            title="No allocations yet"
            description="Add category allocations to track where your budget is going."
            action={
              <button onClick={() => setAllocFormOpen(true)} className="btn-primary">
                Add first allocation
              </button>
            }
          />
        ) : (
          <div>
            {budget.allocations.map((alloc) => (
              <AllocationBar
                key={alloc.id}
                allocation={alloc}
                onEdit={(a) => setEditAlloc(a)}
                onDelete={(a) => setDeleteAlloc(a)}
              />
            ))}
          </div>
        )}

        {unallocated !== 0 && budget.allocations?.length > 0 && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${
            unallocated < 0
              ? 'bg-brand-danger/10 text-brand-danger'
              : 'bg-brand-blue/10 text-brand-blue'
          }`}>
            {unallocated < 0
              ? `Allocations exceed budget by ${formatCurrency(Math.abs(unallocated), currency)}`
              : `${formatCurrency(unallocated, currency)} of budget is not yet allocated`}
          </div>
        )}
      </div>

      {/* linked transactions */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Linked Transactions
            {budget.transactions?.length > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({budget.transactions.length})
              </span>
            )}
          </h2>
          <Link
            to={`/app/transactions?budgetId=${id}`}
            className="text-sm text-brand-blue hover:underline"
          >
            View all
          </Link>
        </div>

        {!budget.transactions?.length ? (
          <p className="text-sm text-gray-500 text-center py-6">No transactions linked to this budget yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border text-left">
                  <th className="pb-2 text-xs font-medium text-gray-500">Date</th>
                  <th className="pb-2 text-xs font-medium text-gray-500">Description</th>
                  <th className="pb-2 text-xs font-medium text-gray-500">Category</th>
                  <th className="pb-2 text-xs font-medium text-gray-500 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {budget.transactions.slice(0, 10).map((tx) => (
                  <tr key={tx.id} className="border-b border-surface-border last:border-b-0">
                    <td className="py-2.5 text-gray-500">{formatDate(tx.date, 'MMM d')}</td>
                    <td className="py-2.5 text-gray-900 dark:text-white max-w-[180px] truncate">{tx.description}</td>
                    <td className="py-2.5">
                      {tx.category ? (
                        <span className="badge bg-gray-100 text-gray-600">{tx.category.name}</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-2.5 text-right tabular font-medium text-gray-900 dark:text-white">
                      {formatCurrency(tx.amount, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* modals */}
      <Modal isOpen={editBudgetOpen} onClose={() => setEditBudgetOpen(false)} title="Edit budget">
        <BudgetForm
          onSubmit={handleUpdateBudget}
          onCancel={() => setEditBudgetOpen(false)}
          defaultValues={budget}
          loading={saving}
        />
      </Modal>

      <ConfirmDialog
        isOpen={deleteBudgetOpen}
        onClose={() => setDeleteBudgetOpen(false)}
        onConfirm={handleDeleteBudget}
        title="Delete budget"
        message={`Delete "${budget.title}"? This cannot be undone and will remove all linked allocations.`}
      />

      <Modal isOpen={allocFormOpen} onClose={() => setAllocFormOpen(false)} title="Add allocation" size="sm">
        <AllocationForm
          onSubmit={handleAddAllocation}
          onCancel={() => setAllocFormOpen(false)}
          existingCategoryIds={existingCategoryIds}
          loading={saving}
        />
      </Modal>

      <Modal isOpen={!!editAlloc} onClose={() => setEditAlloc(null)} title="Edit allocation" size="sm">
        <AllocationForm
          onSubmit={handleUpdateAllocation}
          onCancel={() => setEditAlloc(null)}
          defaultValues={editAlloc}
          existingCategoryIds={existingCategoryIds}
          loading={saving}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteAlloc}
        onClose={() => setDeleteAlloc(null)}
        onConfirm={handleDeleteAllocation}
        title="Remove allocation"
        message={`Remove the allocation for "${deleteAlloc?.category?.name}"?`}
        confirmLabel="Remove"
      />
    </div>
  );
};

export default BudgetDetailPage;
