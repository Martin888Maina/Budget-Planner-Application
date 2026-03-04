import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCategories } from '../../hooks/useCategories';
import { useBudgets } from '../../hooks/useBudgets';
import { toInputDate } from '../../utils/dateHelpers';

const schema = z.object({
  source: z.string().min(1, 'Source is required'),
  amount: z.coerce.number().positive('Must be a positive amount'),
  date: z.string().min(1, 'Date is required'),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  budgetId: z.string().optional(),
  isRecurring: z.boolean().optional(),
});

const IncomeForm = ({ onSubmit, onCancel, defaultValues, loading }) => {
  const { categories } = useCategories('income');
  const { budgets } = useBudgets({ isActive: true });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      source: '',
      amount: '',
      date: toInputDate(new Date()),
      description: '',
      categoryId: '',
      budgetId: '',
      isRecurring: false,
    },
  });

  useEffect(() => {
    if (defaultValues) {
      reset({
        source: defaultValues.source || '',
        amount: defaultValues.amount || '',
        date: toInputDate(defaultValues.date) || toInputDate(new Date()),
        description: defaultValues.description || '',
        categoryId: defaultValues.categoryId || '',
        budgetId: defaultValues.budgetId || '',
        isRecurring: defaultValues.isRecurring || false,
      });
    }
  }, [defaultValues, reset]);

  const handleFormSubmit = (data) => {
    onSubmit({
      ...data,
      categoryId: data.categoryId || null,
      budgetId: data.budgetId || null,
      description: data.description || null,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label className="label">Source</label>
        <input
          {...register('source')}
          className="input"
          placeholder="e.g. Salary, Freelance, Side Hustle"
        />
        {errors.source && <p className="mt-1 text-xs text-brand-danger">{errors.source.message}</p>}
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
        <label className="label">Description <span className="text-gray-400">(optional)</span></label>
        <input
          {...register('description')}
          className="input"
          placeholder="Any extra details"
        />
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

      <div className="flex items-center gap-2">
        <input
          {...register('isRecurring')}
          type="checkbox"
          id="isRecurring"
          className="rounded border-gray-300 text-brand-coral"
        />
        <label htmlFor="isRecurring" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
          This is a recurring income
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Saving...' : defaultValues ? 'Save changes' : 'Add income'}
        </button>
      </div>
    </form>
  );
};

export default IncomeForm;
