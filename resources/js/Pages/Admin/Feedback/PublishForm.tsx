import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { PublishFormIndexProps, PublishedFormItem, PublishedFormQuestionItem } from '../../../types';
import { Card } from '../../../Components/ui/Card';
import { Button } from '../../../Components/ui/Button';
import { Input } from '../../../Components/ui/Input';
import { Modal } from '../../../Components/ui/Modal';
import { StatusBadge } from '../../../Components/ui/StatusBadge';
import { StatCard } from '../../../Components/ui/StatCard';
import {
  getPublishedForms,
  savePublishedForm,
  togglePublishStatus,
  deletePublishedForm,
  subscribeToPublishedForms,
} from '../../../utils/publishedFormsStore';
import { SYSTEM_QUESTIONS } from '../../../utils/feedbackExclusionStore';
import { filterItemsByDepartment, DEPARTMENTS_LIST, getDepartmentName } from '../../../utils/departmentScope';
import {
  Send,
  EyeOff,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit,
  GraduationCap,
  BookOpen,
  User,
  Layers,
  Calendar,
  Sparkles,
  HelpCircle,
  FileCheck,
  Building2,
  Check,
} from 'lucide-react';

const MOCK_FACULTY_BY_DEPT: Record<string, { id: string; name: string; designation: string }[]> = {
  IT: [
    { id: 'FAC_JENKINS', name: 'Dr. Sarah Jenkins', designation: 'Professor & HOD' },
    { id: 'FAC_SAGAR', name: 'Prof. Sagar Patel', designation: 'Assistant Professor' },
    { id: 'FAC_NISHAT', name: 'Prof. Nishat Shaikh', designation: 'Associate Professor' },
    { id: 'FAC_GOSLING', name: 'Prof. James Gosling', designation: 'Assistant Professor' },
    { id: 'FAC_TORVALDS', name: 'Dr. Linus Torvalds', designation: 'Professor' },
  ],
  CE: [
    { id: 'FAC_TURING', name: 'Dr. Alan Turing', designation: 'Professor & HOD' },
    { id: 'FAC_RITCHIE', name: 'Dr. Dennis Ritchie', designation: 'Professor' },
    { id: 'FAC_HOPPER', name: 'Dr. Grace Hopper', designation: 'Associate Professor' },
  ],
  CSE: [
    { id: 'FAC_KNUTH', name: 'Dr. Donald Knuth', designation: 'Professor & HOD' },
    { id: 'FAC_CORMEN', name: 'Dr. Thomas Cormen', designation: 'Professor' },
  ],
  AIML: [
    { id: 'FAC_ROY', name: 'Dr. Anita Roy', designation: 'Professor & HOD' },
    { id: 'FAC_BENGIO', name: 'Dr. Yoshua Bengio', designation: 'Associate Professor' },
  ],
  ECE: [
    { id: 'FAC_SHANNON', name: 'Dr. Claude Shannon', designation: 'Professor & HOD' },
  ],
  ME: [
    { id: 'FAC_WATT', name: 'Dr. James Watt', designation: 'Professor & HOD' },
  ],
};

const MOCK_SUBJECTS_BY_DEPT: Record<string, { code: string; name: string; semester: number }[]> = {
  IT: [
    { code: 'IT501', name: 'Data Structures & Algorithms', semester: 5 },
    { code: 'IT502', name: 'Database Management Systems', semester: 5 },
    { code: 'IT503', name: 'Computer Networks', semester: 5 },
    { code: 'IT504', name: 'Operating Systems', semester: 5 },
    { code: 'IT701', name: 'Database Management Systems', semester: 7 },
    { code: 'IT702', name: 'Design & Analysis of Algorithms', semester: 7 },
    { code: 'IT703', name: 'Computer Organization & Architecture', semester: 7 },
    { code: 'IT706', name: 'Software Engineering', semester: 7 },
  ],
  CE: [
    { code: 'CE501', name: 'Theory of Computation', semester: 5 },
    { code: 'CE502', name: 'Compiler Design', semester: 5 },
    { code: 'CE701', name: 'Advanced Computer Architecture', semester: 7 },
  ],
  CSE: [
    { code: 'CSE501', name: 'Advanced Algorithms', semester: 5 },
    { code: 'CSE502', name: 'Artificial Intelligence', semester: 5 },
  ],
  AIML: [
    { code: 'AIML501', name: 'Machine Learning Foundations', semester: 5 },
    { code: 'AIML502', name: 'Deep Learning & Neural Networks', semester: 5 },
  ],
  ECE: [
    { code: 'ECE501', name: 'Digital Signal Processing', semester: 5 },
  ],
  ME: [
    { code: 'ME501', name: 'Thermodynamics & Heat Transfer', semester: 5 },
  ],
};

export default function PublishForm({
  userRole = 'admin',
  assignedDepartmentCode = null,
  departmentName = 'Information Technology',
  forms: initialForms,
}: PublishFormIndexProps) {
  const [forms, setForms] = useState<PublishedFormItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSemFilter, setSelectedSemFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingFormId, setEditingFormId] = useState<string | null>(null);

  // Form Fields
  const activeDeptCode = assignedDepartmentCode || 'IT';
  const [academicYear, setAcademicYear] = useState<string>('2025-26');
  const [semester, setSemester] = useState<number>(5);
  const [deptCode, setDeptCode] = useState<string>(activeDeptCode);
  const [division, setDivision] = useState<string>('Division A');
  const [batch, setBatch] = useState<string>('Batch 2022-2026');
  const [facultyId, setFacultyId] = useState<string>('');
  const [subjectCode, setSubjectCode] = useState<string>('');
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([1, 2, 3, 4, 5]);
  const [formStatus, setFormStatus] = useState<'Published' | 'Unpublished'>('Published');

  // Error & Toast State
  const [validationError, setValidationError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load and Subscribe to Store
  useEffect(() => {
    const refreshData = () => {
      const allForms = getPublishedForms();
      const scoped = filterItemsByDepartment(allForms, assignedDepartmentCode);
      setForms(scoped);
    };

    refreshData();
    const unsubscribe = subscribeToPublishedForms(refreshData);
    return () => unsubscribe();
  }, [assignedDepartmentCode]);

  // Set default faculty and subject based on department
  useEffect(() => {
    const facList = MOCK_FACULTY_BY_DEPT[deptCode] || MOCK_FACULTY_BY_DEPT['IT'];
    const subList = MOCK_SUBJECTS_BY_DEPT[deptCode] || MOCK_SUBJECTS_BY_DEPT['IT'];

    if (facList.length > 0 && !facultyId) {
      setFacultyId(facList[0].id);
    }
    if (subList.length > 0 && !subjectCode) {
      setSubjectCode(subList[0].code);
    }
  }, [deptCode]);

  // Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Open Modal for New Form
  const handleOpenCreateModal = () => {
    setEditingFormId(null);
    setAcademicYear('2025-26');
    setSemester(5);
    setDeptCode(assignedDepartmentCode || 'IT');
    setDivision('Division A');
    setBatch('Batch 2022-2026');

    const facList = MOCK_FACULTY_BY_DEPT[assignedDepartmentCode || 'IT'] || MOCK_FACULTY_BY_DEPT['IT'];
    const subList = MOCK_SUBJECTS_BY_DEPT[assignedDepartmentCode || 'IT'] || MOCK_SUBJECTS_BY_DEPT['IT'];

    setFacultyId(facList[0]?.id || '');
    setSubjectCode(subList[0]?.code || '');
    setSelectedQuestions([1, 2, 3, 4, 5]);
    setFormStatus('Published');
    setValidationError(null);
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (form: PublishedFormItem) => {
    setEditingFormId(form.id);
    setAcademicYear(form.academicYear);
    setSemester(form.semester);
    setDeptCode(form.departmentCode);
    setDivision(form.division);
    setBatch(form.batch);
    setFacultyId(String(form.facultyId));
    setSubjectCode(form.subjectCode);
    setSelectedQuestions(form.questions.map((q) => q.id));
    setFormStatus(form.status);
    setValidationError(null);
    setIsModalOpen(true);
  };

  // Toggle Question Selection
  const handleToggleQuestion = (qId: number) => {
    setSelectedQuestions((prev) =>
      prev.includes(qId) ? prev.filter((id) => id !== qId) : [...prev, qId]
    );
  };

  // Submit Form Creation / Update
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!semester || !deptCode || !facultyId || !subjectCode) {
      setValidationError('Please select Academic Semester, Department, Faculty, and Subject.');
      return;
    }

    if (selectedQuestions.length === 0) {
      setValidationError('Please select at least one feedback question for this form.');
      return;
    }

    const facList = MOCK_FACULTY_BY_DEPT[deptCode] || MOCK_FACULTY_BY_DEPT['IT'];
    const subList = MOCK_SUBJECTS_BY_DEPT[deptCode] || MOCK_SUBJECTS_BY_DEPT['IT'];

    const selectedFacultyObj = facList.find((f) => String(f.id) === String(facultyId)) || facList[0];
    const selectedSubjectObj = subList.find((s) => s.code === subjectCode) || subList[0];

    const questionObjects: PublishedFormQuestionItem[] = selectedQuestions.map((qId) => {
      const found = SYSTEM_QUESTIONS.find((sq) => sq.id === qId);
      return {
        id: qId,
        statement: found ? found.text : `Feedback Question #${qId}`,
      };
    });

    const fullDeptName = getDepartmentName(deptCode);

    savePublishedForm({
      id: editingFormId || undefined,
      title: `Faculty Feedback — Semester ${semester} (${selectedSubjectObj.name})`,
      academicYear,
      semester: Number(semester),
      departmentCode: deptCode,
      departmentName: fullDeptName,
      division,
      batch,
      facultyId: selectedFacultyObj.id,
      facultyName: selectedFacultyObj.name,
      facultyDesignation: selectedFacultyObj.designation,
      subjectCode: selectedSubjectObj.code,
      subjectName: selectedSubjectObj.name,
      questions: questionObjects,
      status: formStatus,
      createdBy: `${userRole === 'hod' ? 'HOD' : 'Admin'} ${fullDeptName}`,
    });

    setIsModalOpen(false);
    showToast(
      editingFormId
        ? 'Feedback form updated successfully!'
        : formStatus === 'Published'
        ? 'Feedback form published and now visible to target students!'
        : 'Feedback form saved as Unpublished.'
    );
  };

  // Toggle Publish / Unpublish directly from table
  const handleTogglePublish = (formId: string, currentStatus: string) => {
    const updated = togglePublishStatus(formId);
    if (updated) {
      showToast(
        updated.status === 'Published'
          ? `Form "${updated.title}" is now PUBLISHED and visible to students!`
          : `Form "${updated.title}" is now UNPUBLISHED and hidden from students.`
      );
    }
  };

  // Delete Form
  const handleDeleteForm = (formId: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete form "${title}"?`)) {
      deletePublishedForm(formId);
      showToast('Form deleted successfully.');
    }
  };

  // Filtered list
  const filteredForms = forms.filter((f) => {
    const matchesSearch =
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.facultyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.subjectCode.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSem = selectedSemFilter === 'ALL' || String(f.semester) === selectedSemFilter;
    const matchesStatus = selectedStatusFilter === 'ALL' || f.status === selectedStatusFilter;

    return matchesSearch && matchesSem && matchesStatus;
  });

  const totalFormsCount = forms.length;
  const publishedCount = forms.filter((f) => f.status === 'Published').length;
  const unpublishedCount = forms.filter((f) => f.status === 'Unpublished').length;

  return (
    <AdminLayout
      title="Publish Form"
      currentPath="#Admin/Feedback/PublishForm"
      userRole={userRole}
      departmentScope={departmentName}
    >
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Scope Info Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-lg border border-blue-800/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-200 border border-blue-400/30 text-[10px] font-extrabold uppercase tracking-wider">
              {userRole === 'hod' ? `${assignedDepartmentCode || 'IT'} HOD Scope` : 'System Administrator'}
            </span>
            <span className="text-xs text-blue-200 font-semibold">&bull; Feedback Control Center</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Publish Feedback Forms</h2>
          <p className="text-xs text-blue-200/90 max-w-2xl leading-relaxed">
            Configure academic target groups, select faculty & subjects, set feedback questions, and publish forms. Published forms become immediately visible to eligible students in their Student Portal.
          </p>
        </div>

        <Button
          onClick={handleOpenCreateModal}
          variant="primary"
          size="md"
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold border-emerald-500 shadow-lg shadow-emerald-950/40 shrink-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          <span>Configure &amp; Publish Form</span>
        </Button>
      </div>

      {/* Stat Cards Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Configured Forms"
          value={totalFormsCount}
          change="All feedback templates"
          icon="check-circle"
        />
        <StatCard
          label="Published (Visible)"
          value={publishedCount}
          change="Active on Student Portal"
          isPositive={true}
          icon="check-circle"
        />
        <StatCard
          label="Unpublished (Hidden)"
          value={unpublishedCount}
          change="Not visible to students"
          isPositive={false}
          icon="star"
        />
        <StatCard
          label="Department Scope"
          value={assignedDepartmentCode || 'IT'}
          change={departmentName}
          isPositive={true}
          icon="building"
        />
      </div>

      {/* Action Header & Filters */}
      <Card className="p-4 sm:p-5 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search forms by title, faculty, or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Semester Filter */}
            <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-500 text-[11px] uppercase">Semester:</span>
              <select
                value={selectedSemFilter}
                onChange={(e) => setSelectedSemFilter(e.target.value)}
                className="bg-transparent font-extrabold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Semesters</option>
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
                <option value="3">Semester 3</option>
                <option value="4">Semester 4</option>
                <option value="5">Semester 5</option>
                <option value="6">Semester 6</option>
                <option value="7">Semester 7</option>
                <option value="8">Semester 8</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-500 text-[11px] uppercase">Status:</span>
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="bg-transparent font-extrabold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="Published">Published (Visible)</option>
                <option value="Unpublished">Unpublished (Hidden)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Forms Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 text-slate-600 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">Form Details</th>
                <th className="px-4 py-3.5">Academic Target</th>
                <th className="px-4 py-3.5">Faculty Member</th>
                <th className="px-4 py-3.5">Subject</th>
                <th className="px-4 py-3.5 text-center">Questions</th>
                <th className="px-4 py-3.5 text-center">Student Visibility Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white font-medium text-slate-700">
              {filteredForms.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    <div className="max-w-xs mx-auto space-y-2">
                      <FileCheck className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="font-bold text-slate-600">No feedback forms found</p>
                      <p className="text-[11px] text-slate-400">
                        Click "Configure &amp; Publish Form" above to create a new form for students.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredForms.map((form) => {
                  const isPublished = form.status === 'Published';

                  return (
                    <tr key={form.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Form Details */}
                      <td className="px-4 py-3.5">
                        <div className="space-y-0.5">
                          <span className="font-extrabold text-slate-900 text-xs block">{form.title}</span>
                          <span className="text-[10px] text-slate-500 font-mono block">ID: {form.id}</span>
                        </div>
                      </td>

                      {/* Academic Target */}
                      <td className="px-4 py-3.5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-extrabold text-[10px] border border-indigo-200">
                              Sem {form.semester}
                            </span>
                            <span className="text-slate-800 font-semibold">{form.departmentCode}</span>
                          </div>
                          <p className="text-[10px] text-slate-500">
                            {form.division} &bull; {form.batch}
                          </p>
                        </div>
                      </td>

                      {/* Faculty Member */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-extrabold text-xs shrink-0">
                            {form.facultyName.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 block">{form.facultyName}</span>
                            <span className="text-[10px] text-slate-400 block">{form.facultyDesignation || 'Faculty'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Subject */}
                      <td className="px-4 py-3.5">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-800 block">{form.subjectName}</span>
                          <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded inline-block">
                            {form.subjectCode}
                          </span>
                        </div>
                      </td>

                      {/* Questions Count */}
                      <td className="px-4 py-3.5 text-center font-bold text-slate-700">
                        <span className="px-2 py-1 bg-slate-100 rounded-lg border border-slate-200 text-xs">
                          {form.questions.length} params
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 text-center">
                        <div className="inline-flex flex-col items-center gap-1">
                          <StatusBadge status={form.status} />
                          <span className="text-[10px] text-slate-400 font-medium">
                            {isPublished ? 'Visible to students' : 'Hidden from students'}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Main Publish / Unpublish Toggle */}
                          <button
                            onClick={() => handleTogglePublish(form.id, form.status)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-xs ${
                              isPublished
                                ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-300'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-600 shadow-emerald-950/20'
                            }`}
                            title={isPublished ? 'Unpublish to hide from students' : 'Publish to make visible to students'}
                          >
                            {isPublished ? (
                              <>
                                <EyeOff className="w-3.5 h-3.5" />
                                <span>Unpublish</span>
                              </>
                            ) : (
                              <>
                                <Send className="w-3.5 h-3.5" />
                                <span>Publish</span>
                              </>
                            )}
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => handleOpenEditModal(form)}
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit Form Configuration"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteForm(form.id, form.title)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Form"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Configure / Edit Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingFormId ? 'Edit Feedback Form' : 'Configure & Publish Feedback Form'}
      >
        <form onSubmit={handleSaveForm} className="space-y-5">
          {validationError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Section 1: Academic Information Target */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-xs">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span>1. Academic Target Selection</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Academic Year */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Academic Year</label>
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="2025-26">2025-26</option>
                  <option value="2024-25">2024-25</option>
                </select>
              </div>

              {/* Semester */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Semester *</label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(Number(e.target.value))}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg font-extrabold text-indigo-700 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={1}>Semester 1</option>
                  <option value={2}>Semester 2</option>
                  <option value={3}>Semester 3</option>
                  <option value={4}>Semester 4</option>
                  <option value={5}>Semester 5</option>
                  <option value={6}>Semester 6</option>
                  <option value={7}>Semester 7</option>
                  <option value={8}>Semester 8</option>
                </select>
              </div>

              {/* Department */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Department *</label>
                <select
                  value={deptCode}
                  onChange={(e) => setDeptCode(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                  disabled={userRole === 'hod' && !!assignedDepartmentCode}
                >
                  {DEPARTMENTS_LIST.map((d) => (
                    <option key={d.code} value={d.code}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Division */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Division</label>
                <select
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Division A">Division A (IT-1)</option>
                  <option value="Division B">Division B (IT-2)</option>
                  <option value="Division C">Division C</option>
                  <option value="All Divisions">All Divisions</option>
                </select>
              </div>

              {/* Batch */}
              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-bold mb-1">Batch</label>
                <select
                  value={batch}
                  onChange={(e) => setBatch(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Batch 2022-2026">Batch 2022-2026</option>
                  <option value="A1">Batch A1</option>
                  <option value="B1">Batch B1</option>
                  <option value="All Batches">All Batches</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Faculty & Subject Selection */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-xs">
              <User className="w-4 h-4 text-indigo-600" />
              <span>2. Faculty &amp; Subject Selection</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Faculty */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Faculty Member *</label>
                <select
                  value={facultyId}
                  onChange={(e) => setFacultyId(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                >
                  {(MOCK_FACULTY_BY_DEPT[deptCode] || MOCK_FACULTY_BY_DEPT['IT']).map((fac) => (
                    <option key={fac.id} value={fac.id}>
                      {fac.name} ({fac.designation})
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Subject *</label>
                <select
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                >
                  {(MOCK_SUBJECTS_BY_DEPT[deptCode] || MOCK_SUBJECTS_BY_DEPT['IT']).map((sub) => (
                    <option key={sub.code} value={sub.code}>
                      {sub.name} ({sub.code} - Sem {sub.semester})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Question Selection */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>3. Feedback Question Bank Parameters</span>
              </div>
              <span className="text-[11px] text-slate-500 font-semibold">
                {selectedQuestions.length} selected
              </span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {SYSTEM_QUESTIONS.map((q) => {
                const isSelected = selectedQuestions.includes(q.id);
                return (
                  <div
                    key={q.id}
                    onClick={() => handleToggleQuestion(q.id)}
                    className={`p-2.5 rounded-lg border text-xs cursor-pointer flex items-start gap-2.5 transition-all ${
                      isSelected
                        ? 'bg-indigo-50/80 border-indigo-300 text-indigo-950 font-semibold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                    <span className="leading-snug">{q.text}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 4: Initial Status Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-200 text-xs">
            <div>
              <span className="font-extrabold text-slate-900 block">Initial Student Visibility</span>
              <span className="text-[11px] text-slate-500 block">
                Choose whether this form becomes immediately visible to students upon saving.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setFormStatus('Unpublished')}
                className={`px-3 py-1.5 rounded-lg font-extrabold text-xs transition-all ${
                  formStatus === 'Unpublished'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-300'
                }`}
              >
                Unpublished (Hidden)
              </button>
              <button
                type="button"
                onClick={() => setFormStatus('Published')}
                className={`px-3 py-1.5 rounded-lg font-extrabold text-xs transition-all ${
                  formStatus === 'Published'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-300'
                }`}
              >
                Published (Visible)
              </button>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              className={formStatus === 'Published' ? 'bg-emerald-600 hover:bg-emerald-700 border-emerald-600' : 'bg-indigo-600 hover:bg-indigo-700'}
            >
              {formStatus === 'Published' ? (
                <>
                  <Send className="w-4 h-4 mr-1.5" />
                  <span>{editingFormId ? 'Update & Keep Published' : 'Publish Form Now'}</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-4 h-4 mr-1.5" />
                  <span>{editingFormId ? 'Update Form' : 'Save as Unpublished'}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
