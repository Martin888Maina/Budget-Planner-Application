import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/dateHelpers';
import BudgetProgress from './BudgetProgress';
import { useAuth } from '../../context/AuthContext';

const BudgetCard = ({ budget, onEdit, onDelete, onToggleStatus }) => {
  const { user } = useAuth();
  const currency = user?.currency || 'KES';

  const spent = budget.totalSpent || 0;
  const total = budget.totalAmount || 0;
  const remaining = total - spent;
  const percent = total > 0 ? Math.round((spent / total) * 100) : 0;
  const isOverspent = spent > total;

  return (
    <div className="card p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
      {/* header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link
            to={`/app/budgets/${budget.id}`}
            className="font-semibold text-gray-900 hover:text-brand-coral transition-colors line-clamp-1"
          >
            {budget.title}
          </Link>
          <p className="text-xs text-gray-500 mt-0.5">
            {formatDate(budget.startDate, 'MMM d')} – {formatDate(budget.endDate, 'MMM d, yyyy')}
          </p>
        </div>

        {/* status badge */}
        <span className={`badge flex-shrink-0 ${
          budget.isActive ? 'bg-brand-sage/20 text-brand-dark' : 'bg-gray-100 text-gray-500'
        }`}>
          {budget.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* amounts */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Total</p>
          <p className="text-sm font-semibold text-gray-900 tabular">{formatCurrency(total, currency)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Spent</p>
          <p className={`text-sm font-semibold tabular ${isOverspent ? 'text-brand-danger' : 'text-gray-900'}`}>
            {formatCurrency(spent, currency)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Remaining</p>
          <p className={`text-sm font-semibold tabular ${remaining < 0 ? 'text-brand-danger' : 'text-brand-sage'}`}>
            {formatCurrency(Math.abs(remaining), currency)}
          </p>
        </div>
      </div>

      {/* progress bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{isOverspent ? 'Overspent!' : `${percent}% used`}</span>
          <span>{percent}%</span>
        </div>
        <BudgetProgress spent={spent} total={total} />
      </div>

      {/* action buttons */}
      <div className="flex items-center gap-2 pt-1 border-t border-surface-border">
        <Link
          to={`/app/budgets/${budget.id}`}
          className="flex-1 text-center text-xs text-brand-blue hover:underline font-medium py-1"
        >
          View details
        </Link>
        <button
          onClick={() => onEdit(budget)}
          className="flex-1 text-xs text-gray-600 hover:text-gray-900 font-medium py-1 hover:bg-gray-50 rounded-lg transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => onToggleStatus(budget)}
          className="flex-1 text-xs text-gray-600 hover:text-gray-900 font-medium py-1 hover:bg-gray-50 rounded-lg transition-colors"
        >
          {budget.isActive ? 'Deactivate' : 'Activate'}
        </button>
        <button
          onClick={() => onDelete(budget)}
          className="flex-1 text-xs text-brand-danger hover:text-red-700 font-medium py-1 hover:bg-red-50 rounded-lg transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default BudgetCard;
