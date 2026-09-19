import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { SessionAssignmentsIndexProps, SessionAssignmentItem } from '../../../types';
import { DataTable, Column } from '../../../Components/ui/DataTable';
import { Button } from '../../../Components/ui/Button';
import { Modal } from '../../../Components/ui/Modal';
import { Select } from '../../../Components/ui/Input';
import { Plus, RefreshCw, AlertCircle, Trash2, Filter } from 'lucide-react';
import { getDepartmentName } from '../../../utils/departmentScope';
import { api } from '../../../lib/api';

export default function Index({
  userRole = 'admin',
  assignedDepartmentCode = null,
}: Partial<SessionAssignmentsIndexProps> & { userRole?: 'admin' | 'hod'; assignedDepartmentCode?: string | null }) {
  const isAdministrator = userRole === 'admin';
  const initialDeptFilter = !isAdministrator && assignedDepartmentCode ? assignedDepartmentCode.toUpperCase() : 'ALL';
  const [deptFilter, setDeptFilter] = useState<string>(initialDeptFilter);

  const [assignmentList, setAssignmentList] = useState<SessionAssignmentItem[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [subjectList, setSubjectList] = useState<any[]>([]);
  const [batchList, setBatchList] = useState<any[]>([]);
  const [divisionList, setDivisionList] = useState<any[]>([]);
  const [sectionList, setSectionList] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string>('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Form Fields
  const [facultyId, setFacultyId] = useState<number | ''>('');
  const [subjectId, setSubjectId] = useState<number | ''>('');
  const [batchId, setBatchId] = useState<number | ''>('');
  const [semesterId, setSemesterId] = useState<number>(5);
  const [divisionId, setDivisionId] = useState<number | ''>('');
  const [sectionId, setSectionId] = useState<number | ''>('');
  const [academicYearId, setAcademicYearId] = useState<number | ''>('');

  const fetchAssignmentsAndMetadata = useCallback(async () => {
    setIsLoading(true);
    setFetchError('');
    try {
      const [
        assignmentsRes,
        facultyRes,
        subjectsRes,
        batchesRes,
        divisionsRes,
        sectionsRes,
        ayRes,
        deptsRes,
      ] = await Promise.all([
        api.get('/teaching-assignments'),
        api.get('/faculty'),
        api.get('/subjects'),
        api.get('/batches'),
        api.get('/divisions'),
        api.get('/sections'),
        api.get('/academic-years'),
        api.get('/departments'),
      ]);

      if (Array.isArray(deptsRes.data)) setDepartments(deptsRes.data);
      if (Array.isArray(facultyRes.data)) setFacultyList(facultyRes.data);
      if (Array.isArray(subjectsRes.data)) setSubjectList(subjectsRes.data);
      if (Array.isArray(batchesRes.data)) setBatchList(batchesRes.data);
      if (Array.isArray(divisionsRes.data)) setDivisionList(divisionsRes.data);
      if (Array.isArray(sectionsRes.data)) setSectionList(sectionsRes.data);
      if (Array.isArray(ayRes.data)) setAcademicYears(ayRes.data);

      if (Array.isArray(assignmentsRes.data)) {
        const mapped: SessionAssignmentItem[] = assignmentsRes.data.map((ta: any) => ({
          id: ta.id,
          facultyName: ta.faculty?.full_name || 'Faculty Member',
          subjectName: ta.subject?.subject_name || 'Subject',
          subjectCode: ta.subject?.subject_code || 'SUB101',
          batchName: ta.batch?.batch_title || 'Batch',
          divisionName: ta.division?.division_code || 'All Divisions',
          sectionName: ta.section?.section_code || 'All Sections',
          semester: ta.semester?.semester_no || ta.semester_id || 5,
          department: ta.batch?.department?.department_name || ta.subject?.department?.department_name || '',
        }));
        setAssignmentList(mapped);
      }
    } catch (err: any) {
      setFetchError(err.message || 'Failed to load teaching assignments.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssignmentsAndMetadata();
  }, [fetchAssignmentsAndMetadata]);

  const handleOpenAddModal = () => {
    setFormError('');
    setFieldErrors({});
    setFacultyId(facultyList[0]?.id || '');
    setSubjectId(subjectList[0]?.id || '');
    const firstBatch = batchList[0];
    setBatchId(firstBatch?.id || '');
    setSemesterId(firstBatch?.current_semester_id || 5);
    setDivisionId('');
    setSectionId('');
    setAcademicYearId(academicYears[0]?.id || '');
    setIsModalOpen(true);
  };

  const handleBatchSelect = (bId: number) => {
    setBatchId(bId);
    const selected = batchList.find((b) => b.id === bId);
    if (selected?.current_semester_id) {
      setSemesterId(selected.current_semester_id);
    }
    setDivisionId('');
    setSectionId('');
  };

  const handleDivisionSelect = (dId: number | '') => {
    setDivisionId(dId);
    setSectionId('');
  };

  // Filter divisions matching selected batch and semester
  const filteredDivisions = divisionList.filter(
    (d) => (!batchId || d.batch_id === Number(batchId)) && (!semesterId || d.semester_id === Number(semesterId))
  );

  // Filter sections matching selected division
  const filteredSections = sectionList.filter(
    (s) => !divisionId || s.division_id === Number(divisionId)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setFormError('');
    setFieldErrors({});

    try {
      const payload: any = {
        faculty_id: Number(facultyId),
        subject_id: Number(subjectId),
        batch_id: Number(batchId),
        semester_id: Number(semesterId),
        academic_year_id: Number(academicYearId),
        status: 'ACTIVE',
      };

      if (divisionId !== '') {
        payload.division_id = Number(divisionId);
      }
      if (sectionId !== '') {
        payload.section_id = Number(sectionId);
      }

      await api.post('/teaching-assignments', payload);
      await fetchAssignmentsAndMetadata();
      setIsModalOpen(false);
    } catch (err: any) {
      if (err.status === 422 && err.errors) {
        setFieldErrors(err.errors);
      } else {
        setFormError(err.message || 'Failed to create teaching assignment.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAssignment = async (id: number) => {
    if (!confirm('Are you sure you want to delete this session assignment?')) return;
    try {
      await api.delete(`/teaching-assignments/${id}`);
      await fetchAssignmentsAndMetadata();
    } catch (err: any) {
      alert(err.message || 'Cannot delete assignment. Dependent feedback forms exist.');
    }
  };

  const filteredAssignments = assignmentList.filter((a) => {
    if (!isAdministrator && assignedDepartmentCode) {
      const targetName = getDepartmentName(assignedDepartmentCode).toLowerCase();
      return (a.department || '').toLowerCase().includes(targetName) || targetName.includes((a.department || '').toLowerCase());
    }
    if (isAdministrator && deptFilter !== 'ALL') {
      const targetDept = departments.find((d) => d.department_code === deptFilter)?.department_name || getDepartmentName(deptFilter);
      return (a.department || '').toLowerCase().includes(targetDept.toLowerCase()) || targetDept.toLowerCase().includes((a.department || '').toLowerCase());
    }
    return true;
  });

  const columns: Column<SessionAssignmentItem>[] = [
    {
      header: 'Faculty Member',
      accessor: (row) => <span className="font-bold text-slate-900">{row.facultyName}</span>,
      sortable: true,
    },
    {
      header: 'Subject Code & Title',
      accessor: (row) => (
        <div>
          <span className="font-mono text-xs font-bold px-2 py-0.5 bg-blue-50 border border-blue-200 rounded text-blue-700 mr-2">
            {row.subjectCode}
          </span>
          <span className="text-slate-800 font-medium">{row.subjectName}</span>
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Department',
      accessor: (row) => <span className="text-slate-700 font-medium">{row.department || 'General'}</span>,
      sortable: true,
    },
    {
      header: 'Assigned Batch',
      accessor: (row) => <span className="font-semibold text-slate-800">{row.batchName}</span>,
      sortable: true,
    },
    {
      header: 'Division & Section',
      accessor: (row) => (
        <div className="text-xs">
          <p className="text-slate-800 font-medium">{row.divisionName}</p>
          <p className="text-slate-500 font-mono font-bold">Section: {row.sectionName || 'All'}</p>
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Semester',
      accessor: (row) => (
        <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-700">
          Semester {row.semester}
        </span>
      ),
      sortable: true,
    },
  ];

  return (
    <AdminLayout
      title="Session Allocations"
      currentPath="#Admin/SessionAssignments/Index"
      userRole={userRole}
      departmentScope={isAdministrator ? 'All Departments' : getDepartmentName(assignedDepartmentCode)}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Faculty Session Allocations</h2>
          <p className="text-xs text-slate-500">Map faculty members to subjects, graduation batches, divisions, and sections</p>
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
                  <option key={d.id} value={d.department_code}>
                    {d.department_name} ({d.department_code})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <span className="px-3 py-1 bg-blue-50 text-blue-800 font-extrabold text-xs rounded-lg border border-blue-200">
              Scope: {getDepartmentName(assignedDepartmentCode)} Only
            </span>
          )}

          <Button variant="outline" size="sm" onClick={fetchAssignmentsAndMetadata} disabled={isLoading}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          {isAdministrator && (
            <Button variant="primary" onClick={handleOpenAddModal}>
              <Plus className="w-4 h-4 mr-1.5" />
              New Session Assignment
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
        data={filteredAssignments}
        columns={columns}
        searchPlaceholder="Search allocations by faculty, subject or batch..."
        actions={(row) =>
          isAdministrator ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteAssignment(row.id)}
              className="text-rose-600 hover:bg-rose-50"
              title="Delete Assignment"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          ) : null
        }
      />

      {/* New Assignment Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Assign Faculty to Session" maxWidth="3xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Select Faculty Member *"
              value={facultyId}
              onChange={(e) => setFacultyId(Number(e.target.value))}
              error={fieldErrors.faculty_id?.[0]}
              required
            >
              {facultyList.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.full_name} ({f.department?.department_code || 'Dept'})
                </option>
              ))}
            </Select>

            <Select
              label="Select Course Subject *"
              value={subjectId}
              onChange={(e) => setSubjectId(Number(e.target.value))}
              error={fieldErrors.subject_id?.[0]}
              required
            >
              {subjectList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.subject_code} &mdash; {s.subject_name}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Graduation Batch *"
              value={batchId}
              onChange={(e) => handleBatchSelect(Number(e.target.value))}
              error={fieldErrors.batch_id?.[0]}
              required
            >
              {batchList.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.batch_title} ({b.department?.department_code || 'Dept'})
                </option>
              ))}
            </Select>

            <Select
              label="Academic Semester *"
              value={semesterId}
              onChange={(e) => setSemesterId(Number(e.target.value))}
              error={fieldErrors.semester_id?.[0]}
              required
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </Select>

            <Select
              label="Academic Year *"
              value={academicYearId}
              onChange={(e) => setAcademicYearId(Number(e.target.value))}
              error={fieldErrors.academic_year_id?.[0]}
              required
            >
              {academicYears.map((ay) => (
                <option key={ay.id} value={ay.id}>
                  {ay.year_code}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Division Scope (Optional)"
              value={divisionId}
              onChange={(e) => handleDivisionSelect(e.target.value ? Number(e.target.value) : '')}
              error={fieldErrors.division_id?.[0]}
            >
              <option value="">All Divisions (Entire Batch)</option>
              {filteredDivisions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.division_code}
                </option>
              ))}
            </Select>

            <Select
              label="Section Scope (Optional)"
              value={sectionId}
              onChange={(e) => setSectionId(e.target.value ? Number(e.target.value) : '')}
              error={fieldErrors.section_id?.[0]}
              disabled={divisionId === ''}
            >
              <option value="">All Sections (Entire Division)</option>
              {filteredSections.map((s) => (
                <option key={s.id} value={s.id}>
                  Section {s.section_code}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Assigning...' : 'Save Teaching Assignment'}
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
