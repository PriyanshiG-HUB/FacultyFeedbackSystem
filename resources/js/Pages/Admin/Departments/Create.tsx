import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { DepartmentsCreateProps } from '../../../types';
import { Card } from '../../../Components/ui/Card';
import { Input, Select } from '../../../Components/ui/Input';
import { Button } from '../../../Components/ui/Button';
import { api } from '../../../lib/api';
import Link from '../../../Components/shared/Link';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

interface FacultyOption {
  id: number;
  name: string;
  department?: string;
}

export default function Create({ hodOptions = [] }: DepartmentsCreateProps) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [hodId, setHodId] = useState('');
  const [description, setDescription] = useState('');
  const [facultyOptions, setFacultyOptions] = useState<FacultyOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    api.get('/faculty').then((res) => {
      if (Array.isArray(res.data)) {
        setFacultyOptions(
          res.data.map((f: any) => ({
            id: f.id,
            name: f.full_name,
            department: f.department?.department_name,
          }))
        );
      }
    }).catch(() => {});
  }, []);

  const effectiveHodList = facultyOptions.length > 0 ? facultyOptions : hodOptions;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage('');
    setFieldErrors({});

    try {
      await api.post('/departments', {
        department_name: name.trim(),
        department_code: code.trim().toUpperCase(),
        hod_faculty_id: hodId ? Number(hodId) : null,
        status: 'ACTIVE',
      });
      setSuccessMessage('Department registered successfully! Redirecting...');
      setTimeout(() => {
        window.location.hash = '#Admin/Departments/Index';
      }, 1000);
    } catch (err: any) {
      if (err.status === 422 && err.errors) {
        setFieldErrors(err.errors);
      } else {
        setErrorMessage(err.message || 'Failed to create department.');
      }
    } finally {
      setIsSubmitting(false);
    }
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
        <h2 className="text-xl font-bold text-slate-900">Add New Department</h2>
      </div>

      <Card title="Department Details Form" className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-semibold">
              {successMessage}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Department Name"
                placeholder="e.g. Information Technology"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={fieldErrors.department_name?.[0]}
                required
              />
            </div>
            <div>
              <Input
                label="Code / Acronym"
                placeholder="e.g. IT"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                error={fieldErrors.department_code?.[0]}
                required
              />
            </div>
          </div>

          <Select
            label="Appoint Head of Department (HOD)"
            value={hodId}
            onChange={(e) => setHodId(e.target.value)}
            error={fieldErrors.hod_faculty_id?.[0]}
          >
            <option value="">Select HOD Candidate (Optional)...</option>
            {effectiveHodList.map((hod) => (
              <option key={hod.id} value={hod.id}>
                {hod.name} {hod.department ? `(${hod.department})` : ''}
              </option>
            ))}
          </Select>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Department Overview / Description
            </label>
            <textarea
              rows={4}
              placeholder="Brief description of department scope, labs, and degree offerings..."
              className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Link href="#Admin/Departments/Index">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              <Save className="w-4 h-4 mr-1.5" />
              {isSubmitting ? 'Creating...' : 'Save & Register Department'}
            </Button>
          </div>
        </form>
      </Card>
    </AdminLayout>
  );
}
