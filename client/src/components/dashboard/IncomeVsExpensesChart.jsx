import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '../../utils/formatCurrency';
import { useAuth } from '../../context/AuthContext';

// expects data shaped as [{ period: '2026-01', income: X, expenses: Y }]
const IncomeVsExpensesChart = ({ data = [] }) => {
  const { user } = useAuth();
  const currency = user?.currency || 'KES';

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-gray-400">
        Not enough data yet. Add transactions and income to see trends.
      </div>
    );
  }

  const tooltipFormatter = (value) => formatCurrency(value, currency);

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis dataKey="period" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatCurrency(v, currency)} width={80} />
        <Tooltip formatter={tooltipFormatter} />
        <Legend />
        <Line type="monotone" dataKey="Income" stroke="#81B29A" strokeWidth={2} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="Expenses" stroke="#E07A5F" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default IncomeVsExpensesChart;
