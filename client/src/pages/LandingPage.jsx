import { Link } from 'react-router-dom';

const features = [
  {
    title: 'Multiple Budgets',
    description: 'Create separate budgets for different goals — monthly expenses, a vacation, a wedding, or any project.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    title: 'Category Allocations',
    description: 'Divide your budget across spending categories and get visual progress bars showing how each is tracking.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
  },
  {
    title: 'Income Tracking',
    description: 'Record your income sources alongside expenses. See the full picture of what comes in and what goes out.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Visual Reports',
    description: 'Charts and analytics that show spending trends, budget performance, and category breakdowns at a glance.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    title: 'Overspend Alerts',
    description: 'Color-coded progress bars warn you when you are approaching or exceeding an allocation — before it is too late.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  {
    title: 'CSV Export',
    description: 'Export your transactions and reports to CSV for further analysis in a spreadsheet.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
];

const LandingPage = () => (
  <div className="min-h-screen bg-surface-bg">
    {/* top nav */}
    <nav className="bg-white border-b border-surface-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-coral rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="font-semibold text-gray-900">Budget Planner</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/auth/login" className="btn-secondary text-sm py-1.5">
            Sign in
          </Link>
          <Link to="/auth/register" className="btn-primary text-sm py-1.5">
            Get started
          </Link>
        </div>
      </div>
    </nav>

    {/* hero */}
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
      <div className="inline-flex items-center gap-2 bg-brand-coral/10 text-brand-coral text-sm font-medium px-3 py-1 rounded-full mb-6">
        Personal finance planning
      </div>
      <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-6">
        Plan your money.<br />Track your progress.<br />
        <span className="text-brand-coral">Stay on budget.</span>
      </h1>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
        Budget Planner helps you build spending plans, allocate money across categories,
        and monitor how closely you are sticking to your goals — all in one place.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/auth/register" className="btn-primary px-8 py-3 text-base">
          Create free account
        </Link>
        <Link to="/auth/login" className="btn-secondary px-8 py-3 text-base">
          Sign in
        </Link>
      </div>
    </section>

    {/* features */}
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Everything you need to budget well</h2>
        <p className="text-gray-600 max-w-xl mx-auto">
          Built around the idea that a good budget is a plan, not just a record of what you spent.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <div key={feature.title} className="card p-6 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-brand-coral/10 text-brand-coral rounded-xl flex items-center justify-center mb-4">
              {feature.icon}
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>

    {/* CTA banner */}
    <section className="bg-brand-coral">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to take control of your budget?</h2>
        <p className="text-white/80 mb-8 max-w-md mx-auto">
          Create your account in seconds and start building your first budget today.
        </p>
        <Link
          to="/auth/register"
          className="inline-block bg-white text-brand-coral font-semibold px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Get started for free
        </Link>
      </div>
    </section>

    {/* footer */}
    <footer className="border-t border-surface-border py-8 text-center text-sm text-gray-500">
      <p>Budget Planner — personal finance planning application</p>
    </footer>
  </div>
);

export default LandingPage;
