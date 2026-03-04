import { useState } from 'react';
import { useIncomes } from '../hooks/useIncomes';
import { incomeService } from '../services/incomeService';
import { useToast } from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/dateHelpers';
import { useBudgets } from '../hooks/useBudgets';
import IncomeForm from '../components/incomes/IncomeForm';
import IncomeSummary from '../components/incomes/IncomeSummary';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import Spinner from '../components/common/Spinner';

const IncomesPage = () => {
  const { addToast } = useToast();
  const { user } = useAuth();
  const currency = user?.currency || 'KES';

  const [filters, setFilters] = useState({ source: '', budgetId: '', startDate: '', endDate: '', isRecurring: '' });
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const queryParams = {
    page,
    limit: 15,
    sortBy,
    sortOrder,
    ...(filters.source && { source: filters.source }),
    ...(filters.budgetId && { budgetId: filters.budgetId }),
    ...(filters.startDate && { startDate: filters.startDate }),
    ...(filters.endDate && { endDate: filters.endDate }),
    ...(filters.isRecurring !== '' && { isRecurring: filters.isRecurring }),
  };

  // load all for the summary cards (no pagination), and paginated for the table
  const { incomes: allIncomes } = useIncomes({ limit: 200 });
  const { incomes, meta, loading, refetch } = useIncomes(queryParams);
  const { budgets } = useBudgets();

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const handleCreate = async (data) => {
    setSaving(true);
    try {
      await incomeService.create(data);
      addToast('Income added!', 'success');
      setFormOpen(false);
      refetch();
    } catch (err) {
      addToast(err.response?.data?.error?.message || 'Failed to add income', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (data) => {
    setSaving(true);
    try {
      await incomeService.update(editTarget.id, data);
      addToast('Income updated!', 'success');
      setEditTarget(null);
      refetch();
    } catch (err) {
      addToast(err.response?.data?.error?.message || 'Failed to update income', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await incomeService.remove(deleteTarget.id);
      addToast('Income deleted', 'success');
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      addToast(err.response?.data?.error?.message || 'Failed to delete', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return <span className="text-gray-300 ml-1">↕</span>;
    return <span className="text-brand-coral ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div>
      {/* header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Income</h1>
          <p className="text-sm text-gray-500 mt-0.5">{meta.total} total entries</p>
        </div>
        <button onClick={() => setFormOpen(true)} className="btn-primary flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Income
        </button>
      </div>

      {/* summary cards */}
      <IncomeSummary incomes={allIncomes} />

      {/* filter bar */}
      <div className="card p-4 mb-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[160px]">
            <label className="label text-xs">Source</label>
            <input
              className="input text-sm"
              placeholder="Filter by source..."
              value={filters.source}
              onChange={(e) => { setFilters((f) => ({ ...f, source: e.target.value })); setPage(1); }}
            />
          </div>
          <div className="min-w-[150px]">
            <label className="label text-xs">Budget</label>
            <select
              className="input text-sm"
              value={filters.budgetId}
              onChange={(e) => { setFilters((f) => ({ ...f, budgetId: e.target.value })); setPage(1); }}
            >
              <option value="">All budgets</option>
              {budgets.map((b) => (
                <option key={b.id} value={b.id}>{b.title}</option>
              ))}
            </select>
          </div>
          <div className="min-w-[120px]">
            <label className="label text-xs">Type</label>
            <select
              className="input text-sm"
              value={filters.isRecurring}
              onChange={(e) => { setFilters((f) => ({ ...f, isRecurring: e.target.value })); setPage(1); }}
            >
              <option value="">All types</option>
              <option value="true">Recurring</option>
              <option value="false">One-time</option>
            </select>
          </div>
          <div className="min-w-[130px]">
            <label className="label text-xs">From</label>
            <input
              type="date"
              className="input text-sm"
              value={filters.startDate}
              onChange={(e) => { setFilters((f) => ({ ...f, startDate: e.target.value })); setPage(1); }}
            />
          </div>
          <div className="min-w-[130px]">
            <label className="label text-xs">To</label>
            <input
              type="date"
              className="input text-sm"
              value={filters.endDate}
              onChange={(e) => { setFilters((f) => ({ ...f, endDate: e.target.value })); setPage(1); }}
            />
          </div>
        </div>
      </div>

      {/* table */}
      {loading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : incomes.length === 0 ? (
        <EmptyState
          title="No income entries found"
          description="Record your income to see the full picture of your finances."
          action={
            <button onClick={() => setFormOpen(true)} className="btn-primary">Add income</button>
          }
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-surface-border bg-gray-50 dark:bg-gray-700">
                <tr>
                  {[
                    { field: 'date', label: 'Date' },
                    { field: 'source', label: 'Source' },
                    { field: 'amount', label: 'Amount' },
                  ].map(({ field, label }) => (
                    <th
                      key={field}
                      onClick={() => handleSort(field)}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 select-none"
                    >
                      {label}<SortIcon field={field} />
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {incomes.map((income) => (
                  <tr key={income.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {formatDate(income.date, 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 dark:text-white">{income.source}</p>
                      {income.description && (
                        <p className="text-xs text-gray-400 truncate max-w-[180px]">{income.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 tabular font-semibold text-brand-sage">
                      {formatCurrency(income.amount, currency)}
                    </td>
                    <td className="px-4 py-3">
                      {income.budget ? (
                        <span className="text-xs text-brand-blue truncate max-w-[120px] block">{income.budget.title}</span>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${income.isRecurring ? 'bg-brand-blue/10 text-brand-blue' : 'bg-gray-100 text-gray-500'}`}>
                        {income.isRecurring ? 'Recurring' : 'One-time'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setEditTarget(income)}
                          className="text-xs text-gray-500 hover:text-brand-blue px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteTarget(income)}
                          className="text-xs text-gray-500 hover:text-brand-danger px-2 py-1 rounded hover:bg-red-50 transition-colors"
                        >
                          Del
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* pagination */}
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-surface-border">
              <p className="text-sm text-gray-500">
                Page {meta.page} of {meta.totalPages} &mdash; {meta.total} results
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 1}
                  className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= meta.totalPages}
                  className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* modals */}
      <Modal isOpen={formOpen} onClose={() => setFormOpen(false)} title="Add income">
        <IncomeForm onSubmit={handleCreate} onCancel={() => setFormOpen(false)} loading={saving} />
      </Modal>

      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Edit income">
        <IncomeForm
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
        title="Delete income"
        message={`Delete this income entry (${deleteTarget?.source})? This cannot be undone.`}
        loading={deleting}
      />
    </div>
  );
};

export default IncomesPage;
