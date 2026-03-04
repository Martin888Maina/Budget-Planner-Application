import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/common/Toast';
import { authService } from '../services/authService';
import { CURRENCIES } from '../utils/constants';
import Modal from '../components/common/Modal';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  currency: z.string().min(1),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'Must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// a reusable section card
const Section = ({ title, description, children }) => (
  <div className="card p-6">
    <div className="mb-5">
      <h2 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h2>
      {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
    </div>
    {children}
  </div>
);

const SettingsPage = () => {
  const { user, updateUser, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      currency: user?.currency || 'KES',
    },
  });

  const passwordForm = useForm({ resolver: zodResolver(passwordSchema) });

  const handleProfileSave = async (data) => {
    setSavingProfile(true);
    try {
      const res = await authService.updateProfile(data);
      updateUser(res.data.data.user);
      addToast('Profile updated!', 'success');
    } catch (err) {
      addToast(err.response?.data?.error?.message || 'Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (data) => {
    setSavingPassword(true);
    try {
      await authService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      addToast('Password changed successfully!', 'success');
      passwordForm.reset();
    } catch (err) {
      addToast(err.response?.data?.error?.message || 'Failed to change password', 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await authService.deleteAccount();
      await logout();
      navigate('/');
    } catch (err) {
      addToast(err.response?.data?.error?.message || 'Failed to delete account', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your account and preferences.</p>
      </div>

      {/* profile */}
      <Section title="Profile" description="Update your name, email, and preferred currency.">
        <form onSubmit={profileForm.handleSubmit(handleProfileSave)} className="space-y-4">
          <div>
            <label className="label">Full name</label>
            <input {...profileForm.register('name')} className="input" />
            {profileForm.formState.errors.name && (
              <p className="mt-1 text-xs text-brand-danger">{profileForm.formState.errors.name.message}</p>
            )}
          </div>
          <div>
            <label className="label">Email address</label>
            <input {...profileForm.register('email')} type="email" className="input" />
            {profileForm.formState.errors.email && (
              <p className="mt-1 text-xs text-brand-danger">{profileForm.formState.errors.email.message}</p>
            )}
          </div>
          <div>
            <label className="label">Currency</label>
            <select {...profileForm.register('currency')} className="input">
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-400">Affects how amounts are displayed throughout the app.</p>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={savingProfile} className="btn-primary">
              {savingProfile ? 'Saving...' : 'Save profile'}
            </button>
          </div>
        </form>
      </Section>

      {/* theme */}
      <Section title="Appearance" description="Toggle between light and dark mode.">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Dark mode</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Currently using {isDark ? 'dark' : 'light'} mode
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-coral focus:ring-offset-2 ${
              isDark ? 'bg-brand-coral' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                isDark ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </Section>

      {/* change password */}
      <Section title="Change Password" description="Use a strong password you don't use elsewhere.">
        <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-4">
          <div>
            <label className="label">Current password</label>
            <input {...passwordForm.register('currentPassword')} type="password" className="input" placeholder="••••••••" />
            {passwordForm.formState.errors.currentPassword && (
              <p className="mt-1 text-xs text-brand-danger">{passwordForm.formState.errors.currentPassword.message}</p>
            )}
          </div>
          <div>
            <label className="label">New password</label>
            <input {...passwordForm.register('newPassword')} type="password" className="input" placeholder="At least 6 characters" />
            {passwordForm.formState.errors.newPassword && (
              <p className="mt-1 text-xs text-brand-danger">{passwordForm.formState.errors.newPassword.message}</p>
            )}
          </div>
          <div>
            <label className="label">Confirm new password</label>
            <input {...passwordForm.register('confirmPassword')} type="password" className="input" placeholder="••••••••" />
            {passwordForm.formState.errors.confirmPassword && (
              <p className="mt-1 text-xs text-brand-danger">{passwordForm.formState.errors.confirmPassword.message}</p>
            )}
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={savingPassword} className="btn-primary">
              {savingPassword ? 'Updating...' : 'Update password'}
            </button>
          </div>
        </form>
      </Section>

      {/* danger zone */}
      <Section title="Danger Zone" description="Permanent actions that cannot be reversed.">
        <div className="border border-brand-danger/30 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Delete account</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Permanently removes your account and all associated data.
            </p>
          </div>
          <button
            onClick={() => setDeleteOpen(true)}
            className="btn-danger text-sm flex-shrink-0"
          >
            Delete account
          </button>
        </div>
      </Section>

      {/* delete confirmation modal */}
      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete account" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            This will permanently delete your account, all budgets, transactions, and income records.
            <strong className="text-gray-900 dark:text-white"> This cannot be undone.</strong>
          </p>
          <div>
            <label className="label">Type <strong>DELETE</strong> to confirm</label>
            <input
              className="input"
              placeholder="DELETE"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => { setDeleteOpen(false); setDeleteConfirmText(''); }} className="btn-secondary">
              Cancel
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== 'DELETE' || deleting}
              className="btn-danger disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {deleting ? 'Deleting...' : 'Delete my account'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SettingsPage;
