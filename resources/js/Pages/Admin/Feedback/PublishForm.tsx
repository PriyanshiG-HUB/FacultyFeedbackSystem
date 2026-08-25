import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { PublishFormIndexProps, PublishedFormItem, PublishedFormFacultyItem } from '../../../types';
import { Card } from '../../../Components/ui/Card';
import { Button } from '../../../Components/ui/Button';
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
  User,
  FileCheck,
  X,
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
}: PublishFormIndexProps) {
  const [forms, setForms] = useState<PublishedFormItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSemFilter, setSelectedSemFilter] = useState<string>('ALL');
  const [selectedDivFilter, setSelectedDivFilter] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingFormId, setEditingFormId] = useState<string | null>(null);

  // Academic Target Fields
  const activeDeptCode = assignedDepartmentCode || 'IT';
  const [academicYear, setAcademicYear] = useState<string>('2025-26');
  const [semester, setSemester] = useState<number>(5);
  const [deptCode, setDeptCode] = useState<string>(activeDeptCode);
  const [division, setDivision] = useState<string>('Division 1');
  const [batch, setBatch] = useState<string>('2022-26');

  // Faculty & Subject Fields
  const [subjectCode, setSubjectCode] = useState<string>('');
  const [selectedFaculties, setSelectedFaculties] = useState<PublishedFormFacultyItem[]>([]);
  const [pendingFacultyId, setPendingFacultyId] = useState<string>('');
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
    const targetDept = assignedDepartmentCode || 'IT';
    setDeptCode(targetDept);
    setDivision('Division 1');
    setBatch('2022-26');

    const subList = MOCK_SUBJECTS_BY_DEPT[targetDept] || MOCK_SUBJECTS_BY_DEPT['IT'];
    const facList = MOCK_FACULTY_BY_DEPT[targetDept] || MOCK_FACULTY_BY_DEPT['IT'];

    setSubjectCode(subList[0]?.code || '');

    const defaultFac = facList[0]
      ? [{ id: facList[0].id, name: facList[0].name, designation: facList[0].designation }]
      : [];
    setSelectedFaculties(defaultFac);

    const nextAvailable = facList.find((f) => !defaultFac.some((df) => String(df.id) === String(f.id)));
    setPendingFacultyId(nextAvailable ? nextAvailable.id : '');

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
    setSubjectCode(form.subjectCode);

    let facultiesToSet: PublishedFormFacultyItem[] = [];
    if (form.faculties && form.faculties.length > 0) {
      facultiesToSet = [...form.faculties];
    } else if (form.facultyName) {
      const names = form.facultyName.split(',').map((n) => n.trim());
      facultiesToSet = names.map((name, idx) => ({
        id: idx === 0 ? form.facultyId : `FAC_LEGACY_${idx}`,
        name,
        designation: idx === 0 ? form.facultyDesignation || 'Faculty' : 'Faculty',
      }));
    }
    setSelectedFaculties(facultiesToSet);

    const facList = MOCK_FACULTY_BY_DEPT[form.departmentCode] || MOCK_FACULTY_BY_DEPT['IT'];
    const nextAvailable = facList.find((f) => !facultiesToSet.some((fs) => String(fs.id) === String(f.id)));
    setPendingFacultyId(nextAvailable ? nextAvailable.id : '');

    setFormStatus(form.status);
    setValidationError(null);
    setIsModalOpen(true);
  };

  // Add Faculty to Selected List
  const handleAddFaculty = () => {
    if (!pendingFacultyId) return;
    const facList = MOCK_FACULTY_BY_DEPT[deptCode] || MOCK_FACULTY_BY_DEPT['IT'];
    const target = facList.find((f) => String(f.id) === String(pendingFacultyId));
    if (!target) return;

    if (selectedFaculties.some((f) => String(f.id) === String(target.id))) {
      setValidationError('Faculty member is already added to this subject.');
      return;
    }

    setValidationError(null);
    const updated = [
      ...selectedFaculties,
      { id: target.id, name: target.name, designation: target.designation },
    ];
    setSelectedFaculties(updated);

    const nextAvailable = facList.find((f) => !updated.some((u) => String(u.id) === String(f.id)));
    setPendingFacultyId(nextAvailable ? nextAvailable.id : '');
  };

  // Remove Faculty from Selected List
  const handleRemoveFaculty = (facId: string | number) => {
    const updated = selectedFaculties.filter((f) => String(f.id) !== String(facId));
    setSelectedFaculties(updated);

    const facList = MOCK_FACULTY_BY_DEPT[deptCode] || MOCK_FACULTY_BY_DEPT['IT'];
    const nextAvailable = facList.find((f) => !updated.some((u) => String(u.id) === String(f.id)));
    setPendingFacultyId(nextAvailable ? nextAvailable.id : '');
  };

  // Submit Form Creation / Update
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!semester || !deptCode || !subjectCode) {
      setValidationError('Please select Academic Target and Subject.');
      return;
    }

    if (selectedFaculties.length === 0) {
      setValidationError('Please select at least one faculty member for this subject.');
      return;
    }

    const subList = MOCK_SUBJECTS_BY_DEPT[deptCode] || MOCK_SUBJECTS_BY_DEPT['IT'];
    const selectedSubjectObj = subList.find((s) => s.code === subjectCode) || subList[0];
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
      faculties: selectedFaculties,
      facultyId: selectedFaculties[0]?.id || '',
      facultyName: selectedFaculties.map((f) => f.name).join(', '),
      facultyDesignation: selectedFaculties[0]?.designation || 'Faculty',
      subjectCode: selectedSubjectObj.code,
      subjectName: selectedSubjectObj.name,
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
          ? `Form for "${updated.subjectName}" is now PUBLISHED.`
          : `Form for "${updated.subjectName}" is now UNPUBLISHED.`
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
      f.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.facultyName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSem = selectedSemFilter === 'ALL' || String(f.semester) === selectedSemFilter;
    const matchesDiv = selectedDivFilter === 'ALL' || f.division === selectedDivFilter;

    return matchesSearch && matchesSem && matchesDiv;
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

      {/* Action Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-lg border border-blue-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-200 border border-blue-400/30 text-[10px] font-extrabold uppercase tracking-wider">
              {userRole === 'hod' ? `${assignedDepartmentCode || 'IT'} HOD Scope` : 'System Administrator'}
            </span>
            <span className="text-xs text-blue-200 font-semibold">&bull; Feedback Control Center</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Create &amp; Publish Feedback Form</h2>
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

      {/* Feedback Forms Table Container */}
      <Card className="p-4 sm:p-5 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <h3 className="text-base font-extrabold text-slate-900">Feedback Forms</h3>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64 max-w-xs">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search Subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Semester Filter */}
            <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-500 text-[11px] uppercase">Semester:</span>
              <select
                value={selectedSemFilter}
                onChange={(e) => setSelectedSemFilter(e.target.value)}
                className="bg-transparent font-extrabold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Semesters</option>
                <option value="1">Sem 1</option>
                <option value="2">Sem 2</option>
                <option value="3">Sem 3</option>
                <option value="4">Sem 4</option>
                <option value="5">Sem 5</option>
                <option value="6">Sem 6</option>
                <option value="7">Sem 7</option>
                <option value="8">Sem 8</option>
              </select>
            </div>

            {/* Division Filter */}
            <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-500 text-[11px] uppercase">Division:</span>
              <select
                value={selectedDivFilter}
                onChange={(e) => setSelectedDivFilter(e.target.value)}
                className="bg-transparent font-extrabold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Divisions</option>
                <option value="Division 1">Division 1</option>
                <option value="Division 2">Division 2</option>
                <option value="Division A">Division A</option>
                <option value="Division B">Division B</option>
              </select>
            </div>
          </div>
        </div>

        {/* Simplified 6-Column Forms Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 text-slate-600 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">Semester</th>
                <th className="px-4 py-3.5">Subject</th>
                <th className="px-4 py-3.5">Division</th>
                <th className="px-4 py-3.5">Faculty</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white font-medium text-slate-700">
              {filteredForms.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
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
                  const facultyDisplayNames =
                    form.faculties && form.faculties.length > 0
                      ? form.faculties.map((f) => f.name).join(', ')
                      : form.facultyName;

                  return (
                    <tr key={form.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Semester */}
                      <td className="px-4 py-3.5 font-bold text-slate-900">
                        Sem {form.semester}
                      </td>

                      {/* Subject */}
                      <td className="px-4 py-3.5 font-bold text-slate-900">
                        {form.subjectName}
                      </td>

                      {/* Division */}
                      <td className="px-4 py-3.5 font-medium text-slate-700">
                        {form.division}
                      </td>

                      {/* Faculty */}
                      <td className="px-4 py-3.5 font-medium text-slate-800">
                        {facultyDisplayNames}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 text-center">
                        <StatusBadge status={form.status} />
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Publish / Unpublish Toggle */}
                          <button
                            onClick={() => handleTogglePublish(form.id, form.status)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-xs ${
                              isPublished
                                ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-300'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-600 shadow-emerald-950/20'
                            }`}
                            title={isPublished ? 'Unpublish form' : 'Publish form'}
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

      {/* Configure & Publish Form Modal (Spacious 5xl Width) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingFormId ? 'Edit Feedback Form' : 'Configure & Publish Feedback Form'}
        maxWidth="5xl"
      >
        <form onSubmit={handleSaveForm} className="space-y-5">
          {validationError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Step 1: Academic Target Selection */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-xs">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span>1. Academic Target Selection</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Row 1: Academic Year | Semester */}
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

              {/* Row 2: Department | Division */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Department *</label>
                <select
                  value={deptCode}
                  onChange={(e) => {
                    const newDept = e.target.value;
                    setDeptCode(newDept);
                    const subList = MOCK_SUBJECTS_BY_DEPT[newDept] || MOCK_SUBJECTS_BY_DEPT['IT'];
                    const facList = MOCK_FACULTY_BY_DEPT[newDept] || MOCK_FACULTY_BY_DEPT['IT'];
                    setSubjectCode(subList[0]?.code || '');
                    const defFac = facList[0] ? [{ id: facList[0].id, name: facList[0].name, designation: facList[0].designation }] : [];
                    setSelectedFaculties(defFac);
                    const nextAvail = facList.find((f) => !defFac.some((df) => String(df.id) === String(f.id)));
                    setPendingFacultyId(nextAvail ? nextAvail.id : '');
                  }}
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

              <div>
                <label className="block text-slate-700 font-bold mb-1">Division Target</label>
                <select
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Division 1">Division 1</option>
                  <option value="Division 2">Division 2</option>
                  <option value="Division A">Division A</option>
                  <option value="Division B">Division B</option>
                  <option value="All Divisions">All Divisions</option>
                </select>
              </div>

              {/* Row 3: Graduation Batch (full width) */}
              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-bold mb-1">Graduation Batch Target</label>
                <select
                  value={batch}
                  onChange={(e) => setBatch(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="2022-26">Batch 2022-26</option>
                  <option value="2023-27">Batch 2023-27</option>
                  <option value="2024-28">Batch 2024-28</option>
                  <option value="All Batches">All Batches</option>
                </select>
              </div>
            </div>
          </div>

          {/* Step 2: Faculty & Subject Selection */}
          <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-xs">
              <User className="w-4 h-4 text-indigo-600" />
              <span>2. Faculty &amp; Subject Selection</span>
            </div>

            {/* Subject Selection */}
            <div>
              <label className="block text-slate-700 font-bold text-xs mb-1">Subject *</label>
              <select
                value={subjectCode}
                onChange={(e) => setSubjectCode(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg font-bold text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
              >
                {(MOCK_SUBJECTS_BY_DEPT[deptCode] || MOCK_SUBJECTS_BY_DEPT['IT']).map((sub) => (
                  <option key={sub.code} value={sub.code}>
                    {sub.name} ({sub.code} &bull; Sem {sub.semester})
                  </option>
                ))}
              </select>
            </div>

            {/* Faculty Selection & List */}
            <div>
              <label className="block text-slate-700 font-bold text-xs mb-1.5">
                Faculty Members ({selectedFaculties.length} Selected) *
              </label>

              {/* Add Faculty Row */}
              <div className="flex flex-col sm:flex-row gap-2 mb-3">
                <select
                  value={pendingFacultyId}
                  onChange={(e) => setPendingFacultyId(e.target.value)}
                  className="flex-1 p-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="" disabled>-- Select Faculty Member --</option>
                  {(MOCK_FACULTY_BY_DEPT[deptCode] || MOCK_FACULTY_BY_DEPT['IT']).map((fac) => {
                    const isAlreadyAdded = selectedFaculties.some((sf) => String(sf.id) === String(fac.id));
                    return (
                      <option key={fac.id} value={fac.id} disabled={isAlreadyAdded}>
                        {fac.name} ({fac.designation}){isAlreadyAdded ? ' — Added' : ''}
                      </option>
                    );
                  })}
                </select>
                <Button
                  type="button"
                  onClick={handleAddFaculty}
                  disabled={!pendingFacultyId}
                  variant="outline"
                  size="sm"
                  className="bg-indigo-50 text-indigo-700 border-indigo-300 hover:bg-indigo-100 font-bold shrink-0 flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Faculty</span>
                </Button>
              </div>

              {/* Selected Faculty List / Chips */}
              {selectedFaculties.length === 0 ? (
                <div className="p-4 bg-white rounded-lg border border-dashed border-slate-300 text-center text-slate-400 text-xs">
                  No faculty members selected yet. Choose a faculty member from the dropdown above and click "+ Add Faculty".
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 p-3 bg-white rounded-lg border border-slate-200 min-h-[50px]">
                  {selectedFaculties.map((fac) => (
                    <div
                      key={fac.id}
                      className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-900 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs"
                    >
                      <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                        {fac.name.charAt(0)}
                      </div>
                      <span>{fac.name}</span>
                      {fac.designation && (
                        <span className="text-[10px] text-indigo-600/80 font-normal">({fac.designation})</span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveFaculty(fac.id)}
                        className="ml-1 text-indigo-400 hover:text-rose-600 transition-colors p-0.5 rounded"
                        title={`Remove ${fac.name}`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-200">
            <div className="flex items-center gap-2 bg-indigo-50/60 p-2 rounded-xl border border-indigo-100 text-xs w-full sm:w-auto">
              <span className="text-slate-600 font-bold text-[11px] uppercase tracking-wider pl-1">Initial Visibility:</span>
              <button
                type="button"
                onClick={() => setFormStatus('Unpublished')}
                className={`px-3 py-1 rounded-lg font-extrabold text-xs transition-all ${
                  formStatus === 'Unpublished'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-300'
                }`}
              >
                Unpublished
              </button>
              <button
                type="button"
                onClick={() => setFormStatus('Published')}
                className={`px-3 py-1 rounded-lg font-extrabold text-xs transition-all ${
                  formStatus === 'Published'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-300'
                }`}
              >
                Published
              </button>
            </div>

            <div className="flex items-center justify-end gap-2.5 w-full sm:w-auto">
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
                className={formStatus === 'Published' ? 'bg-emerald-600 hover:bg-emerald-700 border-emerald-600 font-extrabold' : 'bg-indigo-600 hover:bg-indigo-700 font-extrabold'}
              >
                {formStatus === 'Published' ? (
                  <>
                    <Send className="w-4 h-4 mr-1.5" />
                    <span>{editingFormId ? 'Update & Publish' : 'Publish Form'}</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-4 h-4 mr-1.5" />
                    <span>{editingFormId ? 'Update Form' : 'Save Form'}</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
