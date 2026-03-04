import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCategories } from '../../hooks/useCategories';

const schema = z.object({
  categoryId: z.string().min(1, 'Please select a category'),
  amount: z.coerce.number().positive('Must be a positive amount'),
});

const AllocationForm = ({ onSubmit, onCancel, defaultValues, existingCategoryIds = [], loading }) => {
  const { categories } = useCategories('expense');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (defaultValues) {
      reset({ categoryId: defaultValues.categoryId, amount: defaultValues.amount });
    }
  }, [defaultValues, reset]);

  // filter out categories that already have an allocation (unless we're editing that one)
  const available = categories.filter(
    (c) => !existingCategoryIds.includes(c.id) || c.id === defaultValues?.categoryId
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="label">Category</label>
        <select {...register('categoryId')} className="input" disabled={!!defaultValues}>
          <option value="">Select a category</option>
          {available.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        {errors.categoryId && <p className="mt-1 text-xs text-brand-danger">{errors.categoryId.message}</p>}
      </div>

      <div>
        <label className="label">Allocated amount</label>
        <input
          {...register('amount')}
          type="number"
          step="0.01"
          className="input"
          placeholder="0.00"
        />
        {errors.amount && <p className="mt-1 text-xs text-brand-danger">{errors.amount.message}</p>}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Saving...' : defaultValues ? 'Update allocation' : 'Add allocation'}
        </button>
      </div>
    </form>
  );
};

export default AllocationForm;
