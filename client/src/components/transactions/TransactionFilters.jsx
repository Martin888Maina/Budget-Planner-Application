import { useCategories } from '../../hooks/useCategories';
import { useBudgets } from '../../hooks/useBudgets';

const TransactionFilters = ({ filters, onChange, onClear }) => {
  const { categories } = useCategories('expense');
  const { budgets } = useBudgets();

  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  const hasFilters = Object.values(filters).some((v) => v !== '' && v !== undefined);

  return (
    <div className="card p-4 mb-4">
      <div className="flex flex-wrap gap-3 items-end">
        {/* text search */}
        <div className="flex-1 min-w-[180px]">
          <label className="label text-xs">Search</label>
          <input
            className="input text-sm"
            placeholder="Search description..."
            value={filters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
          />
        </div>

        {/* category */}
        <div className="min-w-[150px]">
          <label className="label text-xs">Category</label>
          <select
            className="input text-sm"
            value={filters.categoryId || ''}
            onChange={(e) => handleChange('categoryId', e.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* budget */}
        <div className="min-w-[150px]">
          <label className="label text-xs">Budget</label>
          <select
            className="input text-sm"
            value={filters.budgetId || ''}
            onChange={(e) => handleChange('budgetId', e.target.value)}
          >
            <option value="">All budgets</option>
            {budgets.map((b) => (
              <option key={b.id} value={b.id}>{b.title}</option>
            ))}
          </select>
        </div>

        {/* date range */}
        <div className="min-w-[130px]">
          <label className="label text-xs">From</label>
          <input
            type="date"
            className="input text-sm"
            value={filters.startDate || ''}
            onChange={(e) => handleChange('startDate', e.target.value)}
          />
        </div>
        <div className="min-w-[130px]">
          <label className="label text-xs">To</label>
          <input
            type="date"
            className="input text-sm"
            value={filters.endDate || ''}
            onChange={(e) => handleChange('endDate', e.target.value)}
          />
        </div>

        {hasFilters && (
          <button onClick={onClear} className="btn-secondary text-sm py-2">
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
};

export default TransactionFilters;
