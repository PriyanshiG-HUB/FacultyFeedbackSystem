import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { PublishFormIndexProps, PublishedFormItem } from '../../../types';
import { Card } from '../../../Components/ui/Card';
import { Button } from '../../../Components/ui/Button';
import { Input, Select } from '../../../Components/ui/Input';
import { Modal } from '../../../Components/ui/Modal';
import { StatusBadge } from '../../../Components/ui/StatusBadge';
import { StatCard } from '../../../Components/ui/StatCard';
import { getDepartmentName } from '../../../utils/departmentScope';
import { api } from '../../../lib/api';
import {
  Send,
  EyeOff,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Trash2,
  GraduationCap,
  BookOpen,
  User,
  Layers,
  Calendar,
  Sparkles,
  HelpCircle,
  FileCheck,
  RefreshCw,
  Filter,
  Upload,
  FileSpreadsheet,
  Download,
  FileText,
  ListPlus,
  CheckSquare,
  Square,
  Info,
} from 'lucide-react';

interface ParsedCustomQuestion {
  question: string;
  category?: string;
  question_type?: 'RATING' | 'TEXT' | 'BOTH' | 'MCQ';
  isSelected?: boolean;
}

export default function PublishForm({
  userRole = 'admin',
  assignedDepartmentCode = null,
  departmentName = 'Information Technology',
}: PublishFormIndexProps) {
  const isAdministrator = userRole === 'admin';
  const initialDeptFilter = !isAdministrator && assignedDepartmentCode ? assignedDepartmentCode.toUpperCase() : 'ALL';
  const [deptFilter, setDeptFilter] = useState<string>(initialDeptFilter);

  const [forms, setForms] = useState<PublishedFormItem[]>([]);
  const [teachingAssignments, setTeachingAssignments] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSemFilter, setSelectedSemFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');

  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string>('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | ''>('');
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<number | ''>('');
  const [windowStartDate, setWindowStartDate] = useState('');
  const [windowEndDate, setWindowEndDate] = useState('');

  // Question Source & Response Type Enhancement Fields
  const [questionSource, setQuestionSource] = useState<'EXISTING' | 'CUSTOM'>('EXISTING');
  const [responseType, setResponseType] = useState<'RATING' | 'TEXT' | 'BOTH'>('RATING');

  // Custom Question Import State
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isValidatingFile, setIsValidatingFile] = useState(false);
  const [importValidationReport, setImportValidationReport] = useState<{
    success: boolean;
    message: string;
    errors?: string[];
    parsed_questions?: ParsedCustomQuestion[];
  } | null>(null);
  const [customQuestionsList, setCustomQuestionsList] = useState<ParsedCustomQuestion[]>([]);

  const fetchFormsAndMetadata = useCallback(async () => {
    setIsLoading(true);
    setFetchError('');
    try {
      const [formsRes, assignmentsRes, deptsRes, ayRes, catRes] = await Promise.all([
        api.get('/feedback-forms'),
        api.get('/teaching-assignments'),
        api.get('/departments'),
        api.get('/academic-years'),
        api.get('/feedback-question-categories'),
      ]);

      if (Array.isArray(deptsRes.data)) setDepartments(deptsRes.data);
      if (Array.isArray(assignmentsRes.data)) setTeachingAssignments(assignmentsRes.data);
      if (Array.isArray(ayRes.data)) setAcademicYears(ayRes.data);
      if (Array.isArray(catRes.data)) setCategories(catRes.data);

      if (Array.isArray(formsRes.data)) {
        const mapped: PublishedFormItem[] = formsRes.data.map((f: any) => {
          const ta = f.teaching_assignment || {};
          return {
            id: String(f.id),
            numericId: f.id,
            assignmentId: f.teaching_assignment_id,
            title: f.title,
            academicYear: ta.academic_year?.year_code || '2025-26',
            semester: ta.semester?.semester_no || ta.semester_id || 5,
            departmentCode: ta.batch?.department?.department_code || ta.subject?.department?.department_code || 'IT',
            departmentName: ta.batch?.department?.department_name || ta.subject?.department?.department_name || 'Information Technology',
            division: ta.division?.division_code || 'All Divisions',
            section: ta.section?.section_code || 'All',
            batch: ta.batch?.batch_title || '2022-26',
            facultyId: String(ta.faculty_id || 'FAC'),
            facultyName: ta.faculty?.full_name || 'Faculty Member',
            facultyDesignation: ta.faculty?.designation?.designation_name || 'Faculty',
            subjectCode: ta.subject?.subject_code || 'SUB101',
            subjectName: ta.subject?.subject_name || 'Subject',
            questions: Array.isArray(f.questions) ? f.questions.map((q: any) => ({ id: q.id, statement: q.question_text })) : [],
            status: f.is_published ? 'Published' : 'Draft',
            createdBy: f.creator?.full_name || 'Administrator',
            createdAt: f.created_at ? new Date(f.created_at).toLocaleDateString() : 'Recent',
            publishedAt: f.published_at ? new Date(f.published_at).toLocaleDateString() : undefined,
          };
        });
        setForms(mapped);
      }
    } catch (err: any) {
      setFetchError(err.message || 'Failed to load feedback forms.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFormsAndMetadata();
  }, [fetchFormsAndMetadata]);

  // Synchronize department filter when assignedDepartmentCode changes
  useEffect(() => {
    if (!isAdministrator && assignedDepartmentCode) {
      setDeptFilter(assignedDepartmentCode.toUpperCase());
    }
  }, [isAdministrator, assignedDepartmentCode]);

  const availableTeachingAssignments = teachingAssignments.filter((ta) => {
    if (!isAdministrator && assignedDepartmentCode) {
      const deptCode = ta.batch?.department?.department_code || ta.subject?.department?.department_code;
      if (deptCode && deptCode.toUpperCase() !== assignedDepartmentCode.toUpperCase()) {
        return false;
      }
    }
    return true;
  });

  const handleOpenAddModal = () => {
    setFormError('');
    setFieldErrors({});
    setQuestionSource('EXISTING');
    setResponseType('RATING');
    setImportFile(null);
    setImportValidationReport(null);
    setCustomQuestionsList([]);

    const firstAssignment = availableTeachingAssignments[0] || teachingAssignments[0];
    setSelectedAssignmentId(firstAssignment?.id || '');
    setFormTitle(
      firstAssignment
        ? `Faculty Feedback — ${firstAssignment.subject?.subject_name || 'Course'} (${firstAssignment.faculty?.full_name || 'Faculty'})`
        : 'Faculty Feedback Survey'
    );
    setSelectedAcademicYearId(academicYears[0]?.id || '');
    const today = new Date().toISOString().split('T')[0];
    setWindowStartDate(today);
    const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setWindowEndDate(nextMonth);
    setIsModalOpen(true);
  };

  const handleAssignmentChange = (aId: number) => {
    setSelectedAssignmentId(aId);
    const chosen = teachingAssignments.find((a) => a.id === aId);
    if (chosen) {
      setFormTitle(`Faculty Feedback — ${chosen.subject?.subject_name} (${chosen.faculty?.full_name})`);
    }
  };

  // Handle custom file upload and validation
  const handleFileUploadAndValidate = async (file: File) => {
    setImportFile(file);
    setIsValidatingFile(true);
    setImportValidationReport(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/custom-feedback-questions/validate', formData);
      setImportValidationReport(res);

      if (res.success && Array.isArray(res.parsed_questions)) {
        const initialList = res.parsed_questions.map((q: any) => ({
          question: q.question,
          category: q.category || 'General',
          question_type: q.question_type || 'RATING',
          isSelected: true,
        }));
        setCustomQuestionsList(initialList);
      }
    } catch (err: any) {
      setImportValidationReport({
        success: false,
        message: err.message || 'File validation failed.',
        errors: [err.message || 'Invalid file format or network error.'],
      });
    } finally {
      setIsValidatingFile(false);
    }
  };

  // Toggle question selection
  const handleToggleQuestionSelection = (index: number) => {
    setCustomQuestionsList((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, isSelected: !item.isSelected } : item))
    );
  };

  // Download Sample Template
  const handleDownloadTemplate = () => {
    const csvContent = "question,category,question_type\n\"How clearly does the faculty explain core subject concepts?\",\"Clarity of Teaching\",\"RATING\"\n\"What specific teaching methods helped you understand the topics better?\",\"Teaching Methodology\",\"TEXT\"\n\"Rate the lab guidance and share your suggestions.\",\"Practical Guidance\",\"BOTH\"\n";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'custom_questions_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (questionSource === 'CUSTOM') {
      const selectedQs = customQuestionsList.filter((q) => q.isSelected);
      if (selectedQs.length === 0) {
        setFormError('Please upload and select at least one custom question.');
        return;
      }
    }

    setIsSubmitting(true);
    setFormError('');
    setFieldErrors({});

    try {
      const selectedQs = customQuestionsList.filter((q) => q.isSelected);

      const payload: any = {
        title: formTitle.trim(),
        teaching_assignment_id: Number(selectedAssignmentId),
        academic_year_id: Number(selectedAcademicYearId),
        window_start_date: windowStartDate,
        window_end_date: windowEndDate,
        question_source: questionSource,
        response_type: responseType,
        is_published: true,
      };

      if (questionSource === 'CUSTOM' && selectedQs.length > 0) {
        payload.questions = selectedQs.map((q, idx) => ({
          question_text: q.question,
          category: q.category || 'General',
          question_type: q.question_type || (responseType === 'TEXT' ? 'TEXT' : responseType === 'BOTH' ? 'BOTH' : 'RATING'),
          display_order: idx + 1,
          is_required: true,
        }));
      }

      await api.post('/feedback-forms', payload);

      // Optionally persist custom questions to bank if needed
      if (questionSource === 'CUSTOM' && selectedQs.length > 0) {
        api.post('/custom-feedback-questions/import', {
          questions: selectedQs.map((q) => ({
            question: q.question,
            category: q.category || 'General',
            question_type: q.question_type || 'RATING',
          })),
        }).catch(() => {});
      }

      await fetchFormsAndMetadata();
      setIsModalOpen(false);
    } catch (err: any) {
      if (err.status === 422 && err.errors) {
        setFieldErrors(err.errors);
      } else {
        setFormError(err.message || 'Failed to create and publish feedback form.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePublish = async (form: PublishedFormItem) => {
    try {
      if (form.status === 'Published') {
        await api.post(`/feedback-forms/${form.numericId || form.id}/unpublish`);
      } else {
        await api.post(`/feedback-forms/${form.numericId || form.id}/publish`);
      }
      await fetchFormsAndMetadata();
    } catch (err: any) {
      alert(err.message || 'Failed to update publication status.');
    }
  };

  const handleDeleteForm = async (form: PublishedFormItem) => {
    if (!confirm(`Are you sure you want to delete form "${form.title}"?`)) return;
    try {
      await api.delete(`/feedback-forms/${form.numericId || form.id}`);
      await fetchFormsAndMetadata();
    } catch (err: any) {
      alert(err.message || 'Cannot delete form. Student responses exist.');
    }
  };

  // Filter forms
  const filteredForms = forms.filter((f) => {
    if (!isAdministrator && assignedDepartmentCode) {
      if (f.departmentCode.toUpperCase() !== assignedDepartmentCode.toUpperCase()) return false;
    }
    if (isAdministrator && deptFilter !== 'ALL') {
      if (f.departmentCode.toUpperCase() !== deptFilter.toUpperCase()) return false;
    }
    if (selectedSemFilter !== 'ALL' && String(f.semester) !== selectedSemFilter) {
      return false;
    }
    if (selectedStatusFilter !== 'ALL' && f.status !== selectedStatusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        f.title.toLowerCase().includes(q) ||
        f.facultyName.toLowerCase().includes(q) ||
        f.subjectCode.toLowerCase().includes(q) ||
        f.subjectName.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const totalFormsCount = filteredForms.length;
  const publishedCount = filteredForms.filter((f) => f.status === 'Published').length;
  const draftCount = filteredForms.filter((f) => f.status === 'Draft').length;

  return (
    <AdminLayout
      title="Feedback Publishing"
      currentPath="#Admin/Feedback/PublishForm"
      userRole={userRole}
      departmentScope={isAdministrator ? 'All Departments' : getDepartmentName(assignedDepartmentCode)}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Feedback Form Lifecycle</h2>
          <p className="text-xs text-slate-500">
            Create, publish, and schedule student evaluation questionnaires with master or custom imported questions
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

          <Button variant="outline" size="sm" onClick={fetchFormsAndMetadata} disabled={isLoading}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button variant="primary" onClick={handleOpenAddModal}>
            <Plus className="w-4 h-4 mr-1.5" />
            Create &amp; Publish Form
          </Button>
        </div>
      </div>

      {fetchError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{fetchError}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Feedback Forms" value={totalFormsCount} icon="book-open" change="In selected scope" />
        <StatCard label="Active Published Forms" value={publishedCount} icon="check-circle" isPositive change="Live for students" />
        <StatCard label="Draft / Unpublished" value={draftCount} icon="clock" change="Awaiting publish" />
      </div>

      {/* Search & Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Input
              placeholder="Search forms by faculty, course, or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={selectedSemFilter}
              onChange={(e) => setSelectedSemFilter(e.target.value)}
              className="w-36 text-xs"
            >
              <option value="ALL">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={String(s)}>
                  Semester {s}
                </option>
              ))}
            </Select>

            <Select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="w-36 text-xs"
            >
              <option value="ALL">All Statuses</option>
              <option value="Published">Published Only</option>
              <option value="Draft">Draft Only</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Form List */}
      <div className="space-y-4">
        {filteredForms.length > 0 ? (
          filteredForms.map((form) => (
            <Card key={form.id} className="hover:border-blue-300 transition-all">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 bg-blue-50 border border-blue-200 rounded text-blue-700">
                      {form.subjectCode}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">{form.title}</h3>
                    <StatusBadge status={form.status} />
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <strong className="text-slate-800">{form.facultyName}</strong> ({form.facultyDesignation})
                    </span>
                    <span>&bull;</span>
                    <span className="inline-flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                      Batch: <strong>{form.batch}</strong> (Sem {form.semester})
                    </span>
                    <span>&bull;</span>
                    <span className="inline-flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      {form.division} &bull; Section: {form.section || 'All'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTogglePublish(form)}
                    className={form.status === 'Published' ? 'text-amber-700 border-amber-200 hover:bg-amber-50' : 'text-emerald-700 border-emerald-200 hover:bg-emerald-50'}
                  >
                    {form.status === 'Published' ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5 mr-1" />
                        Unpublish
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 mr-1" />
                        Publish Now
                      </>
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteForm(form)}
                    className="text-rose-600 hover:bg-rose-50"
                    title="Delete Form"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="p-12 text-center text-slate-400 bg-white border border-slate-200 rounded-xl">
            <BookOpen className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-slate-700">No Feedback Forms Found</p>
            <p className="text-xs text-slate-500 mt-1">Create and publish forms for active teaching assignments above.</p>
          </div>
        )}
      </div>

      {/* Create Form Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Feedback Form" maxWidth="2xl">
        <form onSubmit={handleCreateForm} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <Select
            label="Select Teaching Session Assignment *"
            value={selectedAssignmentId}
            onChange={(e) => handleAssignmentChange(Number(e.target.value))}
            error={fieldErrors.teaching_assignment_id?.[0]}
            required
          >
            {availableTeachingAssignments.map((a) => (
              <option key={a.id} value={a.id}>
                {a.subject?.subject_code} &mdash; {a.subject?.subject_name} &bull; {a.faculty?.full_name} ({a.batch?.batch_title}, Sem {a.semester_id || a.semester?.semester_no})
              </option>
            ))}
          </Select>

          <Input
            label="Feedback Form Survey Title *"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            error={fieldErrors.title?.[0]}
            required
          />

          <Select
            label="Academic Year *"
            value={selectedAcademicYearId}
            onChange={(e) => setSelectedAcademicYearId(Number(e.target.value))}
            error={fieldErrors.academic_year_id?.[0]}
            required
          >
            {academicYears.map((ay) => (
              <option key={ay.id} value={ay.id}>
                {ay.year_code}
              </option>
            ))}
          </Select>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Evaluation Window Start Date"
              type="date"
              value={windowStartDate}
              onChange={(e) => setWindowStartDate(e.target.value)}
              error={fieldErrors.window_start_date?.[0]}
            />
            <Input
              label="Evaluation Window End Date"
              type="date"
              value={windowEndDate}
              onChange={(e) => setWindowEndDate(e.target.value)}
              error={fieldErrors.window_end_date?.[0]}
            />
          </div>

          {/* ========================================================================= */}
          {/* ENHANCEMENT 1: QUESTION SOURCE SELECTION */}
          {/* ========================================================================= */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <label className="block text-xs font-bold text-slate-800">
              Question Source *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setQuestionSource('EXISTING')}
                className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  questionSource === 'EXISTING'
                    ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20 text-blue-900 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <BookOpen className={`w-5 h-5 shrink-0 mt-0.5 ${questionSource === 'EXISTING' ? 'text-blue-600' : 'text-slate-400'}`} />
                <div>
                  <div className="text-xs font-extrabold">Option A &ndash; Use Existing Questions</div>
                  <div className="text-[11px] opacity-80 leading-tight mt-0.5">
                    Use master database criteria (Subject Knowledge, Clarity, Punctuality, Material).
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setQuestionSource('CUSTOM')}
                className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  questionSource === 'CUSTOM'
                    ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-900 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <FileSpreadsheet className={`w-5 h-5 shrink-0 mt-0.5 ${questionSource === 'CUSTOM' ? 'text-indigo-600' : 'text-slate-400'}`} />
                <div>
                  <div className="text-xs font-extrabold">Option B &ndash; Import Custom Questions</div>
                  <div className="text-[11px] opacity-80 leading-tight mt-0.5">
                    Upload questions from CSV or Excel (.xlsx) file into isolated table.
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* ENHANCEMENT 2: CUSTOM QUESTION IMPORT SECTION (When Option B is selected) */}
          {/* ========================================================================= */}
          {questionSource === 'CUSTOM' && (
            <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-indigo-950 flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-indigo-600" />
                  Upload Custom Questions File (CSV / .xlsx)
                </span>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="text-[11px] text-indigo-700 hover:underline font-bold flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Sample Template
                </button>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls,.txt"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileUploadAndValidate(f);
                  }}
                  className="block w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
                />
              </div>

              {isValidatingFile && (
                <p className="text-xs text-indigo-700 font-semibold flex items-center gap-1.5 animate-pulse">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Validating file format and parsing question rows...
                </p>
              )}

              {/* Validation Feedback & Error Messages */}
              {importValidationReport && (
                <div
                  className={`p-3 rounded-lg text-xs space-y-1 font-medium ${
                    importValidationReport.success
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      : 'bg-rose-50 text-rose-900 border border-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    {importValidationReport.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>{importValidationReport.message}</span>
                  </div>

                  {importValidationReport.errors && importValidationReport.errors.length > 0 && (
                    <ul className="list-disc list-inside space-y-0.5 text-[11px] text-rose-700 pl-4 font-normal">
                      {importValidationReport.errors.map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Parsed Custom Questions List Preview */}
              {customQuestionsList.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-indigo-100">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span>Parsed Custom Questions ({customQuestionsList.length})</span>
                    <span className="text-[11px] text-indigo-700 font-semibold">
                      {customQuestionsList.filter((q) => q.isSelected).length} Selected for Form
                    </span>
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                    {customQuestionsList.map((q, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleToggleQuestionSelection(idx)}
                        className={`p-2.5 rounded-lg border text-xs cursor-pointer flex items-start gap-2.5 transition-all ${
                          q.isSelected
                            ? 'bg-white border-indigo-300 shadow-2xs'
                            : 'bg-slate-50/80 border-slate-200 opacity-60'
                        }`}
                      >
                        <button type="button" className="mt-0.5 shrink-0 text-indigo-600">
                          {q.isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-400" />}
                        </button>
                        <div className="flex-1 space-y-0.5">
                          <p className="font-semibold text-slate-900 leading-tight">{q.question}</p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500">
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded font-mono">{q.category || 'General'}</span>
                            <span>&bull;</span>
                            <span className="font-bold text-indigo-700">{q.question_type || 'RATING'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* ENHANCEMENT 3: RESPONSE TYPE SELECTION */}
          {/* ========================================================================= */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <label className="block text-xs font-bold text-slate-800">
              Feedback Response Type *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setResponseType('RATING')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between gap-1 transition-all ${
                  responseType === 'RATING'
                    ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20 text-blue-900 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-extrabold">
                  <CheckCircle2 className={`w-4 h-4 ${responseType === 'RATING' ? 'text-blue-600' : 'text-slate-400'}`} />
                  Rating Based
                </div>
                <div className="text-[10px] opacity-80 leading-tight">
                  Strongly Disagree &rarr; Strongly Agree (1 to 5 scale)
                </div>
              </button>

              <button
                type="button"
                onClick={() => setResponseType('TEXT')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between gap-1 transition-all ${
                  responseType === 'TEXT'
                    ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-900 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-extrabold">
                  <FileText className={`w-4 h-4 ${responseType === 'TEXT' ? 'text-indigo-600' : 'text-slate-400'}`} />
                  Text Based
                </div>
                <div className="text-[10px] opacity-80 leading-tight">
                  Open-ended textarea response boxes for qualitative feedback
                </div>
              </button>

              <button
                type="button"
                onClick={() => setResponseType('BOTH')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between gap-1 transition-all ${
                  responseType === 'BOTH'
                    ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-500/20 text-purple-900 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-extrabold">
                  <ListPlus className={`w-4 h-4 ${responseType === 'BOTH' ? 'text-purple-600' : 'text-slate-400'}`} />
                  Both
                </div>
                <div className="text-[10px] opacity-80 leading-tight">
                  Contains both Rating questions + Text questions
                </div>
              </button>
            </div>
          </div>

          {questionSource === 'EXISTING' && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Standard evaluation criteria questions (Subject Knowledge, Clarity, Punctuality, etc.) will be attached automatically with {responseType.toLowerCase()} response format.</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Save &amp; Publish Form'}
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
