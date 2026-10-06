import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import {
  FeedbackImportIndexProps,
  FeedbackImportItem,
  DatasetDefinition,
  ValidationReport,
  ImportExecutionResult,
} from '../../../types';
import { Card } from '../../../Components/ui/Card';
import { Button } from '../../../Components/ui/Button';
import { StatusBadge } from '../../../Components/ui/StatusBadge';
import { DataTable, Column } from '../../../Components/ui/DataTable';
import { Input } from '../../../Components/ui/Input';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Download,
  Database,
  Layers,
  ArrowRight,
  AlertTriangle,
  FileCheck,
  RefreshCw,
  Info,
  Check,
  Search,
  Filter,
  ShieldCheck,
  BookOpen,
  Users,
  GraduationCap,
  Settings,
} from 'lucide-react';

// Error Boundary Fallback Wrapper to ensure the UI NEVER goes blank
class UIErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
  > {
    constructor(props: { children: React.ReactNode }) {
      super(props);
      this.state = { hasError: false, error: null };
    }

  static getDerivedStateFromError(error: Error) {
      return { hasError: true, error };
    }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      console.error('DataImport UI Error Boundary caught an exception:', error, errorInfo);
    }

  render() {
      if (this.state.hasError) {
        return (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 my-6 shadow-sm">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-rose-600 shrink-0" />
            <div>
              <h3 className="font-extrabold text-base">Data Import Interface Encountered a Render Issue</h3>
              <p className="text-xs text-rose-700 mt-1">
                {this.state.error?.message || 'An unexpected rendering error occurred. You can reset the interface below.'}
                </p>
              </div>
            </div>
          <div className="mt-4 flex gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
            >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Reload Import Center
            </Button>
          </div>
        </div>
      );
      }
      return this.props.children;
    }
  }

// Comprehensive fallback dataset definitions matching Laravel DatasetImportRegistry
const ALL_DATASETS: DatasetDefinition[] = [
  {
    key: 'department',
    name: 'Departments',
    description: 'Import academic departments and departmental details.',
    table: 'department',
    dependencies: [],
    excluded_columns: ['id', 'created_at', 'updated_at', 'hod_faculty_id'],
    columns: [
      { name: 'department_code', required: true, type: 'Text', description: 'Unique department code (e.g. IT, CE, CSE)', example: 'IT' },
      { name: 'department_name', required: true, type: 'Text', description: 'Full official department name', example: 'Information Technology' },
      { name: 'status', required: false, type: 'Enum', description: 'ACTIVE or INACTIVE (Default: ACTIVE)', example: 'ACTIVE' },
    ],
  },
  {
    key: 'designation',
    name: 'Designations',
    description: 'Import faculty academic designations and positions.',
    table: 'designation',
    dependencies: [],
    excluded_columns: ['id'],
    columns: [
      { name: 'designation_name', required: true, type: 'Text', description: 'Faculty rank or title', example: 'Assistant Professor' },
      { name: 'status', required: false, type: 'Enum', description: 'ACTIVE or INACTIVE (Default: ACTIVE)', example: 'ACTIVE' },
    ],
  },
  {
    key: 'academic_year',
    name: 'Academic Years',
    description: 'Import academic calendar session terms.',
    table: 'academic_year',
    dependencies: [],
    excluded_columns: ['id', 'created_at', 'updated_at'],
    columns: [
      { name: 'year_code', required: true, type: 'Text', description: 'Unique academic year identifier (e.g. 2026-2027)', example: '2026-2027' },
      { name: 'title', required: false, type: 'Text', description: 'Display title for academic session', example: 'Academic Year 2026-2027' },
      { name: 'start_date', required: false, type: 'Date', description: 'Start date (YYYY-MM-DD)', example: '2026-07-01' },
      { name: 'end_date', required: false, type: 'Date', description: 'End date (YYYY-MM-DD)', example: '2027-06-30' },
      { name: 'status', required: false, type: 'Enum', description: 'PLANNED, ACTIVE, or CLOSED', example: 'ACTIVE' },
    ],
  },
  {
    key: 'semester',
    name: 'Semesters',
    description: 'Import academic term numbers and terms.',
    table: 'semester',
    dependencies: [],
    excluded_columns: ['id'],
    columns: [
      { name: 'semester_no', required: true, type: 'Number', description: 'Semester number (1-8)', example: '1' },
      { name: 'term', required: false, type: 'Enum', description: 'ODD or EVEN (Default: ODD)', example: 'ODD' },
    ],
  },
  {
    key: 'batch',
    name: 'Batches',
    description: 'Import student academic program cohorts / batches.',
    table: 'batch',
    dependencies: ['Departments'],
    dependency_notice: 'Before importing Batches: Make sure the target Departments exist in the system.',
    excluded_columns: ['id', 'department_id', 'current_semester_id', 'created_at', 'updated_at'],
    columns: [
      { name: 'batch_title', required: true, type: 'Text', description: 'Unique title for cohort (e.g. 2024-2028)', example: '2024-2028' },
      { name: 'department_code', required: true, type: 'Text', description: 'Department code', example: 'CSE' },
      { name: 'start_year', required: false, type: 'Number', description: 'Admission year (e.g. 2024)', example: '2024' },
      { name: 'end_year', required: false, type: 'Number', description: 'Graduation year (e.g. 2028)', example: '2028' },
      { name: 'current_semester_no', required: false, type: 'Number', description: 'Current semester number (1-8)', example: '1' },
      { name: 'status', required: false, type: 'Enum', description: 'ACTIVE or GRADUATED', example: 'ACTIVE' },
    ],
  },
  {
    key: 'division',
    name: 'Divisions',
    description: 'Import class divisions for student cohorts.',
    table: 'division',
    dependencies: ['Batches', 'Departments'],
    dependency_notice: 'Before importing Divisions: Make sure the required Departments and Batches exist.',
    excluded_columns: ['id', 'department_id', 'batch_id', 'semester_id', 'created_at', 'updated_at'],
    columns: [
      { name: 'division_code', required: true, type: 'Text', description: 'Division identifier (e.g. A, B, Div-1)', example: 'A' },
      { name: 'batch_title', required: true, type: 'Text', description: 'Batch title (e.g. 2024-2028)', example: '2024-2028' },
      { name: 'department_code', required: true, type: 'Text', description: 'Department code', example: 'CSE' },
      { name: 'semester_no', required: false, type: 'Number', description: 'Semester number (1-8)', example: '1' },
      { name: 'status', required: false, type: 'Enum', description: 'ACTIVE or INACTIVE', example: 'ACTIVE' },
    ],
  },
  {
    key: 'section',
    name: 'Sections',
    description: 'Import division practical lab sections.',
    table: 'section',
    dependencies: ['Divisions'],
    dependency_notice: 'Before importing Sections: Make sure the parent Division and Batch exist.',
    excluded_columns: ['id', 'division_id', 'created_at', 'updated_at'],
    columns: [
      { name: 'section_code', required: true, type: 'Text', description: 'Section code (e.g. S1, Lab-A)', example: 'S1' },
      { name: 'division_code', required: true, type: 'Text', description: 'Parent division code (e.g. A)', example: 'A' },
      { name: 'batch_title', required: true, type: 'Text', description: 'Batch title for division lookup', example: '2024-2028' },
      { name: 'status', required: false, type: 'Enum', description: 'ACTIVE or INACTIVE', example: 'ACTIVE' },
    ],
  },
  {
    key: 'faculty',
    name: 'Faculty Members',
    description: 'Import faculty members and their departmental affiliations.',
    table: 'faculty',
    dependencies: ['Departments', 'Designations'],
    dependency_notice: 'Before importing Faculty: Make sure the required Departments and Designations exist.',
    excluded_columns: ['id', 'user_account_id', 'department_id', 'designation_id', 'created_at', 'updated_at'],
    columns: [
      { name: 'full_name', required: true, type: 'Text', description: 'Full name of faculty member', example: 'Dr. Jane Smith' },
      { name: 'email', required: true, type: 'Email', description: 'Faculty email address (used for portal login)', example: 'jane.smith@college.edu' },
      { name: 'department_code', required: true, type: 'Text', description: 'Department code', example: 'CSE' },
      { name: 'designation', required: false, type: 'Text', description: 'Faculty designation / title', example: 'Professor' },
      { name: 'mobile', required: false, type: 'Text', description: 'Mobile phone number', example: '+91 9876543210' },
      { name: 'status', required: false, type: 'Enum', description: 'ACTIVE or INACTIVE', example: 'ACTIVE' },
    ],
  },
  {
    key: 'student',
    name: 'Students',
    description: 'Import student rosters with complete cohort hierarchy.',
    table: 'student',
    dependencies: ['Departments', 'Batches', 'Divisions', 'Sections'],
    dependency_notice: 'Before importing Students: Make sure the required Departments, Batches, Divisions, and Sections exist in the system.',
    excluded_columns: ['id', 'user_account_id', 'department_id', 'batch_id', 'division_id', 'section_id', 'created_at', 'updated_at'],
    columns: [
      { name: 'roll_no', required: true, type: 'Text', description: 'Unique student roll number', example: 'CS2024001' },
      { name: 'full_name', required: true, type: 'Text', description: 'Full name of student', example: 'John Student' },
      { name: 'department_code', required: true, type: 'Text', description: 'Department code', example: 'CSE' },
      { name: 'batch_title', required: true, type: 'Text', description: 'Batch title', example: '2024-2028' },
      { name: 'division_code', required: false, type: 'Text', description: 'Optional division code', example: 'A' },
      { name: 'section_code', required: false, type: 'Text', description: 'Optional section code', example: 'S1' },
      { name: 'enrollment_no', required: false, type: 'Text', description: 'University enrollment number', example: 'EN2024001' },
      { name: 'email', required: false, type: 'Email', description: 'Student email address', example: 'john.student@college.edu' },
      { name: 'mobile', required: false, type: 'Text', description: 'Mobile number', example: '+91 9876543211' },
      { name: 'status', required: false, type: 'Enum', description: 'ACTIVE, INACTIVE, or GRADUATED', example: 'ACTIVE' },
    ],
  },
  {
    key: 'subject',
    name: 'Subjects / Courses',
    description: 'Import curriculum subjects and courses.',
    table: 'subject',
    dependencies: ['Departments', 'Semesters'],
    dependency_notice: 'Before importing Subjects: Make sure target Departments exist.',
    excluded_columns: ['id', 'department_id', 'semester_id', 'created_at', 'updated_at'],
    columns: [
      { name: 'subject_code', required: true, type: 'Text', description: 'Unique subject code (e.g. CS501)', example: 'CS501' },
      { name: 'subject_name', required: true, type: 'Text', description: 'Full course / subject name', example: 'Data Structures & Algorithms' },
      { name: 'department_code', required: true, type: 'Text', description: 'Offering department code', example: 'CSE' },
      { name: 'semester_no', required: true, type: 'Number', description: 'Semester number (1-8)', example: '5' },
      { name: 'course_type', required: false, type: 'Enum', description: 'CORE or ELECTIVE (Default: CORE)', example: 'CORE' },
      { name: 'credits', required: false, type: 'Number', description: 'Course credit weight (e.g. 4.0)', example: '4.0' },
      { name: 'status', required: false, type: 'Enum', description: 'ACTIVE or INACTIVE', example: 'ACTIVE' },
    ],
  },
  {
    key: 'subject_offering',
    name: 'Subject Offerings (Electives)',
    description: 'Import elective course offerings for student batches.',
    table: 'subject_offering',
    dependencies: ['Subjects', 'Batches', 'Academic Years'],
    dependency_notice: 'Before importing Elective Offerings: Ensure the Subject, Batch, and Academic Year exist.',
    excluded_columns: ['id', 'subject_id', 'batch_id', 'academic_year_id', 'created_at', 'updated_at'],
    columns: [
      { name: 'subject_code', required: true, type: 'Text', description: 'Elective subject code', example: 'CS501' },
      { name: 'batch_title', required: true, type: 'Text', description: 'Target batch title', example: '2024-2028' },
      { name: 'year_code', required: true, type: 'Text', description: 'Academic year code', example: '2026-2027' },
      { name: 'enrollment_capacity', required: false, type: 'Number', description: 'Maximum capacity (Default: 60)', example: '60' },
      { name: 'status', required: false, type: 'Enum', description: 'OPEN or CLOSED', example: 'OPEN' },
    ],
  },
  {
    key: 'teaching_assignment',
    name: 'Faculty-Course Allocations',
    description: 'Import teaching allocations mapping Faculty to Subjects and Classes.',
    table: 'teaching_assignment',
    dependencies: ['Faculty', 'Subjects', 'Batches', 'Academic Years', 'Semesters'],
    dependency_notice: 'Before importing Teaching Assignments: Make sure Faculty, Subjects, Batches, and Academic Years exist.',
    excluded_columns: ['id', 'subject_id', 'faculty_id', 'batch_id', 'division_id', 'section_id', 'academic_year_id', 'semester_id', 'created_at', 'updated_at'],
    columns: [
      { name: 'subject_code', required: true, type: 'Text', description: 'Subject code', example: 'CS501' },
      { name: 'faculty_email', required: true, type: 'Email', description: 'Faculty email address', example: 'jane.smith@college.edu' },
      { name: 'batch_title', required: true, type: 'Text', description: 'Batch title', example: '2024-2028' },
      { name: 'year_code', required: true, type: 'Text', description: 'Academic year code', example: '2026-2027' },
      { name: 'semester_no', required: true, type: 'Number', description: 'Semester number (1-8)', example: '5' },
      { name: 'division_code', required: false, type: 'Text', description: 'Optional division code', example: 'A' },
      { name: 'section_code', required: false, type: 'Text', description: 'Optional section code', example: 'S1' },
      { name: 'status', required: false, type: 'Enum', description: 'ACTIVE or INACTIVE', example: 'ACTIVE' },
    ],
  },
  {
    key: 'student_elective_enrollment',
    name: 'Student Elective Enrollments',
    description: 'Import student elective course enrollments.',
    table: 'student_elective_enrollment',
    dependencies: ['Students', 'Subject Offerings'],
    dependency_notice: 'Before importing Elective Enrollments: Ensure Student and Subject Offering exist.',
    excluded_columns: ['id', 'student_id', 'subject_offering_id', 'enrolled_at', 'created_at', 'updated_at'],
    columns: [
      { name: 'roll_no', required: true, type: 'Text', description: 'Student roll number', example: 'CS2024001' },
      { name: 'subject_code', required: true, type: 'Text', description: 'Elective subject code', example: 'CS501' },
      { name: 'batch_title', required: true, type: 'Text', description: 'Offering batch title', example: '2024-2028' },
      { name: 'year_code', required: true, type: 'Text', description: 'Academic year code', example: '2026-2027' },
      { name: 'status', required: false, type: 'Enum', description: 'ENROLLED or DROPPED', example: 'ENROLLED' },
    ],
  },
  {
    key: 'feedback_question_category',
    name: 'Question Categories',
    description: 'Import categories for organizing feedback evaluation questions.',
    table: 'feedback_question_category',
    dependencies: [],
    excluded_columns: ['id'],
    columns: [
      { name: 'category_name', required: true, type: 'Text', description: 'Category display title', example: 'Teaching & Pedagogy' },
      { name: 'display_order', required: false, type: 'Number', description: 'Display sequence order number', example: '1' },
    ],
  },
  {
    key: 'feedback_question',
    name: 'Feedback Questions',
    description: 'Import evaluation questions for feedback forms.',
    table: 'feedback_question',
    dependencies: ['Feedback Forms', 'Question Categories'],
    dependency_notice: 'Before importing Questions: Make sure the target Feedback Forms exist in the system.',
    excluded_columns: ['id', 'created_at', 'updated_at'],
    columns: [
      { name: 'feedback_form_id', required: true, type: 'Number/Text', description: 'ID or Form Code of target feedback form', example: '1' },
      { name: 'question_text', required: true, type: 'Text', description: 'Evaluation question prompt text', example: 'Does the faculty arrive on time for lectures?' },
      { name: 'category_id', required: false, type: 'Number/Text', description: 'Category ID or category name', example: '1' },
      { name: 'question_type', required: false, type: 'Enum', description: 'RATING, TEXT, or CHOICE (Default: RATING)', example: 'RATING' },
      { name: 'is_required', required: false, type: 'Boolean', description: '1/0 or true/false (Default: 1)', example: '1' },
      { name: 'max_rating', required: false, type: 'Number', description: 'Maximum rating scale value (Default: 5)', example: '5' },
      { name: 'display_order', required: false, type: 'Number', description: 'Display sequence order number (Default: 1)', example: '1' },
    ],
  },
];

export function FeedbackImportContent({ recentImports }: FeedbackImportIndexProps) {
  const [datasets, setDatasets] = useState<DatasetDefinition[]>(ALL_DATASETS);
  const [selectedDatasetKey, setSelectedDatasetKey] = useState<string>('student');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null);

  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importResult, setImportResult] = useState<ImportExecutionResult | null>(null);
  const [importLogs, setImportLogs] = useState<FeedbackImportItem[]>(recentImports || []);

  const selectedDataset = datasets.find((d) => d.key === selectedDatasetKey) || datasets[0] || ALL_DATASETS[0];

  // Fetch dataset definitions and import logs from Laravel API
  useEffect(() => {
    let isMounted = true;

    import('../../../lib/api').then(({api}) => {
      api.get('/data-imports/datasets')
        .then((res) => {
          if (!isMounted) return;
          const apiData = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : null);
          if (apiData && apiData.length > 0) {
            const mapped: DatasetDefinition[] = apiData.map((d: any) => {
              const fallback = ALL_DATASETS.find((fd) => fd.key === d.key);
              return {
                key: d.key,
                name: d.name || d.title || fallback?.name || d.key,
                description: d.description || fallback?.description || `Import ${d.key} records`,
                table: d.table || fallback?.table || d.key,
                dependencies: d.dependencies || fallback?.dependencies || [],
                dependency_notice: d.dependency_notice || fallback?.dependency_notice || null,
                excluded_columns: d.excluded_columns || fallback?.excluded_columns || ['id'],
                columns: Array.isArray(d.columns)
                  ? d.columns.map((c: any) =>
                    typeof c === 'string'
                    ? {name: c, required: (d.required || []).includes(c), type: 'Text', description: c, example: '' }
                    : c
                    )
                  : (fallback?.columns || []),
              };
            });
            setDatasets(mapped);
          }
        })
        .catch(() => { });

      api.get('/data-import-logs')
        .then((res) => {
          if (!isMounted) return;
          const rawLogs = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
          if (rawLogs.length > 0) {
            const mapped: FeedbackImportItem[] = rawLogs.map((log: any) => ({
              id: log.id,
              fileName: log.file_name || 'import.csv',
              uploadedBy: log.uploaded_by_user_account?.email || 'System Admin',
              recordCount: log.record_count || 0,
              status: log.status === 'SUCCESS' ? 'Success' : 'Failed',
              date: log.uploaded_at
                ? new Date(log.uploaded_at).toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric' })
                : 'Recent',
              dataset: log.import_type ? log.import_type.replace(/_/g, ' ') : 'DATASET',
            }));
            setImportLogs(mapped);
          }
        })
        .catch(() => { });
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter datasets by category and search
  const filteredDatasets = datasets.filter((ds) => {
    const matchesSearch =
      ds.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ds.table.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ds.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (categoryFilter === 'hierarchy') {
      return ['department', 'designation', 'academic_year', 'semester'].includes(ds.key);
    }
    if (categoryFilter === 'rosters') {
      return ['batch', 'division', 'section', 'faculty', 'student'].includes(ds.key);
    }
    if (categoryFilter === 'academics') {
      return ['subject', 'subject_offering', 'teaching_assignment', 'student_elective_enrollment', 'feedback_question'].includes(ds.key);
    }
    if (categoryFilter === 'config') {
      return ['feedback_question_category', 'feedback_question'].includes(ds.key);
    }
    return true;
  });

  // Handle dataset selection
  const handleSelectDataset = (key: string) => {
    setSelectedDatasetKey(key);
    setSelectedFile(null);
    setValidationReport(null);
    setImportResult(null);
  };

  // Handle File Change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setValidationReport(null);
      setImportResult(null);
    }
  };

  // Template Download Handler
  const handleDownloadTemplate = async (format: 'csv' | 'xlsx') => {
    try {
      const {buildApiUrl} = await import('../../../lib/api');
      const response = await fetch(`${buildApiUrl(`/data-imports/template/${selectedDatasetKey}`).url}?format=${format}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('sanctum_token') || ''}`,
        },
      });

      if (!response.ok) {
        throw new Error('Template API download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedDatasetKey}_template.${format === 'xlsx' ? 'xlsx' : 'csv'}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      // Client-side fallback CSV template generation
      const headers = selectedDataset.columns.map((c) => c.name).join(',');
      const sample = selectedDataset.columns.map((c) => c.example || '').join(',');
      const csvContent = `data:text/csv;charset=utf-8,${headers}\n${sample}`;
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `${selectedDatasetKey}_template.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  };

  // Client-side CSV Parser Helper with Quotes Support & Key Normalization
  const parseCsvText = (text: string) => {
    const lines = text.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) return [];

    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' || char === "'") {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim().replace(/^["']|["']$/g, ''));
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim().replace(/^["']|["']$/g, ''));
      return result;
    };

    const aliasMap: Record<string, string> = {
      batch: 'batch_title',
      batch_name: 'batch_title',
      cohort: 'batch_title',
      batch_code: 'batch_title',
      start: 'start_year',
      admission_year: 'start_year',
      end: 'end_year',
      graduation_year: 'end_year',
      current_semester: 'current_semester_no',
      current_semester_id: 'current_semester_no',
      semester: 'current_semester_no',
      semester_num: 'current_semester_no',
      semester_number: 'semester_no',
      sem: 'semester_no',
      sem_no: 'semester_no',
      dept: 'department_code',
      dept_code: 'department_code',
      department: 'department_code',
      department_title: 'department_name',
      dept_name: 'department_name',
      designation_title: 'designation_name',
      role: 'designation_name',
      rank: 'designation_name',
      year: 'year_code',
      academic_year: 'year_code',
      session: 'year_code',
      academic_session: 'year_code',
      div: 'division_code',
      division: 'division_code',
      sec: 'section_code',
      section: 'section_code',
      name: 'full_name',
      student_name: 'full_name',
      faculty_name: 'full_name',
      user_name: 'full_name',
      email_address: 'email',
      mail: 'email',
      faculty_mail: 'faculty_email',
      roll: 'roll_no',
      roll_number: 'roll_no',
      student_id: 'roll_no',
      enrollment: 'enrollment_no',
      enrollment_number: 'enrollment_no',
      phone: 'mobile',
      phone_number: 'mobile',
      contact: 'mobile',
      subject: 'subject_code',
      course: 'subject_code',
      course_code: 'subject_code',
      subject_title: 'subject_name',
      course_name: 'subject_name',
      category: 'category_name',
      category_title: 'category_name',
      form_id: 'feedback_form_id',
      form: 'feedback_form_id',
      form_code: 'feedback_form_id',
      question: 'question_text',
      text: 'question_text',
      prompt: 'question_text',
      type: 'question_type',
      required: 'is_required',
      rating_max: 'max_rating',
      order: 'display_order',
      sequence: 'display_order',
    };

    const rawHeaders = parseLine(lines[0]);
    const headers = rawHeaders.map((h) => {
      let clean = h.trim().toLowerCase().replace(/[\s-]+/g, '_').replace(/[^a-z0-9_]/g, '');
      return aliasMap[clean] || clean;
    });

    const rows: Record<string, string>[] = [];
    for (let i = 1; i < lines.length; i++) {
      const currentline = parseLine(lines[i]);
      if (currentline.length === 1 && currentline[0] === '') continue;
      const obj: Record<string, string> = { };
      headers.forEach((h, index) => {
        if (h) {
          obj[h] = currentline[index] || '';
        }
      });
      rows.push(obj);
    }
    return rows;
  };

  // Execute File Validation
  const handleValidateFile = async () => {
    if (!selectedFile) return;

    setIsValidating(true);
    setValidationReport(null);

    try {
      const {api} = await import('../../../lib/api');
      const formData = new FormData();
      formData.append('dataset_key', selectedDatasetKey);
      formData.append('file', selectedFile);

      // Call Laravel Validation API
      const res = await api.postForm('/data-imports/validate', formData, {timeoutMs: 120000 });

      if (res && typeof res === 'object') {
        const rawErrors = Array.isArray(res.errors) ? res.errors : [];
        const normalizedErrors = rawErrors.map((err: any, idx: number) => {
          if (typeof err === 'string') {
            return {row: idx + 1, column: 'file', error: err, value: '-' };
          }
          return {
            row: err.row ?? idx + 1,
            column: err.column ?? 'general',
            error: err.error ?? String(err),
            value: err.value ?? '-',
          };
        });

        const rawPreview = Array.isArray(res.preview_rows) ? res.preview_rows : [];
        const normalizedPreviewRows = rawPreview.map((p: any, i: number) => ({
          row: p.row ?? i + 1,
          data: typeof p.data === 'object' && p.data !== null ? p.data : (p.data ? {val: String(p.data) } : { }),
          isValid: Boolean(p.isValid),
          status: p.status ? String(p.status) : (p.isValid ? 'Valid' : 'Invalid'),
        }));

        const validRows = Array.isArray(res.valid_rows) ? res.valid_rows : [];

        setValidationReport({
          success: res.success ?? true,
          dataset: res.dataset || selectedDataset.name,
          total_rows: Number(res.total_rows ?? normalizedPreviewRows.length),
          valid_rows_count: Number(res.valid_rows_count ?? validRows.length),
          invalid_rows_count: Number(res.invalid_rows_count ?? (normalizedPreviewRows.length - validRows.length)),
          errors: normalizedErrors,
          preview_rows: normalizedPreviewRows,
          valid_rows: validRows,
          raw_rows: res.raw_rows || [],
        });
      } else {
        throw new Error('Fallback to local validation');
      }
    } catch {
      // Local CSV parsing fallback
      try {
        const text = await selectedFile.text();
        const rows = parseCsvText(text);

        const reqCols = selectedDataset.columns.filter((c) => c.required).map((c) => c.name);
        const errors: any[] = [];
        const previewRows: any[] = [];
        const validRows: any[] = [];

        rows.forEach((row, i) => {
          const rowNo = i + 1;
          let rowValid = true;

          reqCols.forEach((col) => {
            const val = row[col] || row[col.replace(/_/g, '')];
            if (!val || String(val).trim() === '') {
              rowValid = false;
              errors.push({
                row: rowNo,
                column: col,
                error: `Required column '${col}' is missing or empty.`,
                value: row[col] || '-',
              });
            }
          });

          if (rowValid) {
            validRows.push(row);
          }

          previewRows.push({
            row: rowNo,
            data: row,
            isValid: rowValid,
            status: rowValid ? 'Valid' : 'Invalid Data',
          });
        });

        setValidationReport({
          success: true,
          dataset: selectedDataset.name,
          total_rows: rows.length,
          valid_rows_count: validRows.length,
          invalid_rows_count: rows.length - validRows.length,
          errors,
          preview_rows: previewRows,
          valid_rows: validRows,
          raw_rows: rows,
        });
      } catch (clientErr: any) {
        setValidationReport({
          success: false,
          dataset: selectedDataset.name,
          total_rows: 0,
          valid_rows_count: 0,
          invalid_rows_count: 0,
          errors: [
            {
              row: 0,
              column: 'file',
              error: 'Unable to parse file. Please verify CSV or Excel format.',
              value: selectedFile.name,
            },
          ],
          preview_rows: [],
          valid_rows: [],
        });
      }
    } finally {
      setIsValidating(false);
    }
  };

  // Confirm and Execute Database Import
  const handleExecuteImport = async () => {
    if (!validationReport || validationReport.valid_rows_count === 0) return;

    setIsImporting(true);
    setImportResult(null);

    const validRowsToImport = Array.isArray(validationReport.valid_rows) && validationReport.valid_rows.length > 0
      ? validationReport.valid_rows
      : (Array.isArray(validationReport.preview_rows)
        ? validationReport.preview_rows.filter((p) => p.isValid).map((p) => p.data)
        : (validationReport.raw_rows || []));

    try {
      const {api} = await import('../../../lib/api');
      const res = await api.post('/data-imports/execute', {
        dataset_key: selectedDatasetKey,
        rows: validRowsToImport,
        file_name: selectedFile?.name || `${selectedDatasetKey}_import.csv`,
      }, {timeoutMs: 120000 });

      if (res && res.success) {
        setImportResult({
          success: true,
          imported_count: res.imported_count || validRowsToImport.length,
          skipped_count: validationReport.total_rows - (res.imported_count || validRowsToImport.length),
          message: res.message || `Successfully imported ${res.imported_count || validRowsToImport.length} records.`,
          log_id: res.log_id,
        });

        setImportLogs((prev) => [
          {
            id: res.log_id || Date.now(),
            fileName: selectedFile?.name || `${selectedDatasetKey}_import.csv`,
            uploadedBy: 'Admin',
            recordCount: res.imported_count || validRowsToImport.length,
            status: 'Success',
            date: 'Just now',
            dataset: selectedDataset.name,
          },
          ...prev,
        ]);
      } else {
        throw new Error(res?.message || 'Database import failed. Please check error log.');
      }
    } catch (err: any) {
      setImportResult({
        success: false,
        imported_count: 0,
        skipped_count: validationReport ? validationReport.total_rows : 0,
        message: err?.message || 'Failed to execute import process. Please try again.',
      });
    } finally {
      setIsImporting(false);
    }
  };

  const historyColumns: Column<FeedbackImportItem>[] = [
    {
      header: 'File Name',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-mono text-xs font-bold text-slate-800">{row.fileName}</span>
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Target Dataset',
      accessor: (row) => (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-brand-50 text-blue-800 border border-blue-200/80">
          {row.dataset || 'Dataset'}
        </span>
      ),
      sortable: true,
    },
    {
      header: 'Uploaded By',
      accessor: 'uploadedBy',
      sortable: true,
    },
    {
      header: 'Records',
      accessor: (row) => <span className="font-mono text-xs font-semibold text-slate-700">{row.recordCount} Rows</span>,
      sortable: true,
    },
    {
      header: 'Status',
      accessor: (row) => <StatusBadge status={row.status as any} />,
      sortable: true,
    },
    {
      header: 'Timestamp',
      accessor: 'date',
      sortable: true,
    },
  ];

  return (
    <AdminLayout title="Data Import Center" currentPath="#Admin/FeedbackImport/Index">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold font-heading text-slate-900 tracking-tight flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-800" />
            Data Import Center
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Guided bulk database management & record importing system with foreign-key validation
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs font-medium">
          <Layers className="w-4 h-4 text-brand-navy" />
          <span>Available Datasets: <strong className="text-slate-900">{datasets.length}</strong></span>
        </div>
      </div>

      {/* Guided 5-Step Progress Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
        <div className="flex items-center justify-between overflow-x-auto gap-2 text-xs">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold transition-all ${
              !validationReport && !importResult ? 'bg-blue-800 text-white shadow-xs' : 'bg-slate-100 text-slate-700'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center text-[10px]">1</span>
            <span>Select Table</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold bg-slate-100 text-slate-700">
            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px]">2</span>
            <span>Required Schema</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold transition-all ${
              selectedFile ? 'bg-slate-200 text-slate-800' : 'text-slate-400'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center text-[10px]">3</span>
            <span>Upload File</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold transition-all ${
            validationReport ? 'bg-brand-primary text-white shadow-xs' : 'text-slate-400'
          }`}>
            <span className="w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center text-[10px]">4</span>
            <span>Validate & Preview</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold transition-all ${
              importResult ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center text-[10px]">5</span>
            <span>Import Status</span>
          </div>
        </div>
      </div>

      {/* SECTION 1: Table & Dataset Selection */}
      <Card title="Step 1 — What data do you want to import?">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <p className="text-xs text-slate-500">
            Select a system database table to import records into. Framework and internal logs tables are excluded.
          </p>

          {/* Category Filter Tabs & Search */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-48">
              <Input
                placeholder="Search tables..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-xs py-1"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            </div>

            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setCategoryFilter('all')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  categoryFilter === 'all' ? 'bg-white text-blue-900 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({datasets.length})
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('hierarchy')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  categoryFilter === 'hierarchy' ? 'bg-white text-blue-900 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Structure
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('rosters')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  categoryFilter === 'rosters' ? 'bg-white text-blue-900 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                People
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('academics')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  categoryFilter === 'academics' ? 'bg-white text-blue-900 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Academics
              </button>
            </div>
          </div>
        </div>

        {/* Dataset Selection Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {filteredDatasets.map((ds) => {
            const isSelected = ds.key === selectedDatasetKey;
            const reqC = ds.columns.filter((c) => c.required).length;
            const optC = ds.columns.filter((c) => !c.required).length;

            return (
              <div
                key={ds.key}
                onClick={() => handleSelectDataset(ds.key)}
                className={`cursor-pointer rounded-xl border p-3.5 transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-brand-navy bg-brand-50/50 shadow-md ring-2 ring-brand-navy/20'
                    : 'border-slate-200 bg-white hover:border-blue-400 hover:bg-slate-50/80 shadow-2xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-bold text-xs text-slate-900">{ds.name}</span>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      {ds.table}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-3">
                    {ds.description}
                  </p>
                </div>

                <div>
                  {ds.dependencies && ds.dependencies.length > 0 && (
                    <div className="flex items-center gap-1 text-[10px] font-semibold text-amber-800 mb-2 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                      <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                      <span className="truncate">Requires: {ds.dependencies.join(', ')}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] font-medium pt-2 border-t border-slate-100">
                    <span className="text-slate-600">Required: <strong className="text-brand-navy">{reqC}</strong></span>
                    <span className="text-slate-400">Optional: <strong>{optC}</strong></span>
                  </div>
                </div>

                {isSelected && (
                  <div className="absolute -top-2 -right-2 bg-brand-navy text-white rounded-full p-1 shadow-sm">
                    <Check className="w-3 h-3" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* SECTION 2: Required Excel / CSV Column Specification & Template Download */}
      <Card title={`Step 2 — Required File Schema (${selectedDataset.name})`}>
        {selectedDataset.dependency_notice && (
          <div className="mb-4 bg-amber-50/90 border border-amber-200/90 rounded-xl p-3.5 flex items-start gap-3 text-xs text-amber-950 shadow-2xs">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Prerequisite Dependencies Required</p>
              <p className="text-amber-800 mt-0.5">{selectedDataset.dependency_notice}</p>
            </div>
          </div>
        )}

        {selectedDataset.excluded_columns && selectedDataset.excluded_columns.length > 0 && (
          <div className="mb-4 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs flex items-center gap-2">
            <span className="font-extrabold text-rose-600 uppercase text-[10px] tracking-wider">Do not include in upload:</span>
            <div className="flex flex-wrap gap-1">
              {selectedDataset.excluded_columns.map((col) => (
                <code key={col} className="bg-white border border-slate-300 px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-700">
                  {col}
                </code>
              ))}
            </div>
          </div>
        )}

        {/* Columns Specification Table */}
        <div className="overflow-x-auto rounded-lg border border-slate-200 text-xs shadow-2xs mb-4">
          <table className="w-full text-left">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-2.5">Header Name</th>
                <th className="p-2.5">Required?</th>
                <th className="p-2.5">Data Type</th>
                <th className="p-2.5">Description</th>
                <th className="p-2.5">Sample Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {selectedDataset.columns.map((col) => (
                <tr key={col.name} className="hover:bg-slate-50/60">
                  <td className="p-2.5 font-mono text-xs font-bold text-blue-950">{col.name}</td>
                  <td className="p-2.5">
                    {col.required ? (
                      <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-extrabold text-[10px]">
                        Yes
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-semibold text-[10px]">
                        Optional
                      </span>
                    )}
                  </td>
                  <td className="p-2.5 font-semibold text-slate-600">{col.type}</td>
                  <td className="p-2.5 text-slate-600">{col.description}</td>
                  <td className="p-2.5 font-mono text-xs text-slate-700 bg-slate-50/80 rounded px-1.5 py-0.5">
                    {col.example || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Download Template Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <p className="text-xs text-slate-500">
            Download pre-formatted sample templates matching the exact header column order above.
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => handleDownloadTemplate('csv')}>
              <Download className="w-3.5 h-3.5 mr-1.5 text-slate-600" />
              Download CSV Template
            </Button>
            <Button variant="secondary" size="sm" onClick={() => handleDownloadTemplate('xlsx')}>
              <Download className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
              Download Excel Template
            </Button>
          </div>
        </div>
      </Card>

      {/* SECTION 3: Upload File & Validation */}
      <Card title={`Step 3 — Upload ${selectedDataset.name} Data File`}>
        <div className="border-2 border-dashed border-slate-300 hover:border-brand-primary rounded-xl p-8 text-center transition-all bg-slate-50/60 space-y-4">
          <div className="w-12 h-12 rounded-full bg-brand-50 border border-blue-200 text-brand-navy flex items-center justify-center mx-auto shadow-2xs">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">
              Drag & drop your completed {selectedDataset.name} CSV or Excel file here, or{' '}
              <label className="text-brand-navy hover:text-blue-800 font-bold underline cursor-pointer">
                browse files
                <input type="file" accept=".csv, .xlsx" className="hidden" onChange={handleFileChange} />
              </label>
            </p>
            <p className="text-xs text-slate-400 mt-1">Supported formats: .CSV, .XLSX (Max file size: 10MB)</p>
          </div>

          {selectedFile && (
            <div className="inline-flex items-center gap-2 bg-white border border-blue-300 px-4 py-2 rounded-lg text-xs font-mono text-slate-800 shadow-2xs">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span className="font-bold">{selectedFile.name}</span>
              <span className="text-slate-400 text-[10px]">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
            </div>
          )}
        </div>

        {selectedFile && (
          <div className="mt-4 flex justify-end">
            <Button variant="primary" size="sm" onClick={handleValidateFile} disabled={isValidating}>
              {isValidating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Validating File Data...
                </>
              ) : (
                <>
                  <FileCheck className="w-4 h-4 mr-2" />
                  Validate File & Generate Preview
                </>
              )}
            </Button>
          </div>
        )}
      </Card>

      {/* SECTION 4 & 5: Validation Report & Data Preview */}
      {validationReport && (
        <Card title="Step 4 & 5 — Validation Summary & Record Preview">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-center">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Total Rows</span>
              <span className="text-xl font-black text-slate-900">{validationReport.total_rows}</span>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-center">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">Valid Records</span>
              <span className="text-xl font-black text-emerald-800">{validationReport.valid_rows_count}</span>
            </div>
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-center">
              <span className="text-xs font-bold text-rose-700 uppercase tracking-wider block">Invalid Records</span>
              <span className="text-xl font-black text-rose-800">{validationReport.invalid_rows_count}</span>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-center">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block">Errors & Warnings</span>
              <span className="text-xl font-black text-amber-800">{(validationReport.errors || []).length}</span>
            </div>
          </div>

          {/* Validation Errors Table */}
          {validationReport.errors && validationReport.errors.length > 0 && (
            <div className="mb-6 space-y-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                Validation Errors Detected ({validationReport.errors.length})
              </h4>
              <div className="bg-white border border-rose-200 rounded-lg overflow-hidden text-xs max-h-48 overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="bg-rose-50 text-rose-900 font-bold border-b border-rose-200 sticky top-0">
                    <tr>
                      <th className="p-2">Row #</th>
                      <th className="p-2">Column / Field</th>
                      <th className="p-2">Error Details</th>
                      <th className="p-2">Received Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-100">
                    {validationReport.errors.map((err: any, i: number) => {
                      const rowVal = typeof err === 'object' && err !== null ? err.row ?? (i + 1) : i + 1;
                      const colVal = typeof err === 'object' && err !== null ? err.column ?? 'General' : 'General';
                      const errText = typeof err === 'object' && err !== null ? err.error ?? String(err) : String(err);
                      const valText = typeof err === 'object' && err !== null ? String(err.value ?? '-') : '-';
                      return (
                        <tr key={`err-${rowVal}-${colVal}-${i}`} className="hover:bg-rose-50/50">
                          <td className="p-2 font-mono font-bold text-slate-700">{rowVal}</td>
                          <td className="p-2 font-mono text-rose-700 font-bold">{colVal}</td>
                          <td className="p-2 text-rose-900">{errText}</td>
                          <td className="p-2 font-mono text-slate-600 bg-slate-50 rounded">{valText}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Data Preview Table */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Parsed Record Preview</h4>
                <p className="text-xs text-slate-500">
                  Showing first {Math.min(20, (validationReport.preview_rows || []).length)} rows ready for insertion
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => setValidationReport(null)}>
                  Change File
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleExecuteImport}
                  disabled={isImporting || validationReport.valid_rows_count === 0}
                >
                  {isImporting ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Importing Records...
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4 mr-2" />
                      Confirm & Import ({validationReport.valid_rows_count}) Records
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg overflow-x-auto text-xs shadow-2xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Row</th>
                    {selectedDataset.columns.map((c) => (
                      <th key={c.name} className="p-2.5 font-mono">{c.name}</th>
                    ))}
                    <th className="p-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(validationReport.preview_rows || []).map((p: any, i: number) => (
                    <tr key={`prev-${p.row ?? i}-${i}`} className={p.isValid ? 'hover:bg-slate-50' : 'bg-rose-50/30'}>
                      <td className="p-2.5 text-slate-400 font-mono">{p.row ?? i + 1}</td>
                      {selectedDataset.columns.map((c) => {
                        const cellVal = p.data && typeof p.data === 'object' ? p.data[c.name] ?? p.data[c.name.replace(/_/g, '')] : null;
                        return (
                          <td key={c.name} className="p-2.5 text-slate-700 font-mono text-[11px]">
                            {cellVal !== null && cellVal !== undefined ? String(cellVal) : '-'}
                          </td>
                        );
                      })}
                      <td className="p-2.5">
                        {p.isValid ? (
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Valid
                          </span>
                        ) : (
                          <span className="text-rose-700 font-bold flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> {p.status || 'Invalid'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}

      {/* SECTION 6: Import Execution Result Banner */}
      {importResult && (
        <Card title="Import Execution Result">
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 ${importResult.success ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
  }`}
          >
            {importResult.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <h4 className="font-extrabold text-sm">
                {importResult.success ? 'Database Import Successful' : 'Import Process Failed'}
              </h4>
              <p className="text-xs mt-1 leading-relaxed">{importResult.message}</p>
              {importResult.success && (
                <div className="mt-2 text-xs font-semibold text-emerald-800">
                  <span>
                    Imported: <strong>{importResult.imported_count}</strong> records
                  </span>
                  {importResult.skipped_count > 0 && (
                    <span className="ml-4 text-amber-700">
                      Skipped: <strong>{importResult.skipped_count}</strong> records
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* SECTION 7: Recent Data Imports Log */}
      <Card title="Recent Data Imports Log">
        <DataTable data={importLogs} columns={historyColumns} searchPlaceholder="Search import history..." />
      </Card>
    </AdminLayout>
  );
}

export default function Index(props: FeedbackImportIndexProps) {
  return (
    <UIErrorBoundary>
      <FeedbackImportContent {...props} />
    </UIErrorBoundary>
  );
}
