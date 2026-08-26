import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { BatchesIndexProps, BatchItem } from '../../../types';
import { DataTable, Column } from '../../../Components/ui/DataTable';
import { StatusBadge } from '../../../Components/ui/StatusBadge';
import { Button } from '../../../Components/ui/Button';
import { Modal } from '../../../Components/ui/Modal';
import { Input, Select } from '../../../Components/ui/Input';
import { Plus, RefreshCw, AlertCircle } from 'lucide-react';
import { api } from '../../../lib/api';

interface DepartmentOption {
  id: number;
  code: string;
  name: string;
}

export default function Index({
  userRole = 'admin',
  assignedDepartmentCode = null,
}: BatchesIndexProps & { userRole?: 'admin' | 'hod'; assignedDepartmentCode?: string | null }) {
  const [batchesList, setBatchesList] = useState<BatchItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string>('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Form Fields
  const [programName, setProgramName] = useState('B.Tech IT');
  const [batchTitle, setBatchTitle] = useState('2023-27');
  const [selectedDeptId, setSelectedDeptId] = useState<number | ''>('');
  const [admissionYear, setAdmissionYear] = useState<number>(2023);
  const [graduationYear, setGraduationYear] = useState<number>(2027);
  const [currentSemesterId, setCurrentSemesterId] = useState<number>(5);

  const fetchBatchesAndMetadata = useCallback(async () => {
    setIsLoading(true);
    setFetchError('');
    try {
      const [batchesRes, deptsRes] = await Promise.all([
        api.get('/batches'),
        api.get('/departments'),
      ]);

      if (Array.isArray(deptsRes.data)) {
        const deptOptions: DepartmentOption[] = deptsRes.data.map((d: any) => ({
          id: d.id,
          code: d.department_code,
          name: d.department_name,
        }));
        setDepartments(deptOptions);
        if (deptOptions.length > 0 && selectedDeptId === '') {
          setSelectedDeptId(deptOptions[0].id);
        }
      }

      if (Array.isArray(batchesRes.data)) {
        const mapped: BatchItem[] = batchesRes.data.map((b: any) => ({
          id: b.id,
          name: b.batch_title,
          department: b.department?.department_name || b.department?.department_code || 'Information Technology',
          academicYear: `${b.admission_year}-${b.graduation_year}`,
          currentSemester: b.current_semester?.semester_no || b.current_semester_id || 1,
          status: b.status === 'GRADUATED' ? 'Graduated' : 'Active',
        }));
        setBatchesList(mapped);
      }
    } catch (err: any) {
      setFetchError(err.message || 'Failed to load batches from server.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedDeptId]);

  useEffect(() => {
    fetchBatchesAndMetadata();
  }, [fetchBatchesAndMetadata]);

  const handleOpenAddModal = () => {
    setFormError('');
    setFieldErrors({});
    setProgramName('B.Tech IT');
    setBatchTitle('2023-27');
    setAdmissionYear(2023);
    setGraduationYear(2027);
    setCurrentSemesterId(5);
    if (departments.length > 0) {
      setSelectedDeptId(departments[0].id);
    }
    setIsModalOpen(true);
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setFormError('');
    setFieldErrors({});

    try {
      const payload = {
        department_id: Number(selectedDeptId),
        program_name: programName.trim(),
        batch_title: batchTitle.trim(),
        admission_year: Number(admissionYear),
        graduation_year: Number(graduationYear),
        current_semester_id: Number(currentSemesterId),
        status: 'ACTIVE',
      };

      await api.post('/batches', payload);
      await fetchBatchesAndMetadata();
      setIsModalOpen(false);
    } catch (err: any) {
      if (err.status === 422 && err.errors) {
        setFieldErrors(err.errors);
      } else {
        setFormError(err.message || 'Failed to create batch.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<BatchItem>[] = [
    {
      header: 'Graduation Batch / Cohort',
      accessor: (row) => <span className="font-bold text-slate-900">{row.name}</span>,
      sortable: true,
    },
    {
      header: 'Department',
      accessor: 'department',
      sortable: true,
    },
    {
      header: 'Academic Year Span',
      accessor: 'academicYear',
      sortable: true,
    },
    {
      header: 'Current Semester',
      accessor: (row) => (
        <span className="font-mono text-xs font-bold px-2 py-0.5 bg-blue-50 border border-blue-200 rounded text-blue-700">
          Semester {row.currentSemester}
        </span>
      ),
      sortable: true,
    },
    {
      header: 'Status',
      accessor: (row) => <StatusBadge status={row.status} />,
      sortable: true,
    },
  ];

  return (
    <AdminLayout
      title="Student Batches"
      currentPath="#Admin/Batches/Index"
      userRole={userRole}
      departmentScope={userRole === 'admin' ? 'All Departments' : undefined}
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Graduation Batches & Cohorts</h2>
          <p className="text-xs text-slate-500">Track active student graduation cohorts and current semester progress</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchBatchesAndMetadata} disabled={isLoading}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="primary" onClick={handleOpenAddModal}>
            <Plus className="w-4 h-4 mr-1.5" />
            Create Graduation Batch
          </Button>
        </div>
      </div>

      {fetchError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{fetchError}</span>
        </div>
      )}

      <DataTable data={batchesList} columns={columns} searchPlaceholder="Search batch by year or department..." />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Graduation Batch">
        <form onSubmit={handleCreateBatch} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Batch Title (e.g. 2023-27)"
              placeholder="e.g. 2023-27"
              value={batchTitle}
              onChange={(e) => setBatchTitle(e.target.value)}
              error={fieldErrors.batch_title?.[0]}
              required
            />

            <Input
              label="Program Name"
              placeholder="e.g. B.Tech IT"
              value={programName}
              onChange={(e) => setProgramName(e.target.value)}
              error={fieldErrors.program_name?.[0]}
              required
            />
          </div>

          <Select
            label="Department"
            value={selectedDeptId}
            onChange={(e) => setSelectedDeptId(Number(e.target.value))}
            error={fieldErrors.department_id?.[0]}
            required
          >
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.code})
              </option>
            ))}
          </Select>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Admission Year"
              type="number"
              min="2000"
              max="2099"
              value={admissionYear}
              onChange={(e) => setAdmissionYear(Number(e.target.value))}
              error={fieldErrors.admission_year?.[0]}
              required
            />

            <Input
              label="Graduation Year"
              type="number"
              min="2000"
              max="2099"
              value={graduationYear}
              onChange={(e) => setGraduationYear(Number(e.target.value))}
              error={fieldErrors.graduation_year?.[0]}
              required
            />

            <Select
              label="Current Semester"
              value={currentSemesterId}
              onChange={(e) => setCurrentSemesterId(Number(e.target.value))}
              error={fieldErrors.current_semester_id?.[0]}
              required
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <option key={sem} value={sem}>
                  Semester {sem}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Batch'}
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
