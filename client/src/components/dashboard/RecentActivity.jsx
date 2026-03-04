import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/dateHelpers';
import { useAuth } from '../../context/AuthContext';

// merges transactions and incomes into one sorted feed
const RecentActivity = ({ transactions = [], incomes = [] }) => {
  const { user } = useAuth();
  const currency = user?.currency || 'KES';

  const combined = [
    ...transactions.map((t) => ({ ...t, _type: 'expense' })),
    ...incomes.map((i) => ({ ...i, _type: 'income' })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);

  if (combined.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-500">No recent activity yet.</p>
        <div className="flex gap-3 justify-center mt-3">
          <Link to="/app/transactions" className="text-sm text-brand-coral hover:underline">Add transaction</Link>
          <span className="text-gray-300">|</span>
          <Link to="/app/incomes" className="text-sm text-brand-sage hover:underline">Add income</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {combined.map((item) => {
        const isIncome = item._type === 'income';
        return (
          <div
            key={`${item._type}-${item.id}`}
            className="flex items-center gap-3 py-2.5 border-b border-surface-border last:border-b-0"
          >
            {/* income vs expense indicator dot */}
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isIncome ? 'bg-brand-sage' : 'bg-brand-coral'}`} />

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {isIncome ? item.source : item.description}
              </p>
              <p className="text-xs text-gray-400">
                {formatDate(item.date, 'MMM d')}
                {item.category && ` · ${item.category.name}`}
              </p>
            </div>

            <span className={`text-sm font-semibold tabular flex-shrink-0 ${isIncome ? 'text-brand-sage' : 'text-gray-900 dark:text-white'}`}>
              {isIncome ? '+' : '-'}{formatCurrency(item.amount, currency)}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default RecentActivity;
