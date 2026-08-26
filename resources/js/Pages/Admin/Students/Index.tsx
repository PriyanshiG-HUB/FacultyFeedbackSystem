import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { StudentsIndexProps, StudentItem } from '../../../types';
import { DataTable, Column } from '../../../Components/ui/DataTable';
import { StatusBadge } from '../../../Components/ui/StatusBadge';
import { Button } from '../../../Components/ui/Button';
import { Modal } from '../../../Components/ui/Modal';
import { Input, Select } from '../../../Components/ui/Input';
import { Filter, Plus, Edit, RefreshCw, AlertCircle, Trash2 } from 'lucide-react';
import { getDepartmentName, ADMIN_DEPARTMENT_OPTIONS } from '../../../utils/departmentScope';
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
  division_code: string;
}

interface SectionOption {
  id: number;
  division_id: number;
  section_code: string;
}

export default function Index({
  userRole = 'admin',
  assignedDepartmentCode = null,
}: StudentsIndexProps & { userRole?: 'admin' | 'hod'; assignedDepartmentCode?: string | null }) {
  const isAdministrator = userRole === 'admin';
  const [studentsList, setStudentsList] = useState<StudentItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [batches, setBatches] = useState<BatchOption[]>([]);
  const [divisions, setDivisions] = useState<DivisionOption[]>([]);
  const [sections, setSections] = useState<SectionOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string>('');

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Form Fields
  const [rollNumber, setRollNumber] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState<number | ''>('');
  const [selectedBatchId, setSelectedBatchId] = useState<number | ''>('');
  const [selectedDivisionId, setSelectedDivisionId] = useState<number | ''>('');
  const [selectedSectionId, setSelectedSectionId] = useState<number | ''>('');
  const [studentStatus, setStudentStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  const fetchStudentsAndMetadata = useCallback(async () => {
    setIsLoading(true);
    setFetchError('');
    try {
      const [studentsRes, deptsRes, batchesRes, divsRes, sectsRes] = await Promise.all([
        api.get('/students'),
        api.get('/departments'),
        api.get('/batches'),
        api.get('/divisions'),
        api.get('/sections'),
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
      if (Array.isArray(sectsRes.data)) {
        setSections(sectsRes.data);
      }

      if (Array.isArray(studentsRes.data)) {
        const mapped: StudentItem[] = studentsRes.data.map((s: any) => ({
          id: s.id,
          rollNumber: s.roll_no,
          name: s.full_name,
          email: s.email,
          department: s.department?.department_name || s.department?.department_code || 'Information Technology',
          departmentCode: s.department?.department_code || 'IT',
          batch: s.batch?.batch_title || '2022-26',
          currentSemester: s.batch?.current_semester?.semester_no || s.batch?.current_semester_id || 7,
          division: s.division?.division_code || 'Division 1',
          section: s.section?.section_code || 'A1',
          feedbackStatus: (s.feedback_submitted_count && s.feedback_submitted_count > 0 ? 'Completed' : 'Pending') as 'Completed' | 'Pending',
          status: s.status === 'INACTIVE' ? 'inactive' : 'active',
        }));
        setStudentsList(mapped);
      }
    } catch (err: any) {
      setFetchError(err.message || 'Failed to load students from server.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudentsAndMetadata();
  }, [fetchStudentsAndMetadata]);

  // Dependent cascading filters for modal
  const filteredBatches = batches.filter(
    (b) => selectedDeptId === '' || b.department_id === Number(selectedDeptId)
  );

  const filteredDivisions = divisions.filter(
    (d) =>
      (selectedDeptId === '' || d.department_id === Number(selectedDeptId)) &&
      (selectedBatchId === '' || d.batch_id === Number(selectedBatchId))
  );

  const filteredSections = sections.filter(
    (sec) => selectedDivisionId === '' || sec.division_id === Number(selectedDivisionId)
  );

  const handleDeptChange = (deptId: number) => {
    setSelectedDeptId(deptId);
    const matchingBatches = batches.filter((b) => b.department_id === deptId);
    if (matchingBatches.length > 0) {
      const bId = matchingBatches[0].id;
      setSelectedBatchId(bId);
      const matchingDivs = divisions.filter((d) => d.batch_id === bId);
      if (matchingDivs.length > 0) {
        const divId = matchingDivs[0].id;
        setSelectedDivisionId(divId);
        const matchingSects = sections.filter((s) => s.division_id === divId);
        setSelectedSectionId(matchingSects[0] ? matchingSects[0].id : '');
      } else {
        setSelectedDivisionId('');
        setSelectedSectionId('');
      }
    } else {
      setSelectedBatchId('');
      setSelectedDivisionId('');
      setSelectedSectionId('');
    }
  };

  const handleBatchChange = (batchId: number) => {
    setSelectedBatchId(batchId);
    const matchingDivs = divisions.filter((d) => d.batch_id === batchId);
    if (matchingDivs.length > 0) {
      const divId = matchingDivs[0].id;
      setSelectedDivisionId(divId);
      const matchingSects = sections.filter((s) => s.division_id === divId);
      setSelectedSectionId(matchingSects[0] ? matchingSects[0].id : '');
    } else {
      setSelectedDivisionId('');
      setSelectedSectionId('');
    }
  };

  const handleDivisionChange = (divId: number) => {
    setSelectedDivisionId(divId);
    const matchingSects = sections.filter((s) => s.division_id === divId);
    setSelectedSectionId(matchingSects[0] ? matchingSects[0].id : '');
  };

  // Open Modal for Create
  const handleOpenCreateModal = () => {
    setEditingStudentId(null);
    setFormError('');
    setFieldErrors({});
    setRollNumber(`22IT${Math.floor(100 + Math.random() * 900)}`);
    setName('');
    setEmail('');
    setMobile('');
    setStudentStatus('ACTIVE');

    const defaultDept = departments[0];
    const initialDeptId = defaultDept ? defaultDept.id : '';
    setSelectedDeptId(initialDeptId);

    const matchingBatches = batches.filter((b) => b.department_id === initialDeptId);
    const initialBatchId = matchingBatches[0] ? matchingBatches[0].id : '';
    setSelectedBatchId(initialBatchId);

    const matchingDivs = divisions.filter((d) => d.batch_id === initialBatchId);
    const initialDivId = matchingDivs[0] ? matchingDivs[0].id : '';
    setSelectedDivisionId(initialDivId);

    const matchingSects = sections.filter((s) => s.division_id === initialDivId);
    setSelectedSectionId(matchingSects[0] ? matchingSects[0].id : '');

    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (student: StudentItem) => {
    setEditingStudentId(student.id);
    setFormError('');
    setFieldErrors({});
    setRollNumber(student.rollNumber);
    setName(student.name);
    setEmail(student.email);
    setMobile('');
    setStudentStatus(student.status === 'inactive' ? 'INACTIVE' : 'ACTIVE');

    const matchingDept = departments.find((d) => d.name.toLowerCase() === student.department.toLowerCase());
    const deptId = matchingDept ? matchingDept.id : departments[0]?.id || '';
    setSelectedDeptId(deptId);

    const matchingBatch = batches.find((b) => b.batch_title === student.batch);
    const bId = matchingBatch ? matchingBatch.id : batches[0]?.id || '';
    setSelectedBatchId(bId);

    const matchingDiv = divisions.find((d) => d.division_code === student.division && d.batch_id === bId);
    const divId = matchingDiv ? matchingDiv.id : divisions[0]?.id || '';
    setSelectedDivisionId(divId);

    const matchingSect = sections.find((s) => s.section_code === student.section && s.division_id === divId);
    setSelectedSectionId(matchingSect ? matchingSect.id : '');

    setIsModalOpen(true);
  };

  // Save Student (Add / Edit)
  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setFormError('');
    setFieldErrors({});

    try {
      const payload: any = {
        roll_no: rollNumber.trim(),
        full_name: name.trim(),
        email: email.trim(),
        mobile: mobile ? mobile.trim() : null,
        department_id: Number(selectedDeptId),
        batch_id: Number(selectedBatchId),
        division_id: Number(selectedDivisionId),
        section_id: selectedSectionId ? Number(selectedSectionId) : null,
        status: studentStatus,
      };

      if (editingStudentId) {
        await api.put(`/students/${editingStudentId}`, payload);
      } else {
        await api.post('/students', payload);
      }

      await fetchStudentsAndMetadata();
      setIsModalOpen(false);
    } catch (err: any) {
      if (err.status === 422 && err.errors) {
        setFieldErrors(err.errors);
      } else {
        setFormError(err.message || 'Failed to save student record.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStudent = async (studentId: number) => {
    if (!confirm('Are you sure you want to delete this student record?')) return;
    try {
      await api.delete(`/students/${studentId}`);
      await fetchStudentsAndMetadata();
    } catch (err: any) {
      alert(err.message || 'Cannot delete student record.');
    }
  };

  const filteredStudents = studentsList.filter((s) => {
    if (!isAdministrator && assignedDepartmentCode) {
      const targetDept = getDepartmentName(assignedDepartmentCode).toLowerCase();
      if (!s.department.toLowerCase().includes(targetDept) && !targetDept.includes(s.department.toLowerCase())) {
        return false;
      }
    } else if (isAdministrator && deptFilter !== 'ALL') {
      const targetDept = getDepartmentName(deptFilter).toLowerCase();
      if (!s.department.toLowerCase().includes(targetDept) && !targetDept.includes(s.department.toLowerCase())) {
        return false;
      }
    }

    if (statusFilter === 'all') return true;
    return s.feedbackStatus.toLowerCase() === statusFilter.toLowerCase();
  });

  const columns: Column<StudentItem>[] = [
    {
      header: 'Roll Number',
      accessor: (row) => (
        <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          {row.rollNumber}
        </span>
      ),
      sortable: true,
    },
    {
      header: 'Student Name',
      accessor: (row) => (
        <div>
          <p className="font-bold text-slate-900 leading-tight">{row.name}</p>
          <p className="text-[11px] text-slate-400 font-mono mt-0.5">{row.email}</p>
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Department',
      accessor: 'department',
      sortable: true,
    },
    {
      header: 'Cohort & Section',
      accessor: (row) => (
        <div className="text-xs">
          <span className="font-semibold text-slate-800">{row.batch}</span>
          <span className="text-slate-400 mx-1">&bull;</span>
          <span className="font-mono text-[11px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
            {row.division} - {row.section}
          </span>
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Feedback Status',
      accessor: (row) => (
        <StatusBadge
          status={row.feedbackStatus === 'Completed' ? 'Submitted' : 'Pending'}
          className={
            row.feedbackStatus === 'Completed'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }
        />
      ),
      sortable: true,
    },
    {
      header: 'Account Status',
      accessor: (row) => <StatusBadge status={row.status === 'active' ? 'Active' : 'Inactive'} />,
      sortable: true,
    },
    {
      header: 'Action',
      accessor: (row) => (
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEditModal(row);
            }}
            className="text-xs py-1 px-2 text-slate-600 hover:text-indigo-600"
          >
            <Edit className="w-3.5 h-3.5 mr-1" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteStudent(row.id);
            }}
            className="text-xs py-1 px-2 text-rose-600 hover:bg-rose-50 border-rose-200"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout
      title="Student Directory"
      currentPath="#Admin/Students/Index"
      userRole={userRole}
      departmentScope={isAdministrator ? 'All Departments' : getDepartmentName(assignedDepartmentCode)}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Student Directory</h2>
          <p className="text-xs text-slate-500">
            {isAdministrator
              ? 'Institutional student enrollment records, division assignments, and feedback status'
              : `Enrolled students in ${getDepartmentName(assignedDepartmentCode)}`}
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
                {ADMIN_DEPARTMENT_OPTIONS.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <span className="px-3 py-1 bg-blue-50 text-blue-800 font-extrabold text-xs rounded-lg border border-blue-200">
              Scope: {getDepartmentName(assignedDepartmentCode)} Only
            </span>
          )}

          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs shadow-2xs">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-800 font-medium focus:outline-none cursor-pointer"
            >
              <option value="all">All Feedback Status</option>
              <option value="completed">Completed Feedback</option>
              <option value="pending">Pending Feedback</option>
            </select>
          </div>

          <Button variant="outline" size="sm" onClick={fetchStudentsAndMetadata} disabled={isLoading}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          {isAdministrator && (
            <Button variant="primary" onClick={handleOpenCreateModal}>
              <Plus className="w-4 h-4 mr-1.5" />
              Add Student
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

      <DataTable data={filteredStudents} columns={columns} searchPlaceholder="Search by roll number, student name, or email..." />

      {/* Modal for Add / Edit Student */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStudentId ? 'Edit Student Details' : 'Add New Student Record'}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveStudent} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Roll Number"
              placeholder="e.g. 22IT045"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              error={fieldErrors.roll_no?.[0]}
              required
            />

            <Input
              label="Full Name"
              placeholder="e.g. Alex Johnson"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={fieldErrors.full_name?.[0]}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Institutional Email"
              type="email"
              placeholder="e.g. alex.j@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={fieldErrors.email?.[0]}
              required
            />

            <Input
              label="Mobile Number (Optional)"
              type="tel"
              placeholder="e.g. 9876543210"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              error={fieldErrors.mobile?.[0]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Department"
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
              label="Graduation Batch"
              value={selectedBatchId}
              onChange={(e) => handleBatchChange(Number(e.target.value))}
              error={fieldErrors.batch_id?.[0]}
              required
            >
              {filteredBatches.map((b) => (
                <option key={b.id} value={b.id}>
                  Batch {b.batch_title}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Class Division"
              value={selectedDivisionId}
              onChange={(e) => handleDivisionChange(Number(e.target.value))}
              error={fieldErrors.division_id?.[0]}
              required
            >
              {filteredDivisions.length === 0 ? (
                <option value="">No divisions in this batch</option>
              ) : (
                filteredDivisions.map((div) => (
                  <option key={div.id} value={div.id}>
                    {div.division_code}
                  </option>
                ))
              )}
            </Select>

            <Select
              label="Section Breakdown"
              value={selectedSectionId}
              onChange={(e) => setSelectedSectionId(e.target.value ? Number(e.target.value) : '')}
              error={fieldErrors.section_id?.[0]}
            >
              <option value="">No specific section</option>
              {filteredSections.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  Section {sec.section_code}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editingStudentId ? 'Update Student' : 'Create Student'}
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
