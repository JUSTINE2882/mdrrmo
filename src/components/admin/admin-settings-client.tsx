'use client';

import { tabs } from '@/data/volunteer/setting-tabs';
import {
  adminChangePasswordSchema,
  adminProfileSchema,
  type AdminChangePasswordInput,
  type AdminProfileInput,
} from '@/lib/validation/schema';
import { AdminUser } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  Eye,
  EyeOff,
  Key,
  Mail,
  Save,
  Shield,
  Upload,
} from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { ShieldSpinLoader } from '../custom/loading';

export function AdminSettingsClient({ user }: { user: AdminUser }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);

  const [notifications, setNotifications] = useState({
    newApplication: true,
    applicationDecision: true,
    systemAlerts: true,
    weeklyReport: false,
    emailNotif: true,
    smsNotif: false,
  });

  const [org, setOrg] = useState({
    name: 'MDRRMO Mansalay',
    address: 'Municipal Hall, Mansalay',
    email: 'support@mdrrmom.com',
    phone: '042-123-4567',
    website: 'www.mdrrmom.com',
  });

  const profileForm = useForm<AdminProfileInput>({
    resolver: zodResolver(adminProfileSchema),
    defaultValues: {
      displayName: user.displayName,
      email: user.email ?? '',
    },
  });

  const passwordForm = useForm<AdminChangePasswordInput>({
    resolver: zodResolver(adminChangePasswordSchema),
  });

  const onProfileSave = async (data: AdminProfileInput) => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/update-admin-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error);
      }

      toast.success('Profile updated successfully');
      profileForm.reset();
      setIsSaving(false);
    } catch (error) {
      toast.error(`${error}`);
    }
  };

  const onPasswordChange = async (data: AdminChangePasswordInput) => {
    setIsChangingPass(true);
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? 'Failed to change password');
        return;
      }
      toast.success('Password changed successfully');
      passwordForm.reset();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsChangingPass(false);
    }
  };

  const toggleNotif = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="mx-auto w-full space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Manage your admin account and system preferences
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <nav className="shrink-0 lg:w-56">
          <div className="rounded-2xl border border-gray-100 bg-white p-2 shadow-sm">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex w-full items-center hover:cursor-pointer gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <tab.icon className="h-4 w-4 shrink-0" />
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        <div className="flex-1 overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
          {activeTab === 'profile' && (
            <form onSubmit={profileForm.handleSubmit(onProfileSave)}>
              <div className="border-b border-gray-100 px-6 py-5">
                <h2 className="font-bold text-gray-900">Profile Information</h2>
                <p className="mt-0.5 text-sm text-gray-500">
                  Update your admin account details
                </p>
              </div>
              <div className="space-y-6 p-6">
                {/* Avatar */}
                <div className="flex items-center gap-5">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-orange-400 to-orange-600 text-2xl font-bold text-white">
                    {user.displayName.charAt(0)}
                  </div>
                  <div>
                    <button
                      type="button"
                      className="flex items-center hover:cursor-pointer gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Upload className="h-4 w-4" /> Upload Photo
                    </button>
                    <p className="mt-1.5 text-xs text-gray-400">
                      JPG or PNG, max 2 MB
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs text-gray-400">Username</p>
                    <p className="mt-0.5 font-mono text-sm font-semibold text-gray-800">
                      {user.username}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-400">
                      Cannot be changed
                    </p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs text-gray-400">Role</p>
                    <p className="mt-0.5 text-sm font-semibold capitalize text-gray-800">
                      {user.role}
                    </p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs text-gray-400">Last Login</p>
                    <p className="mt-0.5 text-sm font-semibold text-gray-800">
                      {user.lastLoginAt
                        ? new Date(user.lastLoginAt).toLocaleString('en-PH', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })
                        : '—'}
                    </p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs text-gray-400">Account Created</p>
                    <p className="mt-0.5 text-sm font-semibold text-gray-800">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString('en-PH', {
                            dateStyle: 'long',
                          })
                        : '—'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-sm font-medium text-gray-700">
                      Display Name
                    </label>
                    <input
                      {...profileForm.register('displayName')}
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    {profileForm.formState.errors.displayName && (
                      <p className="flex items-center gap-1 text-xs text-red-600">
                        <AlertCircle className="h-3 w-3" />
                        {profileForm.formState.errors.displayName.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" /> Email Address
                    </label>
                    <input
                      {...profileForm.register('email')}
                      type="email"
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    {profileForm.formState.errors.email && (
                      <p className="flex items-center gap-1 text-xs text-red-600">
                        <AlertCircle className="h-3 w-3" />
                        {profileForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end border-t border-gray-100 px-6 py-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center hover:cursor-pointer gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-200 hover:bg-orange-600 disabled:opacity-70 transition-colors"
                >
                  {isSaving ? (
                    <ShieldSpinLoader size={20} color="text-white" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'security' && (
            <form onSubmit={passwordForm.handleSubmit(onPasswordChange)}>
              <div className="border-b border-gray-100 px-6 py-5">
                <h2 className="font-bold text-gray-900">Security Settings</h2>
                <p className="mt-0.5 text-sm text-gray-500">
                  Manage your admin password
                </p>
              </div>
              <div className="space-y-5 p-6">
                <div className="flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 p-4">
                  <Key className="h-5 w-5 shrink-0 text-orange-600" />
                  <p className="text-sm text-orange-800">
                    <strong>Important:</strong> If you are using the default
                    password (Admin@123456), change it now.
                  </p>
                </div>

                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <Shield className="h-4 w-4 text-orange-500" /> Change Password
                </h3>

                {[
                  {
                    field: 'currentPassword' as const,
                    label: 'Current Password',
                    show: showOld,
                    toggle: () => setShowOld(!showOld),
                  },
                  {
                    field: 'newPassword' as const,
                    label: 'New Password',
                    show: showNew,
                    toggle: () => setShowNew(!showNew),
                  },
                  {
                    field: 'confirmPassword' as const,
                    label: 'Confirm New Password',
                    show: showConfirm,
                    toggle: () => setShowConfirm(!showConfirm),
                  },
                ].map((f) => (
                  <div key={f.field} className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      {f.label}
                    </label>
                    <div className="relative">
                      <input
                        {...passwordForm.register(f.field)}
                        type={f.show ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 pr-12 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <button
                        type="button"
                        onClick={f.toggle}
                        className="absolute right-4 hover:cursor-pointer top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {f.show ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {passwordForm.formState.errors[f.field] && (
                      <p className="flex items-center gap-1 text-xs text-red-600">
                        <AlertCircle className="h-3 w-3" />
                        {passwordForm.formState.errors[f.field]?.message}
                      </p>
                    )}
                  </div>
                ))}

                <div className="rounded-xl bg-gray-50 p-4 text-xs text-gray-500">
                  <p className="font-semibold text-gray-700 mb-1">
                    Password requirements:
                  </p>
                  <ul className="space-y-0.5">
                    <li>• At least 8 characters</li>
                    <li>• At least one uppercase letter</li>
                    <li>• At least one number</li>
                  </ul>
                </div>
              </div>
              <div className="flex items-center justify-end border-t border-gray-100 px-6 py-4">
                <button
                  type="submit"
                  disabled={isChangingPass}
                  className="flex items-center gap-2 rounded-lg hover:cursor-pointer bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-200 hover:bg-orange-600 disabled:opacity-70 transition-colors"
                >
                  {isChangingPass ? (
                    <ShieldSpinLoader size={20} color="text-white" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {isChangingPass ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'notifications' && (
            <div>
              <div className="border-b border-gray-100 px-6 py-5">
                <h2 className="font-bold text-gray-900">
                  Notification Preferences
                </h2>
                <p className="mt-0.5 text-sm text-gray-500">
                  Choose what alerts you receive
                </p>
              </div>
              <div className="space-y-6 p-6">
                {[
                  {
                    section: 'Application Alerts',
                    items: [
                      {
                        key: 'newApplication' as const,
                        label: 'New volunteer application received',
                      },
                      {
                        key: 'applicationDecision' as const,
                        label: 'Application status changes',
                      },
                    ],
                  },
                  {
                    section: 'System Alerts',
                    items: [
                      {
                        key: 'systemAlerts' as const,
                        label: 'System alerts and maintenance',
                      },
                      {
                        key: 'weeklyReport' as const,
                        label: 'Weekly summary reports',
                      },
                    ],
                  },
                ].map((group) => (
                  <div key={group.section}>
                    <h3 className="mb-3 text-sm font-semibold text-gray-900">
                      {group.section}
                    </h3>
                    <div className="space-y-2">
                      {group.items.map((item) => (
                        <div
                          key={item.key}
                          className="flex items-center justify-between rounded-lg p-3 hover:bg-gray-50 transition-colors"
                        >
                          <span className="text-sm text-gray-700">
                            {item.label}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleNotif(item.key)}
                            className={`relative h-6 w-11 rounded-full hover:cursor-pointer transition-colors ${notifications[item.key] ? 'bg-orange-500' : 'bg-gray-300'}`}
                          >
                            <span
                              className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${notifications[item.key] ? 'translate-x-' : '-translate-x-4'}`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div>
                  <h3 className="mb-3 text-sm font-semibold text-gray-900">
                    Delivery Channels
                  </h3>
                  <div className="space-y-2">
                    {[
                      {
                        key: 'emailNotif' as const,
                        label: 'Email notifications',
                        desc: user.email ?? 'No email set',
                      },
                      {
                        key: 'smsNotif' as const,
                        label: 'SMS notifications',
                        desc: 'Not configured',
                      },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between rounded-lg p-3 hover:bg-gray-50 transition-colors"
                      >
                        <div>
                          <p className="text-sm text-gray-700">{item.label}</p>
                          <p className="text-xs text-gray-400">{item.desc}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleNotif(item.key)}
                          className={`relative h-6 w-11 rounded-full transition-colors ${notifications[item.key] ? 'bg-orange-500' : 'bg-gray-300'}`}
                        >
                          <span
                            className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${notifications[item.key] ? 'translate-x-0' : '-translate-x-4'}`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end border-t border-gray-100 px-6 py-4">
                <button
                  onClick={() =>
                    toast.success('Notification preferences saved')
                  }
                  className="flex items-center gap-2 rounded-lg hover:cursor-pointer bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-200 hover:bg-orange-600 transition-colors"
                >
                  <Save className="h-4 w-4" /> Save Preferences
                </button>
              </div>
            </div>
          )}

          {activeTab === 'organization' && (
            <div>
              <div className="border-b border-gray-100 px-6 py-5">
                <h2 className="font-bold text-gray-900">
                  Organization Details
                </h2>
                <p className="mt-0.5 text-sm text-gray-500">
                  Update MDRRMO organization information
                </p>
              </div>
              <div className="space-y-4 p-6">
                {[
                  {
                    label: 'Organization Name',
                    key: 'name',
                    placeholder: 'MDRRMO Mansalay',
                  },
                  {
                    label: 'Office Address',
                    key: 'address',
                    placeholder: 'Municipal Hall, Mansalay',
                  },
                  {
                    label: 'Official Email',
                    key: 'email',
                    placeholder: 'support@mdrrmom.com',
                  },
                  {
                    label: 'Phone Number',
                    key: 'phone',
                    placeholder: '042-123-4567',
                  },
                  {
                    label: 'Website',
                    key: 'website',
                    placeholder: 'www.mdrrmom.com',
                  },
                ].map((f) => (
                  <div key={f.key} className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      {f.label}
                    </label>
                    <input
                      value={org[f.key as keyof typeof org]}
                      onChange={(e) =>
                        setOrg({ ...org, [f.key]: e.target.value })
                      }
                      placeholder={f.placeholder}
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-end border-t border-gray-100 px-6 py-4">
                <button
                  onClick={() => toast.success('Organization info saved')}
                  className="flex items-center gap-2 rounded-lg hover:cursor-pointer bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-200 hover:bg-orange-600 transition-colors"
                >
                  <Save className="h-4 w-4" /> Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div>
              <div className="border-b border-gray-100 px-6 py-5">
                <h2 className="font-bold text-gray-900">Data & Reports</h2>
                <p className="mt-0.5 text-sm text-gray-500">
                  Export system data and generate reports
                </p>
              </div>
              <div className="space-y-3 p-6">
                {[
                  {
                    title: 'All Volunteers List',
                    desc: 'Complete list of volunteers with status',
                    btn: 'Export CSV',
                    href: '/api/admin/export/volunteers',
                  },
                  {
                    title: 'Applicants Report',
                    desc: 'Applicant statistics and decision history',
                    btn: 'Export PDF',
                    href: '/api/admin/export/applicants',
                  },
                  {
                    title: 'Accreditation Records',
                    desc: 'All organization accreditation records',
                    btn: 'Export PDF',
                    href: '/api/admin/export/accreditation',
                  },
                  {
                    title: 'Training & Deployment Log',
                    desc: 'Complete log of trainings and deployments',
                    btn: 'Export CSV',
                    href: '/api/admin/export/deployments',
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {item.desc}
                      </p>
                    </div>
                    <a
                      href={item.href}
                      className="shrink-0 rounded-lg bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-700 hover:bg-orange-100 transition-colors"
                    >
                      {item.btn}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
