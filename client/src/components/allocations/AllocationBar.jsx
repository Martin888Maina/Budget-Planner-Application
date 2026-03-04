import { formatCurrency } from '../../utils/formatCurrency';
import { useAuth } from '../../context/AuthContext';

// color thresholds for the allocation progress bar
const getBarColor = (percent) => {
  if (percent >= 100) return { bar: 'bg-brand-danger', text: 'text-brand-danger', label: 'Overspent' };
  if (percent >= 80) return { bar: 'bg-brand-amber', text: 'text-yellow-700', label: 'Near limit' };
  return { bar: 'bg-brand-sage', text: 'text-brand-dark', label: 'On track' };
};

const AllocationBar = ({ allocation, onEdit, onDelete }) => {
  const { user } = useAuth();
  const currency = user?.currency || 'KES';

  const { amount, spent = 0, remaining = 0, category } = allocation;
  const percent = amount > 0 ? (spent / amount) * 100 : 0;
  const { bar, text, label } = getBarColor(percent);
  const cappedPercent = Math.min(percent, 100);

  return (
    <div className="py-3 border-b border-surface-border last:border-b-0">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          {/* color dot from the category */}
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: category?.color || '#A8A8A8' }}
          />
          <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {category?.name || 'Unknown'}
          </span>
          <span className={`text-xs font-medium ${text} hidden sm:block`}>{label}</span>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-gray-500">
              <span className="tabular font-medium text-gray-900 dark:text-white">{formatCurrency(spent, currency)}</span>
              {' / '}
              {formatCurrency(amount, currency)}
            </p>
            <p className={`text-xs font-medium tabular ${remaining < 0 ? 'text-brand-danger' : 'text-gray-500'}`}>
              {remaining < 0 ? `${formatCurrency(Math.abs(remaining), currency)} over` : `${formatCurrency(remaining, currency)} left`}
            </p>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => onEdit(allocation)}
              className="text-xs text-gray-500 hover:text-brand-blue px-2 py-1 rounded hover:bg-gray-100 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(allocation)}
              className="text-xs text-gray-500 hover:text-brand-danger px-2 py-1 rounded hover:bg-red-50 transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      </div>

      {/* progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${bar}`}
          style={{ width: `${cappedPercent}%` }}
        />
      </div>

      {/* mobile amounts row */}
      <div className="flex justify-between text-xs text-gray-500 mt-1 sm:hidden">
        <span className="tabular">{formatCurrency(spent, currency)} spent</span>
        <span className="tabular">{formatCurrency(amount, currency)} allocated</span>
      </div>
    </div>
  );
};

export default AllocationBar;
