import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { ElectivesIndexProps, ElectiveItem } from '../../../types';
import { DataTable, Column } from '../../../Components/ui/DataTable';
import { Button } from '../../../Components/ui/Button';
import { Modal } from '../../../Components/ui/Modal';
import { Input, Select } from '../../../Components/ui/Input';
import Link from '../../../Components/shared/Link';
import { Users, Plus, ArrowRight, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { getDepartmentName } from '../../../utils/departmentScope';
import { api } from '../../../lib/api';

interface BatchOption {
  id: number;
  batch_title: string;
  department_id: number;
  current_semester_id: number;
  program_name?: string;
}

interface AcademicYearOption {
  id: number;
  year_code: string;
  status: string;
}

interface DepartmentOption {
  id: number;
  code: string;
  name: string;
}

export default function Index({
  userRole = 'admin',
  assignedDepartmentCode = null,
}: ElectivesIndexProps & { userRole?: 'admin' | 'hod'; assignedDepartmentCode?: string | null }) {
  const isAdministrator = userRole === 'admin';
  const initialDeptFilter = !isAdministrator && assignedDepartmentCode ? assignedDepartmentCode.toUpperCase() : 'ALL';
  const [deptFilter, setDeptFilter] = useState<string>(initialDeptFilter);

  const [electiveList, setElectiveList] = useState<ElectiveItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [batches, setBatches] = useState<BatchOption[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYearOption[]>([]);
  const [electiveSubjects, setElectiveSubjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string>('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | ''>('');
  const [selectedBatchId, setSelectedBatchId] = useState<number | ''>('');
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<number | ''>('');
  const [capacity, setCapacity] = useState<string>('60');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const fetchElectivesData = useCallback(async () => {
    setIsLoading(true);
    setFetchError('');
    try {
      const [subjectsRes, offeringsRes, batchesRes, ayRes, deptsRes] = await Promise.all([
        api.get('/subjects?course_type=ELECTIVE'),
        api.get('/subject-offerings'),
        api.get('/batches'),
        api.get('/academic-years'),
        api.get('/departments'),
      ]);

      const depts: DepartmentOption[] = Array.isArray(deptsRes.data)
        ? deptsRes.data.map((d: any) => ({ id: d.id, code: d.department_code, name: d.department_name }))
        : [];
      setDepartments(depts);

      const batchList: BatchOption[] = Array.isArray(batchesRes.data) ? batchesRes.data : [];
      setBatches(batchList);

      const ayList: AcademicYearOption[] = Array.isArray(ayRes.data) ? ayRes.data : [];
      setAcademicYears(ayList);

      const allElectiveSubjects: any[] = Array.isArray(subjectsRes.data) ? subjectsRes.data : [];
      setElectiveSubjects(allElectiveSubjects);

      const offerings: any[] = Array.isArray(offeringsRes.data) ? offeringsRes.data : [];

      // Combine elective subjects with their offerings
      const combined: ElectiveItem[] = [];

      // Map existing offerings first
      offerings.forEach((offering: any) => {
        const sub = offering.subject;
        if (sub) {
          combined.push({
            id: offering.id,
            subjectId: sub.id,
            offeringId: offering.id,
            subjectCode: sub.subject_code,
            subjectName: sub.subject_name,
            department: sub.department?.department_name || '',
            departmentCode: sub.department?.department_code || '',
            batch: offering.batch?.batch_title || 'Batch 2022-26',
            batchId: offering.batch_id,
            semester: sub.semester?.semester_no || sub.semester_id || 5,
            enrolledCount: offering.enrolled_count || 0,
            maxSeats: offering.enrollment_capacity || 60,
            hasOffering: true,
            status: offering.status || 'OPEN',
          });
        }
      });

      // Include elective subjects that do not yet have an offering
      allElectiveSubjects.forEach((sub: any) => {
        const hasOffering = offerings.some((o: any) => o.subject_id === sub.id);
        if (!hasOffering) {
          combined.push({
            id: sub.id * 1000,
            subjectId: sub.id,
            offeringId: null,
            subjectCode: sub.subject_code,
            subjectName: sub.subject_name,
            department: sub.department?.department_name || '',
            departmentCode: sub.department?.department_code || '',
            batch: 'No Batch Configured',
            batchId: null,
            semester: sub.semester?.semester_no || sub.semester_id || 5,
            enrolledCount: 0,
            maxSeats: 0,
            hasOffering: false,
            status: sub.status || 'ACTIVE',
          });
        }
      });

      setElectiveList(combined);
    } catch (err: any) {
      setFetchError(err.message || 'Failed to load elective courses.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchElectivesData();
  }, [fetchElectivesData]);

  const handleOpenOfferingModal = (subjectId?: number) => {
    setFormError('');
    setFieldErrors({});
    setSelectedSubjectId(subjectId || (electiveSubjects[0]?.id ?? ''));
    setSelectedBatchId(batches[0]?.id ?? '');
    setSelectedAcademicYearId(academicYears[0]?.id ?? '');
    setCapacity('60');
    setIsModalOpen(true);
  };

  const handleCreateOffering = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setFormError('');
    setFieldErrors({});

    try {
      const payload = {
        subject_id: Number(selectedSubjectId),
        batch_id: Number(selectedBatchId),
        academic_year_id: Number(selectedAcademicYearId),
        enrollment_capacity: parseInt(capacity, 10) || 60,
        status: 'OPEN',
      };

      await api.post('/subject-offerings', payload);
      await fetchElectivesData();
      setIsModalOpen(false);
    } catch (err: any) {
      if (err.status === 422 && err.errors) {
        setFieldErrors(err.errors);
      } else {
        setFormError(err.message || 'Failed to create subject offering.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredElectives = electiveList.filter((e) => {
    const eDeptCode = (e.departmentCode || '').toUpperCase();
    const eDeptName = (e.department || '').toLowerCase();

    if (!isAdministrator && assignedDepartmentCode) {
      const targetCode = assignedDepartmentCode.toUpperCase();
      const targetName = getDepartmentName(assignedDepartmentCode).toLowerCase();
      return eDeptCode === targetCode || eDeptName.includes(targetName) || targetName.includes(eDeptName);
    }
    if (isAdministrator && deptFilter !== 'ALL') {
      const targetCode = deptFilter.toUpperCase();
      const targetName = (departments.find((d) => d.code.toUpperCase() === targetCode)?.name || getDepartmentName(deptFilter)).toLowerCase();
      return eDeptCode === targetCode || eDeptName.includes(targetName) || targetName.includes(eDeptName);
    }
    return true;
  });

  const columns: Column<ElectiveItem>[] = [
    {
      header: 'Code',
      accessor: (row) => (
        <span className="font-mono text-xs font-bold px-2 py-1 bg-blue-50 border border-blue-200 rounded text-blue-700">
          {row.subjectCode}
        </span>
      ),
      sortable: true,
    },
    {
      header: 'Elective Subject',
      accessor: (row) => <span className="font-bold text-slate-900">{row.subjectName}</span>,
      sortable: true,
    },
    {
      header: 'Department',
      accessor: (row) => <span className="text-slate-800 font-medium">{row.department}</span>,
      sortable: true,
    },
    {
      header: 'Target Batch & Sem',
      accessor: (row) =>
        row.hasOffering ? (
          <div className="text-xs">
            <p className="text-slate-800 font-medium">{row.batch}</p>
            <p className="text-slate-500 font-medium">Semester {row.semester}</p>
          </div>
        ) : (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Offering Pending (Sem {row.semester})
          </span>
        ),
      sortable: true,
    },
    {
      header: 'Enrollment Capacity',
      accessor: (row) => {
        if (!row.hasOffering) {
          return (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenOfferingModal(row.subjectId)}
              className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 text-xs font-semibold"
            >
              <Plus className="w-3 h-3 mr-1" />
              Configure Offering
            </Button>
          );
        }

        const percentage = row.maxSeats > 0 ? Math.round((row.enrolledCount / row.maxSeats) * 100) : 0;
        return (
          <div className="space-y-1 w-36">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-700 font-semibold">
                {row.enrolledCount} / {row.maxSeats}
              </span>
              <span className="text-slate-500 font-mono text-[11px]">{percentage}%</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      },
      sortable: true,
    },
  ];

  return (
    <AdminLayout
      title="Elective Courses Catalog"
      currentPath="#Admin/Electives/Index"
      userRole={userRole}
      departmentScope={isAdministrator ? 'All Departments' : getDepartmentName(assignedDepartmentCode)}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Elective Subject Management</h2>
          <p className="text-xs text-slate-500">
            {isAdministrator
              ? 'Manage elective subjects, target batch offerings, and student enrollment cohorts'
              : `Elective subject offerings and enrollments for ${getDepartmentName(assignedDepartmentCode)}`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isAdministrator ? (
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs shadow-2xs">
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="bg-transparent text-slate-800 font-medium focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.code}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <span className="px-3 py-1 bg-blue-50 text-blue-800 font-extrabold text-xs rounded-lg border border-blue-200">
              Scope: {getDepartmentName(assignedDepartmentCode)} Only
            </span>
          )}

          <Button variant="outline" size="sm" onClick={fetchElectivesData} disabled={isLoading}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          {isAdministrator && (
            <Button variant="outline" onClick={() => handleOpenOfferingModal()}>
              <Plus className="w-4 h-4 mr-1.5" />
              Add Offering
            </Button>
          )}

          <Link href="#Admin/Electives/Enrollment">
            <Button variant="primary">
              <Users className="w-4 h-4 mr-1.5" />
              Manage Student Enrollment
            </Button>
          </Link>
        </div>
      </div>

      {fetchError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{fetchError}</span>
        </div>
      )}

      <DataTable
        data={filteredElectives}
        columns={columns}
        searchPlaceholder="Search electives by code, title or department..."
        actions={(row) => (
          row.hasOffering ? (
            <Link href={`#Admin/Electives/Enrollment?offering_id=${row.offeringId}`}>
              <Button variant="ghost" size="sm">
                <span>Enrollments</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => handleOpenOfferingModal(row.subjectId)}>
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Create Offering</span>
            </Button>
          )
        )}
      />

      {/* Create Elective Offering Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Elective Subject Offering">
        <form onSubmit={handleCreateOffering} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <Select
            label="Select Elective Subject"
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(Number(e.target.value))}
            error={fieldErrors.subject_id?.[0]}
            required
          >
            {electiveSubjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.subject_code} &mdash; {s.subject_name} ({s.department?.department_name || 'Dept'})
              </option>
            ))}
          </Select>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Target Graduation Batch"
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(Number(e.target.value))}
              error={fieldErrors.batch_id?.[0]}
              required
            >
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.batch_title} ({b.program_name || 'Program'})
                </option>
              ))}
            </Select>

            <Select
              label="Academic Year"
              value={selectedAcademicYearId}
              onChange={(e) => setSelectedAcademicYearId(Number(e.target.value))}
              error={fieldErrors.academic_year_id?.[0]}
              required
            >
              {academicYears.map((ay) => (
                <option key={ay.id} value={ay.id}>
                  {ay.year_code} ({ay.status})
                </option>
              ))}
            </Select>
          </div>

          <Input
            label="Enrollment Capacity (Max Seats)"
            type="number"
            min="1"
            max="300"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            error={fieldErrors.enrollment_capacity?.[0]}
            required
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Save & Publish Offering'}
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
