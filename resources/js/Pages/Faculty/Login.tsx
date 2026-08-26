import React, { useState } from 'react';
import { FacultyLoginProps } from '../../types';
import { Card } from '../../Components/ui/Card';
import { Input } from '../../Components/ui/Input';
import { Button } from '../../Components/ui/Button';
import { api, setAuthToken, setStoredUserInfo, removeAuthToken } from '../../lib/api';
import Link from '../../Components/shared/Link';
import { GraduationCap, LogIn, AlertCircle } from 'lucide-react';

export default function Login({ status }: FacultyLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage('');
    setFieldErrors({});

    try {
      removeAuthToken();
      const response = await api.post('/auth/login', { email, password });
      if (response.token) {
        setAuthToken(response.token);
        if (response.user) {
          setStoredUserInfo(response.user);
        }

        const role = response.user?.role;
        if (role === 'STUDENT') {
          window.location.hash = '#Student/Feedback/Show';
        } else if (role === 'FACULTY') {
          window.location.hash = '#Faculty/MyReports/Index';
        } else {
          window.location.hash = '#Admin/Dashboard';
        }
        window.location.reload();
      }
    } catch (err: any) {
      if (err.status === 422 && err.errors) {
        setFieldErrors(err.errors);
      } else {
        setErrorMessage(err.message || 'Invalid login credentials. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50/60 via-slate-50 to-emerald-50/60 text-slate-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Glow ambient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-200/40 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center mx-auto shadow-xl shadow-teal-600/20">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Faculty Feedback Portal</h1>
          <p className="text-xs text-slate-500">Sign in with your institutional credentials to access your dashboard</p>
        </div>

        {status && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs text-center font-bold">
            {status}
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2.5 font-medium">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <Card className="shadow-lg border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Institutional Email"
              type="email"
              placeholder="admin@college.edu or dr.smith@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={fieldErrors.email?.[0]}
              required
            />

            <Input
              label="Account Password"
              type="password"
              placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={fieldErrors.password?.[0]}
              required
            />

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="rounded bg-white border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <span>Remember session</span>
              </label>
              <a href="#" className="text-teal-700 font-semibold hover:underline">
                Forgot Password?
              </a>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full bg-teal-600 hover:bg-teal-700 border-teal-600 focus:ring-teal-500 shadow-teal-600/20"
              size="lg"
              disabled={isSubmitting}
            >
              <LogIn className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Authenticating...' : 'Sign In to Portal'}
            </Button>
          </form>
        </Card>

        <div className="text-center text-xs text-slate-500">
          Not a faculty member or administrator?{' '}
          <Link href="#Student/Identify" className="text-teal-700 font-bold hover:underline">
            Go to Student Feedback Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
