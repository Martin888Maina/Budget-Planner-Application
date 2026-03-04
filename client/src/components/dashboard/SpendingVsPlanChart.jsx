import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '../../utils/formatCurrency';
import { useAuth } from '../../context/AuthContext';

const SpendingVsPlanChart = ({ allocations = [] }) => {
  const { user } = useAuth();
  const currency = user?.currency || 'KES';

  // only show categories that have either an allocation or actual spending
  const chartData = allocations
    .filter((a) => a.allocated > 0 || a.actual > 0)
    .map((a) => ({
      name: a.category?.name?.split(' ')[0] || 'Other', // shorten label for readability
      Allocated: a.allocated,
      Actual: a.actual,
    }));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-gray-400">
        No allocation data yet. Add allocations to a budget to see this chart.
      </div>
    );
  }

  const tooltipFormatter = (value) => formatCurrency(value, currency);

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatCurrency(v, currency)} width={80} />
        <Tooltip formatter={tooltipFormatter} />
        <Legend />
        {/* muted bar for the plan, solid for actual */}
        <Bar dataKey="Allocated" fill="#81B29A" fillOpacity={0.5} radius={[3, 3, 0, 0]} />
        <Bar dataKey="Actual" fill="#E07A5F" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default SpendingVsPlanChart;
