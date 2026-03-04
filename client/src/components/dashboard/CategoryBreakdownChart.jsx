import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '../../utils/formatCurrency';
import { useAuth } from '../../context/AuthContext';
import { CATEGORY_COLORS } from '../../utils/constants';

const CategoryBreakdownChart = ({ categories = [] }) => {
  const { user } = useAuth();
  const currency = user?.currency || 'KES';

  const data = categories
    .filter((c) => c.total > 0)
    .slice(0, 8) // cap at 8 slices so it stays readable
    .map((c, i) => ({
      name: c.category?.name || 'Uncategorized',
      value: c.total,
      color: c.category?.color || CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    }));

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-gray-400">
        No spending data yet to show a breakdown.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(v) => formatCurrency(v, currency)} />
        <Legend
          formatter={(value) => <span style={{ fontSize: 11 }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CategoryBreakdownChart;
