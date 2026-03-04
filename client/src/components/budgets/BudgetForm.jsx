import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toInputDate } from '../../utils/dateHelpers';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  totalAmount: z.coerce.number().positive('Must be a positive amount'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
}).refine((d) => new Date(d.endDate) > new Date(d.startDate), {
  message: 'End date must be after start date',
  path: ['endDate'],
});

const BudgetForm = ({ onSubmit, onCancel, defaultValues, loading }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      totalAmount: '',
      startDate: '',
      endDate: '',
    },
  });

  // populate the form when editing an existing budget
  useEffect(() => {
    if (defaultValues) {
      reset({
        title: defaultValues.title || '',
        description: defaultValues.description || '',
        totalAmount: defaultValues.totalAmount || '',
        startDate: toInputDate(defaultValues.startDate),
        endDate: toInputDate(defaultValues.endDate),
      });
    }
  }, [defaultValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="label">Budget title</label>
        <input
          {...register('title')}
          className="input"
          placeholder="e.g. March 2026 Budget"
        />
        {errors.title && <p className="mt-1 text-xs text-brand-danger">{errors.title.message}</p>}
      </div>

      <div>
        <label className="label">Description <span className="text-gray-400">(optional)</span></label>
        <input
          {...register('description')}
          className="input"
          placeholder="What is this budget for?"
        />
      </div>

      <div>
        <label className="label">Total budget amount</label>
        <input
          {...register('totalAmount')}
          type="number"
          step="0.01"
          className="input"
          placeholder="0.00"
        />
        {errors.totalAmount && <p className="mt-1 text-xs text-brand-danger">{errors.totalAmount.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Start date</label>
          <input {...register('startDate')} type="date" className="input" />
          {errors.startDate && <p className="mt-1 text-xs text-brand-danger">{errors.startDate.message}</p>}
        </div>
        <div>
          <label className="label">End date</label>
          <input {...register('endDate')} type="date" className="input" />
          {errors.endDate && <p className="mt-1 text-xs text-brand-danger">{errors.endDate.message}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Saving...' : defaultValues ? 'Save changes' : 'Create budget'}
        </button>
      </div>
    </form>
  );
};

export default BudgetForm;
