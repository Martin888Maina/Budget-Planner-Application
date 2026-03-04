import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSummary } from '../hooks/useReports';
import { useBudgets } from '../hooks/useBudgets';
import { useBudgetPerformance } from '../hooks/useReports';
import { useTransactions } from '../hooks/useTransactions';
import { useIncomes } from '../hooks/useIncomes';
import { reportService } from '../services/reportService';
import SummaryCards from '../components/dashboard/SummaryCards';
import BudgetOverview from '../components/dashboard/BudgetOverview';
import RecentActivity from '../components/dashboard/RecentActivity';
import SpendingVsPlanChart from '../components/dashboard/SpendingVsPlanChart';
import IncomeVsExpensesChart from '../components/dashboard/IncomeVsExpensesChart';
import CategoryBreakdownChart from '../components/dashboard/CategoryBreakdownChart';
import Spinner from '../components/common/Spinner';

const DashboardPage = () => {
  const { user } = useAuth();
  const { data: summary, loading: summaryLoading } = useSummary();
  const { budgets, loading: budgetsLoading } = useBudgets();
  const { transactions } = useTransactions({ limit: 10, sortBy: 'date', sortOrder: 'desc' });
  const { incomes } = useIncomes({ limit: 10, sortBy: 'date', sortOrder: 'desc' });

  // pick the first active budget for the spending vs plan chart
  const activeBudgets = budgets.filter((b) => b.isActive);
  const [selectedBudgetId, setSelectedBudgetId] = useState(null);

  useEffect(() => {
    if (activeBudgets.length > 0 && !selectedBudgetId) {
      setSelectedBudgetId(activeBudgets[0].id);
    }
  }, [activeBudgets.length]);

  const { data: perfData, loading: perfLoading } = useBudgetPerformance(selectedBudgetId);

  // build income vs expenses trend — last 6 months merged from two separate trend calls
  const [trendData, setTrendData] = useState([]);
  const [trendLoading, setTrendLoading] = useState(true);

  useEffect(() => {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString();

    Promise.all([
      reportService.getSpendingTrends({ startDate, groupBy: 'month' }),
      reportService.getIncomeBySource({ startDate }),
    ])
      .then(([expRes, incRes]) => {
        const expTrends = expRes.data.data.trends || [];
        const incSources = incRes.data.data.sources || [];
        const totalIncome = incSources.reduce((s, i) => s + i.total, 0);

        // build the last 6 month labels
        const months = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          months.push(key);
        }

        const expMap = Object.fromEntries(expTrends.map((t) => [t.period, t.total]));

        // we only have one income data point for the whole period from the source endpoint,
        // so spread it evenly across months as a rough approximation for the trend line
        const avgIncome = months.length > 0 ? totalIncome / months.length : 0;

        setTrendData(
          months.map((m) => ({
            period: m,
            Expenses: expMap[m] || 0,
            Income: Math.round(avgIncome),
          }))
        );
      })
      .catch(() => setTrendData([]))
      .finally(() => setTrendLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* greeting */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Good {getGreeting()}, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Here is what is happening with your money this month.</p>
      </div>

      {/* summary cards */}
      <SummaryCards data={summary} loading={summaryLoading} />

      {/* middle row — budget overview + spending vs plan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* budget overview */}
        <div className="card p-5">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Active Budgets</h2>
          <BudgetOverview budgets={budgets} loading={budgetsLoading} />
        </div>

        {/* spending vs plan */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Spending vs Plan</h2>
            {activeBudgets.length > 1 && (
              <select
                className="input text-xs py-1 w-auto"
                value={selectedBudgetId || ''}
                onChange={(e) => setSelectedBudgetId(e.target.value)}
              >
                {activeBudgets.map((b) => (
                  <option key={b.id} value={b.id}>{b.title}</option>
                ))}
              </select>
            )}
          </div>
          {perfLoading ? (
            <div className="flex justify-center h-48 items-center"><Spinner /></div>
          ) : (
            <SpendingVsPlanChart allocations={perfData?.performance || []} />
          )}
        </div>
      </div>

      {/* bottom row — income vs expenses trend + category breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
            Income vs Expenses (6 months)
          </h2>
          {trendLoading ? (
            <div className="flex justify-center h-48 items-center"><Spinner /></div>
          ) : (
            <IncomeVsExpensesChart data={trendData} />
          )}
        </div>

        <div className="card p-5">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
            Spending by Category
          </h2>
          <CategoryBreakdownChart categories={summary?.topSpendingCategories || []} />
        </div>
      </div>

      {/* recent activity */}
      <div className="card p-5">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
        <RecentActivity transactions={transactions} incomes={incomes} />
      </div>
    </div>
  );
};

// simple time-based greeting — nothing fancy
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
};

export default DashboardPage;
