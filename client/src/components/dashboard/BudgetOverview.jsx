import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/dateHelpers';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../common/Spinner';

const getBarColor = (pct) => {
  if (pct >= 100) return 'bg-brand-danger';
  if (pct >= 80) return 'bg-brand-amber';
  return 'bg-brand-sage';
};

const BudgetOverview = ({ budgets, loading }) => {
  const { user } = useAuth();
  const currency = user?.currency || 'KES';

  if (loading) return <div className="flex justify-center py-10"><Spinner /></div>;

  const active = budgets.filter((b) => b.isActive);

  if (active.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-500 mb-3">No active budgets right now.</p>
        <Link to="/app/budgets" className="btn-primary text-sm">Create a budget</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {active.map((budget) => {
        const spent = budget.totalSpent || 0;
        const total = budget.totalAmount || 1;
        const pct = Math.min(Math.round((spent / total) * 100), 100);
        const remaining = total - spent;

        return (
          <Link
            key={budget.id}
            to={`/app/budgets/${budget.id}`}
            className="block hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-3 -mx-3 transition-colors"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium text-gray-900 dark:text-white truncate mr-4">
                {budget.title}
              </span>
              <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
                {formatDate(budget.endDate, 'MMM d')}
              </span>
            </div>

            <div className="w-full bg-gray-100 dark:bg-gray-600 rounded-full h-1.5 mb-1.5">
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ${getBarColor(pct)}`}
                style={{ width: `${pct}%` }}
              />
            </div>

            <div className="flex justify-between text-xs text-gray-500">
              <span className="tabular">{formatCurrency(spent, currency)} spent</span>
              <span className={`tabular font-medium ${remaining < 0 ? 'text-brand-danger' : 'text-gray-700 dark:text-gray-300'}`}>
                {remaining < 0
                  ? `${formatCurrency(Math.abs(remaining), currency)} over`
                  : `${formatCurrency(remaining, currency)} left`
                } ({pct}%)
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default BudgetOverview;
