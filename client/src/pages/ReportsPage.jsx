import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, ResponsiveContainer,
} from 'recharts';
import { useBudgets } from '../hooks/useBudgets';
import { useSummary, useBudgetPerformance, useSpendingTrends, useIncomeBySource } from '../hooks/useReports';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/dateHelpers';
import { transactionService } from '../services/transactionService';
import { useToast } from '../components/common/Toast';
import Spinner from '../components/common/Spinner';

const ReportsPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const currency = user?.currency || 'KES';

  const { budgets } = useBudgets();
  const [selectedBudgetId, setSelectedBudgetId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [groupBy, setGroupBy] = useState('month');
  const [exporting, setExporting] = useState(false);

  const summaryParams = {};
  if (startDate) summaryParams.startDate = startDate;
  if (endDate) summaryParams.endDate = endDate;

  const { data: summary, loading: summaryLoading } = useSummary(summaryParams);
  const { data: perfData, loading: perfLoading } = useBudgetPerformance(selectedBudgetId);
  const { data: spendTrends, loading: trendsLoading } = useSpendingTrends({ ...summaryParams, groupBy });
  const { data: incomeSources, loading: incomeLoading } = useIncomeBySource(summaryParams);

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const res = await transactionService.exportCSV({
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'report-transactions.csv';
      link.click();
      window.URL.revokeObjectURL(url);
    } catch {
      addToast('Export failed', 'error');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
          <p className="text-sm text-gray-500 mt-0.5">Analyse your income and spending patterns.</p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={exporting}
          className="btn-secondary flex items-center gap-1.5 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {exporting ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>

      {/* filter controls */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="min-w-[130px]">
            <label className="label text-xs">From</label>
            <input type="date" className="input text-sm" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="min-w-[130px]">
            <label className="label text-xs">To</label>
            <input type="date" className="input text-sm" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div className="min-w-[180px]">
            <label className="label text-xs">Budget (for performance)</label>
            <select className="input text-sm" value={selectedBudgetId} onChange={(e) => setSelectedBudgetId(e.target.value)}>
              <option value="">Select a budget</option>
              {budgets.map((b) => (
                <option key={b.id} value={b.id}>{b.title}</option>
              ))}
            </select>
          </div>
          <div className="min-w-[120px]">
            <label className="label text-xs">Group trends by</label>
            <select className="input text-sm" value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* monthly summary cards */}
      {summaryLoading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Income', value: formatCurrency(summary.totalIncome, currency), color: 'text-brand-sage' },
            { label: 'Total Expenses', value: formatCurrency(summary.totalExpenses, currency), color: 'text-brand-coral' },
            { label: 'Net Savings', value: formatCurrency(summary.netSavings, currency), color: summary.netSavings >= 0 ? 'text-brand-blue' : 'text-brand-danger' },
            { label: 'Transactions', value: summary.transactionCount, color: 'text-gray-700 dark:text-gray-200' },
          ].map((item) => (
            <div key={item.label} className="card p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">{item.label}</p>
              <p className={`text-lg font-bold tabular ${item.color}`}>{item.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* budget performance table */}
      {selectedBudgetId && (
        <div className="card p-5">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Budget Performance</h2>
          {perfLoading ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : perfData ? (
            <>
              <div className="flex flex-wrap gap-4 text-sm mb-4">
                <span>Budget: <strong>{perfData.budget.title}</strong></span>
                <span>{formatDate(perfData.budget.startDate)} – {formatDate(perfData.budget.endDate)}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-surface-border">
                    <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                      <th className="pb-2 font-medium">Category</th>
                      <th className="pb-2 font-medium text-right">Allocated</th>
                      <th className="pb-2 font-medium text-right">Actual</th>
                      <th className="pb-2 font-medium text-right">Variance</th>
                      <th className="pb-2 font-medium text-right">Used %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border">
                    {perfData.performance.map((row) => (
                      <tr key={row.categoryId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="py-2.5 font-medium text-gray-900 dark:text-white">
                          {row.category?.name || '—'}
                        </td>
                        <td className="py-2.5 text-right tabular">{formatCurrency(row.allocated, currency)}</td>
                        <td className="py-2.5 text-right tabular">{formatCurrency(row.actual, currency)}</td>
                        <td className={`py-2.5 text-right tabular font-medium ${row.variance > 0 ? 'text-brand-danger' : 'text-brand-sage'}`}>
                          {row.variance > 0 ? '+' : ''}{formatCurrency(row.variance, currency)}
                        </td>
                        <td className="py-2.5 text-right">
                          <span className={`badge ${
                            row.percentUsed >= 100 ? 'bg-brand-danger/20 text-brand-danger' :
                            row.percentUsed >= 80 ? 'bg-brand-amber/20 text-yellow-700' :
                            'bg-brand-sage/20 text-brand-dark'
                          }`}>
                            {row.percentUsed}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t-2 border-surface-border">
                    <tr className="font-semibold">
                      <td className="pt-2.5 text-gray-900 dark:text-white">Total</td>
                      <td className="pt-2.5 text-right tabular">{formatCurrency(perfData.totalAllocated, currency)}</td>
                      <td className="pt-2.5 text-right tabular">{formatCurrency(perfData.totalActual, currency)}</td>
                      <td className={`pt-2.5 text-right tabular ${perfData.totalActual > perfData.totalAllocated ? 'text-brand-danger' : 'text-brand-sage'}`}>
                        {formatCurrency(perfData.totalActual - perfData.totalAllocated, currency)}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500 text-center py-6">No performance data for this budget yet.</p>
          )}
        </div>
      )}

      {/* spending trends chart */}
      <div className="card p-5">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Spending Trends</h2>
        {trendsLoading ? (
          <div className="flex justify-center h-48 items-center"><Spinner /></div>
        ) : spendTrends.length === 0 ? (
          <div className="flex justify-center h-48 items-center text-sm text-gray-400">
            No spending data in this period.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={spendTrends} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="period" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatCurrency(v, currency)} width={80} />
              <Tooltip formatter={(v) => formatCurrency(v, currency)} />
              <Line type="monotone" dataKey="total" stroke="#E07A5F" strokeWidth={2} name="Expenses" dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* income by source chart */}
      <div className="card p-5">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Income by Source</h2>
        {incomeLoading ? (
          <div className="flex justify-center h-48 items-center"><Spinner /></div>
        ) : incomeSources.length === 0 ? (
          <div className="flex justify-center h-48 items-center text-sm text-gray-400">
            No income data in this period.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={incomeSources} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="source" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatCurrency(v, currency)} width={80} />
              <Tooltip formatter={(v) => formatCurrency(v, currency)} />
              <Bar dataKey="total" fill="#81B29A" name="Income" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* top spending categories table */}
      {summary?.topSpendingCategories?.length > 0 && (
        <div className="card p-5">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Top Spending Categories</h2>
          <div className="space-y-2">
            {summary.topSpendingCategories.map((item, i) => {
              const maxTotal = summary.topSpendingCategories[0].total;
              const pct = maxTotal > 0 ? Math.round((item.total / maxTotal) * 100) : 0;
              return (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.category?.color || '#A8A8A8' }}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300 w-40 truncate">
                    {item.category?.name || 'Uncategorized'}
                  </span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className="h-2 bg-brand-coral rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-sm font-medium tabular text-gray-900 dark:text-white w-28 text-right">
                    {formatCurrency(item.total, currency)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
