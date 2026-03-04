import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTransactions } from '../hooks/useTransactions';
import { transactionService } from '../services/transactionService';
import { useToast } from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/dateHelpers';
import TransactionForm from '../components/transactions/TransactionForm';
import TransactionFilters from '../components/transactions/TransactionFilters';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import Spinner from '../components/common/Spinner';

const SORT_FIELDS = ['date', 'amount', 'description'];

const TransactionsPage = () => {
  const [searchParams] = useSearchParams();
  const { addToast } = useToast();
  const { user } = useAuth();
  const currency = user?.currency || 'KES';

  const [filters, setFilters] = useState({
    search: '',
    categoryId: searchParams.get('categoryId') || '',
    budgetId: searchParams.get('budgetId') || '',
    startDate: '',
    endDate: '',
  });
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selected, setSelected] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const queryParams = {
    page,
    limit: 15,
    sortBy,
    sortOrder,
    ...(filters.search && { search: filters.search }),
    ...(filters.categoryId && { categoryId: filters.categoryId }),
    ...(filters.budgetId && { budgetId: filters.budgetId }),
    ...(filters.startDate && { startDate: filters.startDate }),
    ...(filters.endDate && { endDate: filters.endDate }),
  };

  const { transactions, meta, loading, refetch } = useTransactions(queryParams);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
    setSelected([]);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const handleSelectAll = (e) => {
    setSelected(e.target.checked ? transactions.map((t) => t.id) : []);
  };

  const handleSelectOne = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleCreate = async (data) => {
    setSaving(true);
    try {
      await transactionService.create(data);
      addToast('Transaction added!', 'success');
      setFormOpen(false);
      refetch();
    } catch (err) {
      addToast(err.response?.data?.error?.message || 'Failed to add transaction', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (data) => {
    setSaving(true);
    try {
      await transactionService.update(editTarget.id, data);
      addToast('Transaction updated!', 'success');
      setEditTarget(null);
      refetch();
    } catch (err) {
      addToast(err.response?.data?.error?.message || 'Failed to update transaction', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await transactionService.remove(deleteTarget.id);
      addToast('Transaction deleted', 'success');
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      addToast(err.response?.data?.error?.message || 'Failed to delete', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    setDeleting(true);
    try {
      await transactionService.bulkDelete(selected);
      addToast(`${selected.length} transaction(s) deleted`, 'success');
      setSelected([]);
      setBulkDeleteOpen(false);
      refetch();
    } catch (err) {
      addToast(err.response?.data?.error?.message || 'Bulk delete failed', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const res = await transactionService.exportCSV({
        ...(filters.categoryId && { categoryId: filters.categoryId }),
        ...(filters.budgetId && { budgetId: filters.budgetId }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
      });
      // trigger a browser download
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'transactions.csv';
      link.click();
      window.URL.revokeObjectURL(url);
    } catch {
      addToast('Export failed', 'error');
    } finally {
      setExporting(false);
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h1>
          <p className="text-sm text-gray-500 mt-0.5">{meta.total} total</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleExportCSV}
            disabled={exporting}
            className="btn-secondary text-sm flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
          <button onClick={() => setFormOpen(true)} className="btn-primary text-sm flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Transaction
          </button>
        </div>
      </div>

      {/* filters */}
      <TransactionFilters
        filters={filters}
        onChange={handleFilterChange}
        onClear={() => handleFilterChange({ search: '', categoryId: '', budgetId: '', startDate: '', endDate: '' })}
      />

      {/* bulk delete bar */}
      {selected.length > 0 && (
        <div className="flex items-center justify-between bg-brand-coral/10 border border-brand-coral/30 rounded-lg px-4 py-2.5 mb-4">
          <span className="text-sm font-medium text-brand-coral">
            {selected.length} selected
          </span>
          <button onClick={() => setBulkDeleteOpen(true)} className="btn-danger text-xs py-1.5">
            Delete selected
          </button>
        </div>
      )}

      {/* table */}
      {loading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : transactions.length === 0 ? (
        <EmptyState
          title="No transactions found"
          description="Add your first transaction or adjust your filters."
          action={
            <button onClick={() => setFormOpen(true)} className="btn-primary">Add transaction</button>
          }
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-surface-border bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="pl-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={selected.length === transactions.length && transactions.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  {SORT_FIELDS.map((field) => (
                    <th
                      key={field}
                      onClick={() => handleSort(field)}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 select-none capitalize"
                    >
                      {field}<SortIcon field={field} />
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Budget
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {transactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      selected.includes(tx.id) ? 'bg-brand-coral/5' : ''
                    }`}
                  >
                    <td className="pl-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.includes(tx.id)}
                        onChange={() => handleSelectOne(tx.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {formatDate(tx.date, 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-3 max-w-[200px]">
                      <p className="font-medium text-gray-900 dark:text-white truncate">{tx.description}</p>
                      {tx.notes && <p className="text-xs text-gray-400 truncate">{tx.notes}</p>}
                    </td>
                    <td className="px-4 py-3 tabular font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(tx.amount, currency)}
                    </td>
                    <td className="px-4 py-3">
                      {tx.category ? (
                        <span
                          className="badge text-white text-xs"
                          style={{ backgroundColor: tx.category.color || '#A8A8A8' }}
                        >
                          {tx.category.name}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {tx.budget ? (
                        <span className="text-xs text-brand-blue truncate max-w-[120px] block">
                          {tx.budget.title}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setEditTarget(tx)}
                          className="text-xs text-gray-500 hover:text-brand-blue px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteTarget(tx)}
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

      {/* add modal */}
      <Modal isOpen={formOpen} onClose={() => setFormOpen(false)} title="Add transaction">
        <TransactionForm onSubmit={handleCreate} onCancel={() => setFormOpen(false)} loading={saving} />
      </Modal>

      {/* edit modal */}
      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Edit transaction">
        <TransactionForm
          onSubmit={handleUpdate}
          onCancel={() => setEditTarget(null)}
          defaultValues={editTarget}
          loading={saving}
        />
      </Modal>

      {/* single delete */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete transaction"
        message={`Delete "${deleteTarget?.description}"? This cannot be undone.`}
        loading={deleting}
      />

      {/* bulk delete */}
      <ConfirmDialog
        isOpen={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={handleBulkDelete}
        title="Delete selected transactions"
        message={`Delete ${selected.length} selected transaction(s)? This cannot be undone.`}
        loading={deleting}
      />
    </div>
  );
};

export default TransactionsPage;
