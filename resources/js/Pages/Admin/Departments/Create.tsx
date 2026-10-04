import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { DepartmentsCreateProps } from '../../../types';
import { Card } from '../../../Components/ui/Card';
import { Input, Select } from '../../../Components/ui/Input';
import { Button } from '../../../Components/ui/Button';
import { api } from '../../../lib/api';
import Link from '../../../Components/shared/Link';
import { ArrowLeft, Save, AlertCircle, UserPlus } from 'lucide-react';

interface DesignationOption {
  id: number;
  designation_name: string;
}

export default function Create({ hodOptions = [] }: DepartmentsCreateProps) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');

  // HOD Faculty details state
  const [registerHod, setRegisterHod] = useState(true);
  const [hodFullName, setHodFullName] = useState('');
  const [hodEmail, setHodEmail] = useState('');
  const [hodMobile, setHodMobile] = useState('');
  const [hodDesignationId, setHodDesignationId] = useState('');

  const [designations, setDesignations] = useState<DesignationOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    api
      .get('/designations')
      .then((res) => {
        if (Array.isArray(res.data)) {
          setDesignations(res.data);
        }
      })
      .catch((err) => console.warn('Designations fetch error:', err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage('');
    setFieldErrors({});

    try {
      const payload: any = {
        department_name: name.trim(),
        department_code: code.trim().toUpperCase(),
        status: 'ACTIVE',
      };

      if (registerHod && hodFullName.trim() && hodEmail.trim()) {
        payload.hod_full_name = hodFullName.trim();
        payload.hod_email = hodEmail.trim();

        if (hodMobile.trim()) {
          payload.hod_mobile = hodMobile.trim();
        }

        if (hodDesignationId) {
          payload.hod_designation_id = Number(hodDesignationId);
        }
      }

      await api.post('/departments', payload);

      setSuccessMessage(
        'Department and Head of Department (HOD) faculty record created successfully! Redirecting...'
      );

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
    <AdminLayout
      title="Create Department"
      currentPath="#Admin/Departments/Create"
    >
      <div className="flex items-center gap-3 mb-4">
        <Link href="#Admin/Departments/Index">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Departments
          </Button>
        </Link>

        <h2 className="text-xl font-bold font-heading text-brand-dark">
          Add New Department
        </h2>
      </div>

      <Card
        title="Department Details & HOD Registration"
        className="max-w-3xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
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

          {/* Department Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-brand-dark uppercase tracking-wider border-b border-slate-100 pb-2">
              Department Basic Information
            </h3>

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
                  onChange={(e) =>
                    setCode(e.target.value.toUpperCase())
                  }
                  error={fieldErrors.department_code?.[0]}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Department Overview / Description
              </label>

              <textarea
                rows={4}
                placeholder="Brief description of department scope, labs, and degree offerings..."
                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Head of Department Registration */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-brand-primary" />

                <h3 className="text-sm font-bold text-brand-dark">
                  Head of Department (HOD) Faculty Registration
                </h3>
              </div>

              <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={registerHod}
                  onChange={(e) => setRegisterHod(e.target.checked)}
                  className="rounded border-slate-300 text-brand-primary focus:ring-brand-primary"
                />

                Register HOD Faculty Now
              </label>
            </div>

            {registerHod && (
              <div className="space-y-4 pt-1">
                <p className="text-xs text-slate-500">
                  Registering the HOD automatically creates an active Faculty
                  record assigned to this new department and grants HOD
                  management permissions.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="HOD Full Name *"
                    placeholder="e.g. Dr. Alan Turing"
                    value={hodFullName}
                    onChange={(e) => setHodFullName(e.target.value)}
                    error={
                      fieldErrors.hod_full_name?.[0] ||
                      fieldErrors.hod_name?.[0]
                    }
                    required={registerHod}
                  />

                  <Input
                    label="HOD Email Address *"
                    type="email"
                    placeholder="e.g. alan.turing@college.edu"
                    value={hodEmail}
                    onChange={(e) => setHodEmail(e.target.value)}
                    error={fieldErrors.hod_email?.[0]}
                    required={registerHod}
                  />

                  <Input
                    label="HOD Mobile Number"
                    placeholder="e.g. 9876543210"
                    value={hodMobile}
                    onChange={(e) => setHodMobile(e.target.value)}
                    error={fieldErrors.hod_mobile?.[0]}
                  />

                  <Select
                    label="Designation"
                    value={hodDesignationId}
                    onChange={(e) => setHodDesignationId(e.target.value)}
                    error={fieldErrors.hod_designation_id?.[0]}
                  >
                    <option value="">
                      Head of Department (Default)
                    </option>

                    {designations.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.designation_name}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Link href="#Admin/Departments/Index">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>

            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
            >
              <Save className="w-4 h-4 mr-1.5" />

              {isSubmitting
                ? 'Creating...'
                : 'Save & Register Department'}
            </Button>
          </div>
        </form>
      </Card>
    </AdminLayout>
  );
}