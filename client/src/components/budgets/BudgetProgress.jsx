// color the bar based on how much of the budget has been spent
const getProgressColor = (percent) => {
  if (percent >= 100) return 'bg-brand-danger';
  if (percent >= 80) return 'bg-brand-amber';
  return 'bg-brand-sage';
};

const BudgetProgress = ({ spent, total, showLabels = false, height = 'h-2' }) => {
  const percent = total > 0 ? Math.min((spent / total) * 100, 100) : 0;
  const color = getProgressColor((spent / total) * 100);

  return (
    <div>
      {showLabels && (
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Spent: {Math.round((spent / total) * 100)}%</span>
          <span>{Math.round(percent)}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-100 rounded-full overflow-hidden ${height}`}>
        <div
          className={`${height} rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

export default BudgetProgress;
