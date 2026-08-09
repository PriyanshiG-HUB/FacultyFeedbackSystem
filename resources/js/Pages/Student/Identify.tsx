import React from 'react';
import StudentLayout from '../../Layouts/StudentLayout';
import { StudentIdentifyProps } from '../../types';
import { Card } from '../../Components/ui/Card';
import { Input } from '../../Components/ui/Input';
import { Button } from '../../Components/ui/Button';
import { useForm } from '../../Components/shared/useForm';
import { GraduationCap, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Identify({ error }: StudentIdentifyProps) {
  const form = useForm({
    rollNumber: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.submit('post', '#Student/Feedback/Show', {
      onSuccess: () => {
        window.location.hash = '#Student/Feedback/Show';
      },
    });
  };

  return (
    <StudentLayout>
      <div className="w-full flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <Card className="max-w-md w-full shadow-xl border-slate-200 bg-white">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-2xs">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">Student Identity Verification</h2>
            <p className="text-xs text-slate-500">
              Enter your University Roll Number to fetch your assigned subjects for this semester evaluation window.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs text-center font-bold">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Input
              label="Student Roll Number / Unique Identifier"
              placeholder="e.g. 22IT045"
              value={form.data.rollNumber}
              onChange={(e) => form.setData('rollNumber', e.target.value.toUpperCase())}
              error={form.errors.rollNumber}
              required
            />

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Strict Anonymity Guaranteed</span>
              </div>
              <p>
                Your roll number is used strictly to verify active course registration. Your individual ratings and comments remain completely decoupled from your identity.
              </p>
            </div>
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full bg-indigo-600 hover:bg-indigo-700 border-indigo-600 focus:ring-indigo-500 shadow-indigo-600/20" disabled={form.processing}>
            <span>Proceed to Feedback Form</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>
      </Card>
    </div>
  </StudentLayout>
  );
}
