import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { SectionsIndexProps, SectionItem } from '../../../types';
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

interface DivisionOption {
  id: number;
  department_id: number;
  batch_id: number;
  semester_id: number;
  division_code: string;
}

export default function Index({
  userRole = 'admin',
  assignedDepartmentCode = null,
}: SectionsIndexProps & { userRole?: 'admin' | 'hod'; assignedDepartmentCode?: string | null }) {
  const [sectionsList, setSectionsList] = useState<SectionItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [batches, setBatches] = useState<BatchOption[]>([]);
  const [divisions, setDivisions] = useState<DivisionOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string>('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Modal Dependent State
  const [selectedDeptId, setSelectedDeptId] = useState<number | ''>('');
  const [selectedBatchId, setSelectedBatchId] = useState<number | ''>('');
  const [selectedDivisionId, setSelectedDivisionId] = useState<number | ''>('');
  const [sectionCode, setSectionCode] = useState('A2');

  const fetchSectionsAndMetadata = useCallback(async () => {
    setIsLoading(true);
    setFetchError('');
    try {
      const [sectionsRes, deptsRes, batchesRes, divsRes] = await Promise.all([
        api.get('/sections'),
        api.get('/departments'),
        api.get('/batches'),
        api.get('/divisions'),
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
        setDivisions(divsRes.data);
      }

      if (Array.isArray(sectionsRes.data)) {
        const mapped: SectionItem[] = sectionsRes.data.map((s: any) => ({
          id: s.id,
          name: s.section_code,
          division: s.division?.division_code || 'Division 1',
          batch: s.division?.batch?.batch_title || '2022-26',
          currentSemester: s.division?.semester?.semester_no || s.division?.semester_id || 7,
          department: s.division?.department?.department_name || s.division?.department?.department_code || 'Information Technology',
          studentCount: s.students_count || 0,
          status: s.status === 'INACTIVE' ? 'Inactive' : 'Active',
        }));
        setSectionsList(mapped);
      }
    } catch (err: any) {
      setFetchError(err.message || 'Failed to load sections from server.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSectionsAndMetadata();
  }, [fetchSectionsAndMetadata]);

  // Dependent cascading filters
  const filteredBatches = batches.filter(
    (b) => selectedDeptId === '' || b.department_id === Number(selectedDeptId)
  );

  const filteredDivisions = divisions.filter(
    (d) =>
      (selectedDeptId === '' || d.department_id === Number(selectedDeptId)) &&
      (selectedBatchId === '' || d.batch_id === Number(selectedBatchId))
  );

  const handleOpenAddModal = () => {
    setFormError('');
    setFieldErrors({});
    setSectionCode('A2');

    const defaultDept = departments[0];
    const initialDeptId = defaultDept ? defaultDept.id : '';
    setSelectedDeptId(initialDeptId);

    const matchingBatches = batches.filter((b) => b.department_id === initialDeptId);
    const initialBatchId = matchingBatches[0] ? matchingBatches[0].id : batches[0] ? batches[0].id : '';
    setSelectedBatchId(initialBatchId);

    const matchingDivs = divisions.filter((d) => d.batch_id === initialBatchId);
    const initialDivId = matchingDivs[0] ? matchingDivs[0].id : divisions[0] ? divisions[0].id : '';
    setSelectedDivisionId(initialDivId);

    setIsModalOpen(true);
  };

  const handleDeptChange = (deptId: number) => {
    setSelectedDeptId(deptId);
    const matchingBatches = batches.filter((b) => b.department_id === deptId);
    if (matchingBatches.length > 0) {
      const bId = matchingBatches[0].id;
      setSelectedBatchId(bId);
      const matchingDivs = divisions.filter((d) => d.batch_id === bId);
      setSelectedDivisionId(matchingDivs[0] ? matchingDivs[0].id : '');
    } else {
      setSelectedBatchId('');
      setSelectedDivisionId('');
    }
  };

  const handleBatchChange = (batchId: number) => {
    setSelectedBatchId(batchId);
    const matchingDivs = divisions.filter((d) => d.batch_id === batchId);
    setSelectedDivisionId(matchingDivs[0] ? matchingDivs[0].id : '');
  };

  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!selectedDivisionId) {
      setFormError('Please select a valid parent division.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');
    setFieldErrors({});

    try {
      const payload = {
        division_id: Number(selectedDivisionId),
        section_code: sectionCode.trim().toUpperCase(),
        status: 'ACTIVE',
      };

      await api.post('/sections', payload);
      await fetchSectionsAndMetadata();
      setIsModalOpen(false);
    } catch (err: any) {
      if (err.status === 422 && err.errors) {
        setFieldErrors(err.errors);
      } else {
        setFormError(err.message || 'Failed to create section.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<SectionItem>[] = [
    {
      header: 'Section Code / Name',
      accessor: (row) => (
        <span className="font-mono text-xs font-bold px-2.5 py-1 bg-indigo-50 border border-indigo-200 rounded text-indigo-700">
          {row.name}
        </span>
      ),
      sortable: true,
    },
    {
      header: 'Parent Division',
      accessor: (row) => <span className="font-bold text-slate-900">{row.division}</span>,
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
      accessor: (row) => <StatusBadge status={row.status} />,
      sortable: true,
    },
  ];

  return (
    <AdminLayout
      title="Classroom Sections"
      currentPath="#Admin/Sections/Index"
      userRole={userRole}
      departmentScope={userRole === 'admin' ? 'All Departments' : undefined}
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Sections Management</h2>
          <p className="text-xs text-slate-500">
            Manage practical/tutorial section breakdowns under division groupings
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchSectionsAndMetadata} disabled={isLoading}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="primary" onClick={handleOpenAddModal}>
            <Plus className="w-4 h-4 mr-1.5" />
            New Section
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
        data={sectionsList}
        columns={columns}
        searchPlaceholder="Search section, division or department..."
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Classroom Section">
        <form onSubmit={handleCreateSection} className="space-y-4">
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
            required
          >
            {filteredBatches.map((b) => (
              <option key={b.id} value={b.id}>
                Batch {b.batch_title}
              </option>
            ))}
          </Select>

          <Select
            label="3. Select Parent Division"
            value={selectedDivisionId}
            onChange={(e) => setSelectedDivisionId(Number(e.target.value))}
            error={fieldErrors.division_id?.[0]}
            required
          >
            {filteredDivisions.length === 0 ? (
              <option value="">No divisions available for this batch</option>
            ) : (
              filteredDivisions.map((div) => (
                <option key={div.id} value={div.id}>
                  {div.division_code}
                </option>
              ))
            )}
          </Select>

          <Input
            label="4. Section Code / Name (e.g. A1, A2, B1, B2)"
            value={sectionCode}
            onChange={(e) => setSectionCode(e.target.value.toUpperCase())}
            error={fieldErrors.section_code?.[0]}
            required
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting || !selectedDivisionId}>
              {isSubmitting ? 'Creating...' : 'Create Section'}
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
