import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCategories } from '../../hooks/useCategories';
import { useBudgets } from '../../hooks/useBudgets';
import { toInputDate } from '../../utils/dateHelpers';

const schema = z.object({
  description: z.string().min(1, 'Description is required'),
  amount: z.coerce.number().positive('Must be a positive amount'),
  date: z.string().min(1, 'Date is required'),
  categoryId: z.string().optional(),
  budgetId: z.string().optional(),
  notes: z.string().optional(),
});

const TransactionForm = ({ onSubmit, onCancel, defaultValues, loading }) => {
  const { categories } = useCategories('expense');
  const { budgets } = useBudgets({ isActive: true });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      description: '',
      amount: '',
      date: toInputDate(new Date()),
      categoryId: '',
      budgetId: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (defaultValues) {
      reset({
        description: defaultValues.description || '',
        amount: defaultValues.amount || '',
        date: toInputDate(defaultValues.date) || toInputDate(new Date()),
        categoryId: defaultValues.categoryId || '',
        budgetId: defaultValues.budgetId || '',
        notes: defaultValues.notes || '',
      });
    }
  }, [defaultValues, reset]);

  const handleFormSubmit = (data) => {
    onSubmit({
      ...data,
      categoryId: data.categoryId || null,
      budgetId: data.budgetId || null,
      notes: data.notes || null,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label className="label">Description</label>
        <input
          {...register('description')}
          className="input"
          placeholder="What was this for?"
        />
        {errors.description && <p className="mt-1 text-xs text-brand-danger">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Amount</label>
          <input
            {...register('amount')}
            type="number"
            step="0.01"
            className="input"
            placeholder="0.00"
          />
          {errors.amount && <p className="mt-1 text-xs text-brand-danger">{errors.amount.message}</p>}
        </div>
        <div>
          <label className="label">Date</label>
          <input {...register('date')} type="date" className="input" />
          {errors.date && <p className="mt-1 text-xs text-brand-danger">{errors.date.message}</p>}
        </div>
      </div>

      <div>
        <label className="label">Category <span className="text-gray-400">(optional)</span></label>
        <select {...register('categoryId')} className="input">
          <option value="">No category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">Budget <span className="text-gray-400">(optional)</span></label>
        <select {...register('budgetId')} className="input">
          <option value="">No budget</option>
          {budgets.map((b) => (
            <option key={b.id} value={b.id}>{b.title}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">Notes <span className="text-gray-400">(optional)</span></label>
        <textarea
          {...register('notes')}
          className="input resize-none"
          rows={2}
          placeholder="Any extra details..."
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Saving...' : defaultValues ? 'Save changes' : 'Add transaction'}
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;
