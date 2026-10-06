import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { Card } from '../../../Components/ui/Card';
import { Input } from '../../../Components/ui/Input';
import { Button } from '../../../Components/ui/Button';
import { api, setStoredUserInfo } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  Building2,
  Lock,
  KeyRound,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  Clock,
  BadgeCheck,
} from 'lucide-react';

export default function ProfileIndex() {
  const { user, refreshUser } = useAuth();

  // Profile Information State
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [mobile, setMobile] = useState<string>('');
  const [role, setRole] = useState<string>('');
  const [departmentName, setDepartmentName] = useState<string>('');
  const [designationName, setDesignationName] = useState<string>('');

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState<string>('');

  // UI Toggle States
  const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  // Status & Messaging States
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string>('');
  const [profileErrorMsg, setProfileErrorMsg] = useState<string>('');

  const [isSavingPassword, setIsSavingPassword] = useState<boolean>(false);
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState<string>('');
  const [passwordErrorMsg, setPasswordErrorMsg] = useState<string>('');

  useEffect(() => {
    if (user) {
      populateUserData(user);
    } else {
      // Fetch fresh profile from API
      api
        .get('/profile')
        .then((res) => {
          if (res?.user) {
            populateUserData(res.user);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const populateUserData = (userData: any) => {
    const fac = userData?.faculty;
    const stu = userData?.student;

    setFullName(fac?.full_name || userData?.full_name || stu?.full_name || '');
    setEmail(userData?.email || fac?.email || stu?.email || '');
    setMobile(fac?.mobile || userData?.mobile || stu?.mobile || '');

    const userRole = userData?.role || 'User';
    setRole(userRole === 'SUPER_ADMIN' ? 'Super Administrator' : userRole === 'ADMIN' ? 'Administrator' : userRole === 'HOD' ? 'Head of Department' : userRole);

    const dept = fac?.department?.department_name || userData?.hod_department_code || 'All Departments';
    setDepartmentName(dept);

    const desig = fac?.designation?.designation_name || (userData?.role === 'HOD' ? 'Head of Department' : 'Administrator');
    setDesignationName(desig);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileSuccessMsg('');
    setProfileErrorMsg('');

    try {
      const response = await api.put('/profile', {
        full_name: fullName,
        email: email,
        mobile: mobile,
      });

      if (response?.user) {
        setStoredUserInfo(response.user);
        await refreshUser();
      }

      setProfileSuccessMsg('Profile details updated successfully!');
    } catch (err: any) {
      const msg = err.errors?.email?.[0] || err.errors?.full_name?.[0] || err.message || 'Failed to update profile details.';
      setProfileErrorMsg(msg);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPassword(true);
    setPasswordSuccessMsg('');
    setPasswordErrorMsg('');

    if (newPassword !== newPasswordConfirmation) {
      setPasswordErrorMsg('New password and confirmation password do not match.');
      setIsSavingPassword(false);
      return;
    }

    if (newPassword.length < 6) {
      setPasswordErrorMsg('New password must be at least 6 characters long.');
      setIsSavingPassword(false);
      return;
    }

    try {
      await api.put('/profile/password', {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: newPasswordConfirmation,
      });

      setPasswordSuccessMsg('Password changed successfully! Please use your new password for future logins.');
      setCurrentPassword('');
      setNewPassword('');
      setNewPasswordConfirmation('');
    } catch (err: any) {
      const msg = err.errors?.current_password?.[0] || err.errors?.new_password?.[0] || err.message || 'Failed to update password.';
      setPasswordErrorMsg(msg);
    } finally {
      setIsSavingPassword(false);
    }
  };

  const isPasswordDefault = currentPassword === 'password123' || !passwordSuccessMsg;

  return (
    <AdminLayout title="Profile & Account Settings" currentPath="#Admin/Profile">
      <div className="space-y-6">
        {/* Header Profile Hero Card */}
        <div className="bg-gradient-to-r from-brand-dark via-brand-navy to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-brand-primary/20">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-brand-accent/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-brand-primary to-indigo-500 flex items-center justify-center text-white font-extrabold text-3xl shadow-lg border-2 border-white/20 shrink-0">
              {fullName ? fullName.charAt(0).toUpperCase() : <User className="w-10 h-10 text-brand-accent" />}
            </div>

            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-bold font-heading tracking-tight">{fullName || 'User Account'}</h1>
                <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-brand-accent text-brand-dark shadow-xs flex items-center gap-1">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  {user?.role === 'SUPER_ADMIN' ? 'Super Admin' : user?.role === 'ADMIN' ? 'Administrator' : user?.role === 'HOD' ? 'HOD' : user?.role || 'Staff'}
                </span>
              </div>

              <p className="text-slate-300 text-sm flex items-center justify-center md:justify-start gap-2">
                <Mail className="w-4 h-4 text-brand-accent shrink-0" />
                <span>{email || user?.email || 'N/A'}</span>
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-1 text-xs text-slate-300">
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg border border-white/10">
                  <Building2 className="w-3.5 h-3.5 text-indigo-300" />
                  {departmentName}
                </span>
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg border border-white/10">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  {designationName}
                </span>
                {user?.last_login_at && (
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    Last Login: {new Date(user.last_login_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details & Change Password Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Basic Profile Details */}
          <Card title="Basic Profile Information">
            <form onSubmit={handleProfileSubmit} className="space-y-5">
              <p className="text-xs text-slate-500">
                Update your account display name, primary email address, and phone number.
              </p>

              {profileSuccessMsg && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{profileSuccessMsg}</span>
                </div>
              )}

              {profileErrorMsg && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{profileErrorMsg}</span>
                </div>
              )}

              <Input
                label="Full Name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Dr. John Smith"
                required
              />

              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. user@college.edu"
                helperText="Primary email used for account authentication"
                required
              />

              <Input
                label="Mobile / Phone Number"
                type="text"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="e.g. +91 98765 43210"
              />

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Account Role</label>
                  <input
                    type="text"
                    disabled
                    value={role}
                    className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Department Scope</label>
                  <input
                    type="text"
                    disabled
                    value={departmentName}
                    className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <Button type="submit" variant="primary" disabled={isSavingProfile}>
                  <Save className="w-4 h-4 mr-2" />
                  {isSavingProfile ? 'Saving Details...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Card>

          {/* Card 2: Security & Password Management */}
          <Card title="Security & Password Management">
            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <div className="p-3.5 bg-amber-50/90 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Security Notice</span>
                  Default accounts use password <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-amber-950 font-bold">password123</code>. We strongly advise setting a personalized password to secure your account.
                </div>
              </div>

              {passwordSuccessMsg && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{passwordSuccessMsg}</span>
                </div>
              )}

              {passwordErrorMsg && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{passwordErrorMsg}</span>
                </div>
              )}

              {/* Current Password Field */}
              <div className="relative">
                <Input
                  label="Current Password"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password (e.g. password123)"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-8 text-slate-400 hover:text-slate-600 p-1"
                  title={showCurrentPassword ? 'Hide password' : 'Show password'}
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* New Password Field */}
              <div className="relative">
                <Input
                  label="New Password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  helperText="Minimum 6 characters with mixed characters"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-8 text-slate-400 hover:text-slate-600 p-1"
                  title={showNewPassword ? 'Hide password' : 'Show password'}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Confirm New Password Field */}
              <div className="relative">
                <Input
                  label="Confirm New Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={newPasswordConfirmation}
                  onChange={(e) => setNewPasswordConfirmation(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-8 text-slate-400 hover:text-slate-600 p-1"
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex justify-end pt-3">
                <Button type="submit" variant="primary" disabled={isSavingPassword}>
                  <KeyRound className="w-4 h-4 mr-2" />
                  {isSavingPassword ? 'Updating Password...' : 'Update Password'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
