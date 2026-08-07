import React from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { DepartmentsCreateProps } from '../../../types';
import { Card } from '../../../Components/ui/Card';
import { Input, Select } from '../../../Components/ui/Input';
import { Button } from '../../../Components/ui/Button';
import { useForm } from '../../../Components/shared/useForm';
import Link from '../../../Components/shared/Link';
import { ArrowLeft, Save, Building2 } from 'lucide-react';

export default function Create({ hodOptions }: DepartmentsCreateProps) {
  const form = useForm({
    name: '',
    code: '',
    hod_id: '',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.submit('post', '#Admin/Departments/Index', {
      onSuccess: () => {
        window.location.hash = '#Admin/Departments/Index';
      },
    });
  };

  return (
    <AdminLayout title="Create Department" currentPath="#Admin/Departments/Create">
      <div className="flex items-center gap-3">
        <Link href="#Admin/Departments/Index">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Departments
          </Button>
        </Link>
        <h2 className="text-xl font-bold text-slate-100">Add New Department</h2>
      </div>

      <Card title="Department Details Form" className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Department Name"
                placeholder="e.g. Computer Engineering"
                value={form.data.name}
                onChange={(e) => form.setData('name', e.target.value)}
                error={form.errors.name}
                required
              />
            </div>
            <div>
              <Input
                label="Code / Acronym"
                placeholder="e.g. COMP"
                value={form.data.code}
                onChange={(e) => form.setData('code', e.target.value)}
                error={form.errors.code}
                required
              />
            </div>
          </div>

          <Select
            label="Appoint Head of Department (HOD)"
            value={form.data.hod_id}
            onChange={(e) => form.setData('hod_id', e.target.value)}
            error={form.errors.hod_id}
          >
            <option value="">Select HOD Candidate...</option>
            {hodOptions.map((hod) => (
              <option key={hod.id} value={hod.id}>
                {hod.name}
              </option>
            ))}
          </Select>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider">
              Department Overview / Description
            </label>
            <textarea
              rows={4}
              placeholder="Brief description of department scope, labs, and degree offerings..."
              className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
              value={form.data.description}
              onChange={(e) => form.setData('description', e.target.value)}
            />
          </div>

          {form.recentlySuccessful && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-semibold">
              Department created successfully! Redirecting...
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Link href="#Admin/Departments/Index">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" variant="primary" disabled={form.processing}>
              <Save className="w-4 h-4 mr-1.5" />
              {form.processing ? 'Creating...' : 'Save & Register Department'}
            </Button>
          </div>
        </form>
      </Card>
    </AdminLayout>
  );
}
