import React from 'react';
import { FacultyLoginProps } from '../../types';
import { Card } from '../../Components/ui/Card';
import { Input } from '../../Components/ui/Input';
import { Button } from '../../Components/ui/Button';
import { useForm } from '../../Components/shared/useForm';
import Link from '../../Components/shared/Link';
import { GraduationCap, LogIn } from 'lucide-react';

export default function Login({ status }: FacultyLoginProps) {
  const form = useForm({
    email: '',
    password: '',
    remember: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.submit('post', '#Faculty/MyReports/Index', {
      onSuccess: () => {
        window.location.hash = '#Faculty/MyReports/Index';
      },
    });
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
          <h1 className="text-2xl font-extrabold text-slate-900">Faculty Evaluation Portal</h1>
          <p className="text-xs text-slate-500">Sign in to view your student evaluation reports & metrics</p>
        </div>

        {status && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs text-center font-bold">
            {status}
          </div>
        )}

        <Card className="shadow-lg border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Institutional Email"
              type="email"
              placeholder="faculty@university.edu"
              value={form.data.email}
              onChange={(e) => form.setData('email', e.target.value)}
              error={form.errors.email}
              required
            />

            <Input
              label="Account Password"
              type="password"
              placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
              value={form.data.password}
              onChange={(e) => form.setData('password', e.target.value)}
              error={form.errors.password}
              required
            />

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium">
                <input
                  type="checkbox"
                  checked={form.data.remember}
                  onChange={(e) => form.setData('remember', e.target.checked)}
                  className="rounded bg-white border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <span>Remember session</span>
              </label>
              <a href="#" className="text-teal-700 font-semibold hover:underline">
                Forgot Password?
              </a>
            </div>

            <Button type="submit" variant="primary" className="w-full bg-teal-600 hover:bg-teal-700 border-teal-600 focus:ring-teal-500 shadow-teal-600/20" size="lg" disabled={form.processing}>
              <LogIn className="w-4 h-4 mr-2" />
              {form.processing ? 'Authenticating...' : 'Sign In to Portal'}
            </Button>
          </form>
        </Card>

        <div className="text-center text-xs text-slate-500">
          Not a faculty member?{' '}
          <Link href="#Student/Identify" className="text-teal-700 font-bold hover:underline">
            Go to Student Feedback Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
