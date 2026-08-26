import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { DivisionsIndexProps, DivisionItem } from '../../../types';
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

interface BatchOption {
  id: number;
  department_id: number;
  batch_title: string;
  current_semester_id?: number;
  current_semester?: {
    id: number;
    semester_no: number;
  };
}

export default function Index({
  userRole = 'admin',
  assignedDepartmentCode = null,
}: DivisionsIndexProps & { userRole?: 'admin' | 'hod'; assignedDepartmentCode?: string | null }) {
  const [divisionsList, setDivisionsList] = useState<DivisionItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [batches, setBatches] = useState<BatchOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string>('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Form Fields
  const [selectedDeptId, setSelectedDeptId] = useState<number | ''>('');
  const [selectedBatchId, setSelectedBatchId] = useState<number | ''>('');
  const [selectedSemesterId, setSelectedSemesterId] = useState<number>(7);
  const [divisionName, setDivisionName] = useState('Division 2');

  const fetchDivisionsAndMetadata = useCallback(async () => {
    setIsLoading(true);
    setFetchError('');
    try {
      const [divsRes, deptsRes, batchesRes] = await Promise.all([
        api.get('/divisions'),
        api.get('/departments'),
        api.get('/batches'),
      ]);

      if (Array.isArray(deptsRes.data)) {
        const deptOptions: DepartmentOption[] = deptsRes.data.map((d: any) => ({
          id: d.id,
          code: d.department_code,
          name: d.department_name,
        }));
        setDepartments(deptOptions);
      }

      if (Array.isArray(batchesRes.data)) {
        setBatches(batchesRes.data);
      }

      if (Array.isArray(divsRes.data)) {
        const mapped: DivisionItem[] = divsRes.data.map((d: any) => ({
          id: d.id,
          name: d.division_code,
          department: d.department?.department_name || d.department?.department_code || 'Information Technology',
          batch: d.batch?.batch_title || '2022-26',
          currentSemester: d.semester?.semester_no || d.semester_id || 7,
          studentCount: d.students_count || 0,
          status: d.status === 'INACTIVE' ? 'Inactive' : 'Active',
        }));
        setDivisionsList(mapped);
      }
    } catch (err: any) {
      setFetchError(err.message || 'Failed to load divisions from server.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDivisionsAndMetadata();
  }, [fetchDivisionsAndMetadata]);

  // Derived batches for selected department
  const filteredBatches = batches.filter(
    (b) => selectedDeptId === '' || b.department_id === Number(selectedDeptId)
  );

  const handleOpenAddModal = () => {
    setFormError('');
    setFieldErrors({});
    setDivisionName('Division 2');

    const defaultDept = departments[0];
    const initialDeptId = defaultDept ? defaultDept.id : '';
    setSelectedDeptId(initialDeptId);

    const matchingBatches = batches.filter((b) => b.department_id === initialDeptId);
    if (matchingBatches.length > 0) {
      setSelectedBatchId(matchingBatches[0].id);
      setSelectedSemesterId(
        matchingBatches[0].current_semester?.semester_no || matchingBatches[0].current_semester_id || 7
      );
    } else if (batches.length > 0) {
      setSelectedBatchId(batches[0].id);
      setSelectedSemesterId(
        batches[0].current_semester?.semester_no || batches[0].current_semester_id || 7
      );
    } else {
      setSelectedBatchId('');
    }

    setIsModalOpen(true);
  };

  const handleDeptChange = (deptId: number) => {
    setSelectedDeptId(deptId);
    const matchingBatches = batches.filter((b) => b.department_id === deptId);
    if (matchingBatches.length > 0) {
      setSelectedBatchId(matchingBatches[0].id);
      setSelectedSemesterId(
        matchingBatches[0].current_semester?.semester_no || matchingBatches[0].current_semester_id || 7
      );
    } else {
      setSelectedBatchId('');
    }
  };

  const handleBatchChange = (batchId: number) => {
    setSelectedBatchId(batchId);
    const found = batches.find((b) => b.id === batchId);
    if (found) {
      setSelectedSemesterId(
        found.current_semester?.semester_no || found.current_semester_id || 7
      );
    }
  };

  const handleCreateDivision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setFormError('');
    setFieldErrors({});

    try {
      const payload = {
        department_id: Number(selectedDeptId),
        batch_id: Number(selectedBatchId),
        semester_id: Number(selectedSemesterId),
        division_code: divisionName.trim(),
        status: 'ACTIVE',
      };

      await api.post('/divisions', payload);
      await fetchDivisionsAndMetadata();
      setIsModalOpen(false);
    } catch (err: any) {
      if (err.status === 422 && err.errors) {
        setFieldErrors(err.errors);
      } else {
        setFormError(err.message || 'Failed to create division.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<DivisionItem>[] = [
    {
      header: 'Division Name',
      accessor: (row) => <span className="font-bold text-slate-900">{row.name}</span>,
      sortable: true,
    },
    {
      header: 'Graduation Batch',
      accessor: (row) => <span className="font-semibold text-slate-800">{row.batch}</span>,
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
      header: 'Department',
      accessor: 'department',
      sortable: true,
    },
    {
      header: 'Student Count',
      accessor: (row) => <span className="text-slate-700 font-medium">{row.studentCount} Students</span>,
      sortable: true,
    },
    {
      header: 'Status',
      accessor: (row) => <StatusBadge status={row.status || 'Active'} />,
      sortable: true,
    },
  ];

  return (
    <AdminLayout
      title="Academic Divisions"
      currentPath="#Admin/Divisions/Index"
      userRole={userRole}
      departmentScope={userRole === 'admin' ? 'All Departments' : undefined}
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Academic Divisions</h2>
          <p className="text-xs text-slate-500">
            Classroom division groupings under graduation batches and current semesters
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchDivisionsAndMetadata} disabled={isLoading}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="primary" onClick={handleOpenAddModal}>
            <Plus className="w-4 h-4 mr-1.5" />
            New Division
          </Button>
        </div>
      </div>

      {fetchError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{fetchError}</span>
        </div>
      )}

      <DataTable
        data={divisionsList}
        columns={columns}
        searchPlaceholder="Search division or department..."
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Academic Division">
        <form onSubmit={handleCreateDivision} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <Select
            label="1. Select Department"
            value={selectedDeptId}
            onChange={(e) => handleDeptChange(Number(e.target.value))}
            error={fieldErrors.department_id?.[0]}
            required
          >
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.code})
              </option>
            ))}
          </Select>

          <Select
            label="2. Select Graduation Batch"
            value={selectedBatchId}
            onChange={(e) => handleBatchChange(Number(e.target.value))}
            error={fieldErrors.batch_id?.[0]}
            required
          >
            {filteredBatches.map((b) => (
              <option key={b.id} value={b.id}>
                Batch {b.batch_title} (Semester {b.current_semester?.semester_no || b.current_semester_id || 7})
              </option>
            ))}
          </Select>

          <Select
            label="3. Current Semester"
            value={selectedSemesterId}
            onChange={(e) => setSelectedSemesterId(Number(e.target.value))}
            error={fieldErrors.semester_id?.[0]}
            required
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
              <option key={sem} value={sem}>
                Semester {sem}
              </option>
            ))}
          </Select>

          <Input
            label="4. Division Name (e.g. Division 1, Division 2)"
            value={divisionName}
            onChange={(e) => setDivisionName(e.target.value)}
            error={fieldErrors.division_code?.[0]}
            required
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Division'}
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
