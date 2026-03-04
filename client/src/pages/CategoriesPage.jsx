import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { categoryService } from '../services/categoryService';
import { useCategories } from '../hooks/useCategories';
import { useToast } from '../components/common/Toast';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import Spinner from '../components/common/Spinner';
import { CATEGORY_COLORS } from '../utils/constants';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  color: z.string().min(1, 'Pick a color'),
  type: z.enum(['expense', 'income', 'both']),
});

const CategoryForm = ({ onSubmit, onCancel, defaultValues, loading }) => {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues || { name: '', color: CATEGORY_COLORS[0], type: 'expense' },
  });

  const selectedColor = watch('color');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="label">Name</label>
        <input {...register('name')} className="input" placeholder="e.g. Pet Care" />
        {errors.name && <p className="mt-1 text-xs text-brand-danger">{errors.name.message}</p>}
      </div>

      <div>
        <label className="label">Type</label>
        <select {...register('type')} className="input">
          <option value="expense">Expense</option>
          <option value="income">Income</option>
          <option value="both">Both</option>
        </select>
      </div>

      <div>
        <label className="label">Color</label>
        <div className="flex flex-wrap gap-2 mt-1">
          {CATEGORY_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setValue('color', color)}
              className={`w-7 h-7 rounded-full transition-transform hover:scale-110 ${selectedColor === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
        {/* also allow typing a hex value */}
        <input {...register('color')} className="input mt-2 text-sm" placeholder="#hex color" />
        {errors.color && <p className="mt-1 text-xs text-brand-danger">{errors.color.message}</p>}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Saving...' : defaultValues ? 'Save changes' : 'Create category'}
        </button>
      </div>
    </form>
  );
};

const CategoriesPage = () => {
  const { addToast } = useToast();
  const [tab, setTab] = useState('expense');
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // refetch by changing a key
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = () => setRefreshKey((k) => k + 1);

  const { categories, loading } = useCategories();

  const filtered = categories.filter((c) => c.type === tab || c.type === 'both');
  const expenseCount = categories.filter((c) => c.type === 'expense' || c.type === 'both').length;
  const incomeCount = categories.filter((c) => c.type === 'income' || c.type === 'both').length;

  const handleCreate = async (data) => {
    setSaving(true);
    try {
      await categoryService.create(data);
      addToast('Category created!', 'success');
      setFormOpen(false);
      refresh();
    } catch (err) {
      addToast(err.response?.data?.error?.message || 'Failed to create category', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (data) => {
    setSaving(true);
    try {
      await categoryService.update(editTarget.id, data);
      addToast('Category updated!', 'success');
      setEditTarget(null);
      refresh();
    } catch (err) {
      addToast(err.response?.data?.error?.message || 'Failed to update category', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await categoryService.remove(deleteTarget.id);
      addToast('Category deleted', 'success');
      setDeleteTarget(null);
      refresh();
    } catch (err) {
      addToast(err.response?.data?.error?.message || 'Failed to delete category', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your spending and income categories.</p>
        </div>
        <button onClick={() => setFormOpen(true)} className="btn-primary flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Category
        </button>
      </div>

      {/* tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1 w-fit mb-6">
        {[
          { key: 'expense', label: `Expense (${expenseCount})` },
          { key: 'income', label: `Income (${incomeCount})` },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === key
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={`No ${tab} categories`}
          description="Create a custom category to organise your transactions."
          action={<button onClick={() => setFormOpen(true)} className="btn-primary">Create category</button>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((cat) => (
            <div key={cat.id} className="card p-4 flex items-center gap-3">
              {/* color swatch */}
              <div
                className="w-10 h-10 rounded-xl flex-shrink-0"
                style={{ backgroundColor: cat.color || '#A8A8A8' }}
              />

              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate">{cat.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="badge bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 capitalize text-xs">
                    {cat.type}
                  </span>
                  {cat.isDefault && (
                    <span className="badge bg-brand-blue/10 text-brand-blue text-xs">Default</span>
                  )}
                </div>
              </div>

              {/* only user-created categories can be edited or deleted */}
              {!cat.isDefault && (
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => setEditTarget(cat)}
                    className="p-1.5 text-gray-400 hover:text-brand-blue hover:bg-gray-100 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setDeleteTarget(cat)}
                    className="p-1.5 text-gray-400 hover:text-brand-danger hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={formOpen} onClose={() => setFormOpen(false)} title="New category" size="sm">
        <CategoryForm onSubmit={handleCreate} onCancel={() => setFormOpen(false)} loading={saving} />
      </Modal>

      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Edit category" size="sm">
        <CategoryForm
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
        title="Delete category"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone. Transactions using this category will lose their category assignment.`}
        loading={deleting}
      />
    </div>
  );
};

export default CategoriesPage;
