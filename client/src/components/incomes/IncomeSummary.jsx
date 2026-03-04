import { formatCurrency } from '../../utils/formatCurrency';
import { useAuth } from '../../context/AuthContext';

// summary cards at the top of the incomes page
const IncomeSummary = ({ incomes }) => {
  const { user } = useAuth();
  const currency = user?.currency || 'KES';

  const total = incomes.reduce((s, i) => s + i.amount, 0);
  const recurring = incomes.filter((i) => i.isRecurring).reduce((s, i) => s + i.amount, 0);
  const oneTime = total - recurring;

  // group by source for the breakdown
  const bySource = incomes.reduce((acc, i) => {
    acc[i.source] = (acc[i.source] || 0) + i.amount;
    return acc;
  }, {});

  const topSource = Object.entries(bySource).sort((a, b) => b[1] - a[1])[0];

  const cards = [
    { label: 'Total Income', value: formatCurrency(total, currency), color: 'text-brand-sage', bg: 'bg-brand-sage/10' },
    { label: 'Recurring', value: formatCurrency(recurring, currency), color: 'text-brand-blue', bg: 'bg-brand-blue/10' },
    { label: 'One-time', value: formatCurrency(oneTime, currency), color: 'text-brand-coral', bg: 'bg-brand-coral/10' },
    { label: 'Top Source', value: topSource ? topSource[0] : '—', color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => (
        <div key={card.label} className={`card p-4 ${card.bg}`}>
          <p className="text-xs text-gray-500 mb-1">{card.label}</p>
          <p className={`text-lg font-bold tabular ${card.color} truncate`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
};

export default IncomeSummary;
