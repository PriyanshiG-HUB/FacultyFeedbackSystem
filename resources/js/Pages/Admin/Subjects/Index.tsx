import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { SubjectsIndexProps, SubjectItem } from '../../../types';
import { DataTable, Column } from '../../../Components/ui/DataTable';
import { StatusBadge } from '../../../Components/ui/StatusBadge';
import { Button } from '../../../Components/ui/Button';
import { Modal } from '../../../Components/ui/Modal';
import { Input, Select } from '../../../Components/ui/Input';
import { Plus, Filter, AlertCircle, RefreshCw, Trash2 } from 'lucide-react';
import { getDepartmentName } from '../../../utils/departmentScope';
import { api } from '../../../lib/api';

interface DepartmentOption {
  id: number;
  code: string;
  name: string;
}

export default function Index({
  userRole = 'admin',
  assignedDepartmentCode = null,
}: SubjectsIndexProps & { userRole?: 'admin' | 'hod'; assignedDepartmentCode?: string | null }) {
  const isAdministrator = userRole === 'admin';
  const initialDeptFilter = !isAdministrator && assignedDepartmentCode ? assignedDepartmentCode.toUpperCase() : 'ALL';
  const [deptFilter, setDeptFilter] = useState<string>(initialDeptFilter);

  const [subjectList, setSubjectList] = useState<SubjectItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string>('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Form Fields
  const [subjectCode, setSubjectCode] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState<number | ''>('');
  const [selectedSemesterId, setSelectedSemesterId] = useState<number>(5);
  const [courseType, setCourseType] = useState<'CORE' | 'ELECTIVE'>('CORE');
  const [credits, setCredits] = useState<string>('4.0');

  // Synchronize department filter when assignedDepartmentCode changes
  useEffect(() => {
    if (!isAdministrator && assignedDepartmentCode) {
      setDeptFilter(assignedDepartmentCode.toUpperCase());
    }
  }, [isAdministrator, assignedDepartmentCode]);

  const fetchSubjectsAndMetadata = useCallback(async () => {
    setIsLoading(true);
    setFetchError('');
    try {
      const [subjectsRes, deptsRes] = await Promise.all([
        api.get('/subjects'),
        api.get('/departments'),
      ]);

      if (Array.isArray(deptsRes.data)) {
        const deptOptions: DepartmentOption[] = deptsRes.data.map((d: any) => ({
          id: d.id,
          code: d.department_code,
          name: d.department_name,
        }));
        setDepartments(deptOptions);
        setSelectedDeptId((prev) => (prev === '' && deptOptions.length > 0 ? deptOptions[0].id : prev));
      }

      if (Array.isArray(subjectsRes.data)) {
        const mapped: SubjectItem[] = subjectsRes.data.map((s: any) => ({
          id: s.id,
          code: s.subject_code,
          name: s.subject_name,
          department: s.department?.department_name || '',
          departmentCode: s.department?.department_code || '',
          type: s.course_type?.toLowerCase() === 'elective' ? 'Elective' : 'Core',
          semester: s.semester?.semester_no || s.semester_id || 1,
          credits: Number(s.credits) || 0,
          status: s.status || 'ACTIVE',
        }));
        setSubjectList(mapped);
      }
    } catch (err: any) {
      setFetchError(err.message || 'Failed to load subjects from server.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubjectsAndMetadata();
  }, [fetchSubjectsAndMetadata]);

  const handleOpenAddModal = () => {
    setFormError('');
    setFieldErrors({});
    setSubjectCode('');
    setSubjectName('');
    setCourseType('CORE');
    setCredits('4.0');
    setSelectedSemesterId(5);
    if (departments.length > 0) {
      if (!isAdministrator && assignedDepartmentCode) {
        const matching = departments.find(
          (d) => d.code.toUpperCase() === assignedDepartmentCode.toUpperCase()
        );
        setSelectedDeptId(matching ? matching.id : departments[0].id);
      } else {
        setSelectedDeptId(departments[0].id);
      }
    }
    setIsModalOpen(true);
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setFormError('');
    setFieldErrors({});

    try {
      const payload = {
        subject_code: subjectCode.trim().toUpperCase(),
        subject_name: subjectName.trim(),
        department_id: Number(selectedDeptId),
        semester_id: Number(selectedSemesterId),
        course_type: courseType,
        credits: parseFloat(credits) || 0,
        status: 'ACTIVE',
      };

      const res = await api.post('/subjects', payload);

      if (res.data) {
        const createdSubject: SubjectItem = {
          id: res.data.id,
          code: res.data.subject_code,
          name: res.data.subject_name,
          department: res.data.department?.department_name || departments.find((d) => d.id === Number(selectedDeptId))?.name || '',
          departmentCode: res.data.department?.department_code || departments.find((d) => d.id === Number(selectedDeptId))?.code || '',
          type: res.data.course_type?.toLowerCase() === 'elective' ? 'Elective' : 'Core',
          semester: res.data.semester?.semester_no || Number(selectedSemesterId),
          credits: Number(res.data.credits) || parseFloat(credits) || 0,
          status: res.data.status || 'ACTIVE',
        };
        setSubjectList((prev) => [createdSubject, ...prev.filter((s) => s.id !== createdSubject.id)]);
      }

      await fetchSubjectsAndMetadata();
      setIsModalOpen(false);
    } catch (err: any) {
      if (err.status === 422 && err.errors) {
        setFieldErrors(err.errors);
      } else {
        setFormError(err.message || 'Failed to create subject.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubject = async (subjectId: number) => {
    if (!confirm('Are you sure you want to delete this subject?')) return;
    try {
      await api.delete(`/subjects/${subjectId}`);
      await fetchSubjectsAndMetadata();
    } catch (err: any) {
      alert(err.message || 'Cannot delete subject. Dependent teaching assignments exist.');
    }
  };

  const filteredSubjects = subjectList.filter((s) => {
    const sDeptCode = (s.departmentCode || '').toUpperCase();
    const sDeptName = (s.department || '').toLowerCase();

    if (!isAdministrator && assignedDepartmentCode) {
      const targetCode = assignedDepartmentCode.toUpperCase();
      const targetName = getDepartmentName(assignedDepartmentCode).toLowerCase();
      return (
        sDeptCode === targetCode ||
        sDeptName.includes(targetName) ||
        targetName.includes(sDeptName)
      );
    }
    if (isAdministrator && deptFilter !== 'ALL') {
      const targetCode = deptFilter.toUpperCase();
      const targetName = (departments.find((d) => d.code.toUpperCase() === targetCode)?.name || getDepartmentName(deptFilter)).toLowerCase();
      return (
        sDeptCode === targetCode ||
        sDeptName.includes(targetName) ||
        targetName.includes(sDeptName)
      );
    }
    return true;
  });

  const columns: Column<SubjectItem>[] = [
    {
      header: 'Subject Code',
      accessor: (row) => (
        <span className="font-mono text-xs font-bold px-2 py-1 bg-blue-50 border border-blue-200 rounded text-blue-700">
          {row.code}
        </span>
      ),
      sortable: true,
    },
    {
      header: 'Course Name',
      accessor: (row) => <span className="font-bold text-slate-900">{row.name}</span>,
      sortable: true,
    },
    {
      header: 'Department',
      accessor: (row) => <span className="text-slate-800 font-medium">{row.department}</span>,
      sortable: true,
    },
    {
      header: 'Course Type',
      accessor: (row) => <StatusBadge status={row.type} />,
      sortable: true,
    },
    {
      header: 'Semester',
      accessor: (row) => <span className="text-slate-700 font-medium">Semester {row.semester}</span>,
      sortable: true,
    },
    {
      header: 'Credits',
      accessor: (row) => <span className="text-slate-700 font-medium">{row.credits} Credits</span>,
      sortable: true,
    },
  ];

  return (
    <AdminLayout
      title="Course Subjects Catalog"
      currentPath="#Admin/Subjects/Index"
      userRole={userRole}
      departmentScope={isAdministrator ? 'All Departments' : getDepartmentName(assignedDepartmentCode)}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Subjects Directory</h2>
          <p className="text-xs text-slate-500">
            {isAdministrator
              ? 'Core and Elective academic subjects assigned across semesters'
              : `Academic subjects for ${getDepartmentName(assignedDepartmentCode)}`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isAdministrator ? (
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs shadow-2xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
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

          <Button variant="outline" size="sm" onClick={fetchSubjectsAndMetadata} disabled={isLoading}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          {isAdministrator && (
            <Button variant="primary" onClick={handleOpenAddModal}>
              <Plus className="w-4 h-4 mr-1.5" />
              Add Subject
            </Button>
          )}
        </div>
      </div>

      {fetchError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{fetchError}</span>
        </div>
      )}

      <DataTable
        data={filteredSubjects}
        columns={columns}
        searchPlaceholder="Search subjects by code, name, or department..."
        actions={(row) =>
          isAdministrator ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteSubject(row.id)}
              className="text-rose-600 hover:bg-rose-50"
              title="Delete Subject"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          ) : null
        }
      />

      {/* Add Subject Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Course Subject">
        <form onSubmit={handleCreateSubject} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Subject Code"
              placeholder="e.g. IT703, CS501"
              value={subjectCode}
              onChange={(e) => setSubjectCode(e.target.value.toUpperCase())}
              error={fieldErrors.subject_code?.[0]}
              required
            />

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
          </div>

          <Input
            label="Course / Subject Title"
            placeholder="e.g. Distributed Cloud Computing"
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
            error={fieldErrors.subject_name?.[0]}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Semester"
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

            <Select
              label="Course Type"
              value={courseType}
              onChange={(e) => setCourseType(e.target.value as 'CORE' | 'ELECTIVE')}
              error={fieldErrors.course_type?.[0]}
              required
            >
              <option value="CORE">Core Subject</option>
              <option value="ELECTIVE">Elective Subject</option>
            </Select>

            <Input
              label="Credits"
              type="number"
              step="0.5"
              min="0"
              max="10"
              placeholder="4.0"
              value={credits}
              onChange={(e) => setCredits(e.target.value)}
              error={fieldErrors.credits?.[0]}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Subject'}
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
