import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/common/Toast';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';

// pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import BudgetsPage from './pages/BudgetsPage';
import BudgetDetailPage from './pages/BudgetDetailPage';
import TransactionsPage from './pages/TransactionsPage';
import IncomesPage from './pages/IncomesPage';
import ReportsPage from './pages/ReportsPage';
import CategoriesPage from './pages/CategoriesPage';
import SettingsPage from './pages/SettingsPage';

const App = () => (
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/register" element={<RegisterPage />} />

            {/* protected app routes */}
            <Route
              path="/app/*"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Routes>
                      <Route path="dashboard" element={<DashboardPage />} />
                      <Route path="budgets" element={<BudgetsPage />} />
                      <Route path="budgets/:id" element={<BudgetDetailPage />} />
                      <Route path="transactions" element={<TransactionsPage />} />
                      <Route path="incomes" element={<IncomesPage />} />
                      <Route path="reports" element={<ReportsPage />} />
                      <Route path="categories" element={<CategoriesPage />} />
                      <Route path="settings" element={<SettingsPage />} />
                      {/* default app route */}
                      <Route path="*" element={<Navigate to="dashboard" replace />} />
                    </Routes>
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);

export default App;
