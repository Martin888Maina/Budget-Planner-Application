import { formatCurrency } from '../../utils/formatCurrency';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../common/Spinner';

const cards = (data, currency) => [
  {
    label: 'Total Income',
    value: formatCurrency(data?.totalIncome || 0, currency),
    sub: 'This month',
    color: 'text-brand-sage',
    bg: 'bg-brand-sage/10',
    border: 'border-brand-sage/30',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M7 11l5-5m0 0l5 5m-5-5v12" />
      </svg>
    ),
  },
  {
    label: 'Total Expenses',
    value: formatCurrency(data?.totalExpenses || 0, currency),
    sub: 'This month',
    color: 'text-brand-coral',
    bg: 'bg-brand-coral/10',
    border: 'border-brand-coral/30',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M17 13l-5 5m0 0l-5-5m5 5V6" />
      </svg>
    ),
  },
  {
    label: 'Net Balance',
    value: formatCurrency(data?.netSavings || 0, currency),
    sub: 'Income minus expenses',
    color: (data?.netSavings || 0) >= 0 ? 'text-brand-blue' : 'text-brand-danger',
    bg: 'bg-brand-blue/10',
    border: 'border-brand-blue/30',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
      </svg>
    ),
  },
  {
    label: 'Active Budgets',
    value: data?.activeBudgets ?? 0,
    sub: 'Currently running',
    color: 'text-brand-amber',
    bg: 'bg-brand-amber/10',
    border: 'border-brand-amber/30',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
];

const SummaryCards = ({ data, loading }) => {
  const { user } = useAuth();
  const currency = user?.currency || 'KES';

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card p-5 flex items-center justify-center h-28">
            <Spinner size="sm" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards(data, currency).map((card) => (
        <div key={card.label} className={`card p-5 border ${card.border} ${card.bg}`}>
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs font-medium text-gray-500">{card.label}</p>
            <div className={`${card.color} opacity-70`}>{card.icon}</div>
          </div>
          <p className={`text-xl font-bold tabular ${card.color}`}>{card.value}</p>
          <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
