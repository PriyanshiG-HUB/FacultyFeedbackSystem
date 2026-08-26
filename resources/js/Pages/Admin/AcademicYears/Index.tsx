import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { AcademicYearsIndexProps, AcademicYearItem, AcademicYearCohort } from '../../../types';
import { Card } from '../../../Components/ui/Card';
import { Button } from '../../../Components/ui/Button';
import { Modal } from '../../../Components/ui/Modal';
import { Input, Select } from '../../../Components/ui/Input';
import { getDepartmentName } from '../../../utils/departmentScope';
import {
  Calendar,
  GraduationCap,
  Users,
  ArrowLeft,
  ArrowRight,
  Filter,
  Eye,
  Plus,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { api } from '../../../lib/api';

const ACADEMIC_YEARS_DEPARTMENT_OPTIONS = [
  { code: 'ALL', name: 'All Departments' },
  { code: 'CE', name: 'Computer Engineering' },
  { code: 'CSE', name: 'Computer Science & Engineering' },
  { code: 'IT', name: 'Information Technology' },
  { code: 'ECE', name: 'Electronics & Communication' },
  { code: 'ME', name: 'Mechanical Engineering' },
];

export default function Index({
  userRole = 'admin',
  assignedDepartmentCode = null,
}: AcademicYearsIndexProps) {
  const isAdministrator = userRole === 'admin';

  const [academicYearsList, setAcademicYearsList] = useState<AcademicYearItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  // Selected academic year ID for detail view
  const [selectedYearId, setSelectedYearId] = useState<string | null>(null);

  // Department filter state
  const [selectedDeptCode, setSelectedDeptCode] = useState<string>(
    assignedDepartmentCode || 'ALL'
  );

  // Selected cohort for student roster modal
  const [selectedCohort, setSelectedCohort] = useState<AcademicYearCohort | null>(null);

  // Modal State for Creating Academic Year
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [yearCode, setYearCode] = useState('2026-2027');
  const [startDate, setStartDate] = useState('2026-07-01');
  const [endDate, setEndDate] = useState('2027-06-30');

  const fetchAcademicData = useCallback(async () => {
    setIsLoading(true);
    setFetchError('');
    try {
      const [ayRes, batchesRes, studentsRes] = await Promise.all([
        api.get('/academic-years'),
        api.get('/batches'),
        api.get('/students'),
      ]);

      const rawYears = Array.isArray(ayRes.data) ? ayRes.data : [];
      const rawBatches = Array.isArray(batchesRes.data) ? batchesRes.data : [];
      const rawStudents = Array.isArray(studentsRes.data) ? studentsRes.data : [];

      const mappedYears: AcademicYearItem[] = rawYears.map((ay: any) => {
        // Collect cohorts for this academic year from batches
        const cohorts: AcademicYearCohort[] = rawBatches.map((b: any) => {
          const batchStudents = rawStudents.filter((s: any) => s.batch_id === b.id || s.batch?.id === b.id);
          const currentSem = b.current_semester?.semester_no || b.current_semester_id || 1;

          return {
            id: String(b.id),
            batch: b.batch_title,
            department: b.department?.department_name || 'Information Technology',
            departmentCode: b.department?.department_code || 'IT',
            semester: currentSem,
            studentCount: batchStudents.length,
            students: batchStudents.map((s: any) => ({
              id: s.id,
              rollNo: s.roll_no,
              name: s.full_name,
              department: s.department?.department_name || 'Information Technology',
              batch: b.batch_title,
              semester: currentSem,
              division: s.division?.division_code || 'Division 1',
              status: s.status?.toLowerCase() === 'active' ? 'Active' : 'Inactive',
            })),
          };
        });

        // Determine semesters represented
        const semSet = new Set<number>();
        cohorts.forEach((c) => semSet.add(c.semester));
        const semList = Array.from(semSet).sort((a, b) => a - b);
        if (semList.length === 0) {
          semList.push(1, 3, 5, 7);
        }

        const isOdd = semList.some((s) => s % 2 !== 0);

        return {
          id: String(ay.id),
          academicYear: ay.year_code,
          semesterType: (isOdd ? 'Odd' : 'Even') as 'Odd' | 'Even',
          semesters: semList,
          cohorts,
        };
      });

      setAcademicYearsList(mappedYears);
    } catch (err: any) {
      setFetchError(err.message || 'Failed to load academic years data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAcademicData();
  }, [fetchAcademicData]);

  const handleOpenCreateModal = () => {
    setFormError('');
    setFieldErrors({});
    setYearCode('2026-2027');
    setStartDate('2026-07-01');
    setEndDate('2027-06-30');
    setIsCreateModalOpen(true);
  };

  const handleCreateAcademicYear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setFormError('');
    setFieldErrors({});

    try {
      await api.post('/academic-years', {
        year_code: yearCode.trim(),
        start_date: startDate || null,
        end_date: endDate || null,
        status: 'ACTIVE',
      });
      await fetchAcademicData();
      setIsCreateModalOpen(false);
    } catch (err: any) {
      if (err.status === 422 && err.errors) {
        setFieldErrors(err.errors);
      } else {
        setFormError(err.message || 'Failed to create academic year.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentDeptName = isAdministrator
    ? selectedDeptCode === 'ALL'
      ? 'All Departments'
      : getDepartmentName(selectedDeptCode)
    : getDepartmentName(assignedDepartmentCode);

  const activeYearObj = academicYearsList.find((y) => y.id === selectedYearId);

  // Filter cohorts for active academic year by department scope
  const filteredCohorts = (activeYearObj?.cohorts || []).filter((cohort) => {
    const targetDeptCode = isAdministrator ? selectedDeptCode : assignedDepartmentCode;
    if (!targetDeptCode || targetDeptCode === 'ALL') return true;

    const cohortDept = cohort.departmentCode || cohort.department;
    return (
      cohortDept === targetDeptCode ||
      cohort.department === getDepartmentName(targetDeptCode) ||
      (targetDeptCode === 'CE' && cohort.department === 'Computer Engineering') ||
      (targetDeptCode === 'CSE' && cohort.department === 'Computer Science & Engineering') ||
      (targetDeptCode === 'IT' && cohort.department === 'Information Technology') ||
      (targetDeptCode === 'ECE' && cohort.department === 'Electronics & Communication') ||
      (targetDeptCode === 'ME' && cohort.department === 'Mechanical Engineering')
    );
  });

  return (
    <AdminLayout
      title="Academic Years"
      currentPath="#Admin/AcademicYears/Index"
      userRole={userRole}
      departmentScope={currentDeptName}
    >
      <div className="space-y-6">
        {fetchError && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{fetchError}</span>
          </div>
        )}

        {/* VIEW 1: ACADEMIC YEARS OVERVIEW (Cards) */}
        {!selectedYearId ? (
          <div className="space-y-6">
            {/* Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-indigo-50 border border-indigo-200 rounded-full text-indigo-700 text-[11px] font-bold uppercase tracking-wider mb-1">
                  {isAdministrator ? 'ADMINISTRATOR SCOPE' : 'HOD SCOPE'} &bull; {currentDeptName}
                </div>
                <h2 className="text-xl font-extrabold text-slate-900">Academic Years</h2>
                <p className="text-xs text-slate-500">
                  View student cohorts and academic records grouped by academic year and semester progression
                </p>
              </div>

              <div className="flex items-center gap-3">
                {isAdministrator && (
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs shadow-2xs self-start sm:self-auto">
                    <Filter className="w-3.5 h-3.5 text-slate-400" />
                    <select
                      value={selectedDeptCode}
                      onChange={(e) => setSelectedDeptCode(e.target.value)}
                      className="bg-transparent text-slate-800 font-medium focus:outline-none cursor-pointer"
                    >
                      {ACADEMIC_YEARS_DEPARTMENT_OPTIONS.map((d) => (
                        <option key={d.code} value={d.code}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <Button variant="outline" size="sm" onClick={fetchAcademicData} disabled={isLoading}>
                  <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>

                {isAdministrator && (
                  <Button variant="primary" onClick={handleOpenCreateModal}>
                    <Plus className="w-4 h-4 mr-1.5" />
                    Add Academic Year
                  </Button>
                )}
              </div>
            </div>

            {/* Academic Year Overview Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {academicYearsList.map((ay) => {
                const isOdd = ay.semesterType === 'Odd';
                return (
                  <div
                    key={ay.id}
                    onClick={() => setSelectedYearId(ay.id)}
                    className={`bg-white border-2 rounded-2xl p-6 space-y-5 cursor-pointer transition-all duration-200 hover:shadow-lg group ${
                      isOdd
                        ? 'border-blue-200 hover:border-blue-500 hover:bg-blue-50/20'
                        : 'border-emerald-200 hover:border-emerald-500 hover:bg-emerald-50/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                      <div className="space-y-1">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                            isOdd
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {ay.semesterType.toUpperCase()} SEMESTERS
                        </span>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
                          Academic Year {ay.academicYear}
                        </h3>
                      </div>

                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0 ${
                          isOdd
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        <Calendar className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">Semesters:</span>
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                          {ay.semesters.join(' • ')}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">Active Cohorts:</span>
                        <span className="font-extrabold text-slate-900">{ay.cohorts.length} Cohort Records</span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-medium">
                        Click to view semester records
                      </span>
                      <Button
                        variant={isOdd ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedYearId(ay.id);
                        }}
                        className="group-hover:translate-x-0.5 transition-transform"
                      >
                        <span>View Records</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* VIEW 2: ACADEMIC YEAR DETAIL VIEW */
          <div className="space-y-6">
            {/* Top Action Bar */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSelectedYearId(null)}
                className="inline-flex items-center text-xs font-bold text-slate-600 hover:text-indigo-600 bg-white border border-slate-200 hover:border-indigo-300 px-3.5 py-2 rounded-xl transition-all shadow-2xs cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5 text-slate-400" />
                <span>Back to All Academic Years</span>
              </button>

              {isAdministrator && (
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs shadow-2xs">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={selectedDeptCode}
                    onChange={(e) => setSelectedDeptCode(e.target.value)}
                    className="bg-transparent text-slate-800 font-medium focus:outline-none cursor-pointer"
                  >
                    {ACADEMIC_YEARS_DEPARTMENT_OPTIONS.map((d) => (
                      <option key={d.code} value={d.code}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Academic Year Banner Header */}
            {activeYearObj && (
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-md border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 bg-white/15 backdrop-blur-md text-blue-100 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 border border-white/20">
                      ACADEMIC YEAR {activeYearObj.academicYear} &bull; {activeYearObj.semesterType.toUpperCase()} SEMESTERS
                    </span>
                    <h1 className="text-2xl font-black text-white">
                      Academic Year {activeYearObj.academicYear} Records
                    </h1>
                    <p className="text-xs text-blue-100 font-medium mt-0.5">
                      Showing student cohorts for Semesters {activeYearObj.semesters.join(', ')} ({currentDeptName})
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/20 text-right shrink-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200 block">Total Cohorts</span>
                    <span className="text-xl font-extrabold text-white font-mono block">
                      {filteredCohorts.length} Cohorts
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Semester-Grouped Cohort Records */}
            {activeYearObj && (
              <div className="space-y-6">
                {activeYearObj.semesters
                  .slice()
                  .sort((a, b) => b - a)
                  .map((semNum) => {
                    const cohortsInSem = filteredCohorts.filter((c) => c.semester === semNum);

                    return (
                      <div key={semNum} className="space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-extrabold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-200">
                            SEMESTER {semNum}
                          </span>
                          <div className="h-px bg-slate-200 flex-1"></div>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {cohortsInSem.length} Cohort{cohortsInSem.length !== 1 ? 's' : ''}
                          </span>
                        </div>

                        {cohortsInSem.length === 0 ? (
                          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 text-xs font-medium text-center">
                            No cohorts found for Semester {semNum} under {currentDeptName}.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {cohortsInSem.map((cohort) => (
                              <Card key={cohort.id} className="p-5 bg-white border-slate-200 shadow-2xs space-y-4">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                                      <GraduationCap className="w-5 h-5" />
                                    </div>
                                    <div>
                                      <h4 className="text-base font-extrabold text-slate-900 leading-tight">
                                        {cohort.batch}
                                      </h4>
                                      <p className="text-xs text-slate-500 font-medium">{cohort.department}</p>
                                    </div>
                                  </div>

                                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded font-mono text-[11px] font-bold">
                                    Sem {cohort.semester}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                                  <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                                    <Users className="w-3.5 h-3.5 text-slate-400" />
                                    <strong className="text-slate-900">{cohort.studentCount}</strong> Students Enrolled
                                  </span>

                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedCohort(cohort)}
                                    className="text-xs font-bold"
                                  >
                                    <Eye className="w-3.5 h-3.5 mr-1 text-slate-400" />
                                    View Students
                                  </Button>
                                </div>
                              </Card>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* Batch Student Roster Detail Modal */}
        {selectedCohort && (
          <Modal
            isOpen={!!selectedCohort}
            onClose={() => setSelectedCohort(null)}
            title={`${selectedCohort.batch} — Semester ${selectedCohort.semester} Student Roster`}
            maxWidth="lg"
          >
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">{selectedCohort.department}</h4>
                    <p className="text-xs text-slate-500 font-medium">
                      Academic Year: <strong className="text-slate-800">{activeYearObj?.academicYear}</strong> &bull; Current Semester: <strong className="text-indigo-700">Semester {selectedCohort.semester}</strong>
                    </p>
                  </div>
                  <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-full text-xs font-extrabold">
                    {selectedCohort.studentCount} Students
                  </span>
                </div>
              </div>

              {/* Student Roster Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="bg-slate-100/70 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <span>Student Roster</span>
                  <span>Division & Status</span>
                </div>

                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  {selectedCohort.students.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400 font-medium">
                      No enrolled students found in this cohort.
                    </div>
                  ) : (
                    selectedCohort.students.map((student, sIdx) => (
                      <div key={sIdx} className="px-4 py-3 flex items-center justify-between gap-3 hover:bg-slate-50 text-xs">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                            {student.rollNo}
                          </span>
                          <div>
                            <p className="font-bold text-slate-900">{student.name}</p>
                            <p className="text-[11px] text-slate-400 font-medium">
                              {student.department} &bull; {student.batch} (Sem {student.semester})
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {student.division}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> {student.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100">
                <Button variant="outline" onClick={() => setSelectedCohort(null)}>
                  Close
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Create Academic Year Modal */}
        <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Academic Year">
          <form onSubmit={handleCreateAcademicYear} className="space-y-4">
            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <Input
              label="Academic Year Code (e.g. 2026-2027)"
              placeholder="e.g. 2026-2027"
              value={yearCode}
              onChange={(e) => setYearCode(e.target.value)}
              error={fieldErrors.year_code?.[0]}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                error={fieldErrors.start_date?.[0]}
              />

              <Input
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                error={fieldErrors.end_date?.[0]}
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Academic Year'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  );
}
