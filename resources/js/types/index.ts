// Global TypeScript Types for Faculty Feedback System (Inertia.js Controllers Props)

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'faculty' | 'student';
}

export interface DepartmentSummary {
  code: string;
  name: string;
  hod: string;
  studentCount: number;
  facultyCount: number;
  avgRating: number;
  completionRate: number;
}

// 1. Admin/Dashboard
export interface AdminDashboardProps {
  userRole?: 'admin' | 'hod';
  assignedDepartmentCode?: string | null;
  activeDepartmentCode?: string | null;
  hodInfo?: {
    name: string;
    role: string;
    department: string;
    departmentCode: string;
  };
  departmentOverviews?: DepartmentSummary[];
  stats: {
    label: string;
    value: string | number;
    change: string;
    isPositive: boolean;
    icon: 'users' | 'building' | 'star' | 'check-circle';
  }[];
  submissionTrends: {
    month: string;
    submissions: number;
    avgRating: number;
  }[];
  facultyPerformance: {
    facultyName: string;
    avgRating: number;
    totalFeedback: number;
  }[];
  departmentPerformance?: {
    department: string;
    avgRating: number;
    totalFeedback: number;
  }[];
  recentFeedback: {
    id: number;
    studentRoll: string;
    facultyName: string;
    subject: string;
    rating: number;
    date: string;
    commentSnippet: string;
  }[];
}

// 2. Admin/Departments/Index
export interface DepartmentItem {
  id: number;
  name: string;
  code: string;
  hod: string;
  facultyCount: number;
  studentCount?: number;
  avgRating?: number;
  completionRate?: number;
  status: 'Active' | 'Inactive';
}

export interface DepartmentsIndexProps {
  userRole?: 'admin' | 'hod';
  assignedDepartmentCode?: string | null;
  departments: DepartmentItem[];
  filters?: { search?: string };
}

// 3. Admin/Departments/Create
export interface DepartmentsCreateProps {
  hodOptions: { id: number; name: string }[];
}

// 4. Admin/Faculty/Index
export interface FacultyItem {
  id: number;
  name: string;
  email: string;
  department: string;
  designation: string;
  status: 'Active' | 'On Leave';
}

export interface FacultyIndexProps {
  faculty: FacultyItem[];
  departments: { id: number; name: string }[];
  filters?: { search?: string; department_id?: string };
}

// 5. Admin/Subjects/Index
export interface SubjectItem {
  id: number;
  name: string;
  code: string;
  department: string;
  type: 'Core' | 'Elective';
  credits: number;
  semester: number;
}

export interface SubjectsIndexProps {
  subjects: SubjectItem[];
  filters?: { search?: string };
}

// 6. Admin/Divisions/Index
export interface DivisionItem {
  id: number;
  name: string;
  department: string;
  academicYear: string;
  studentCount: number;
}

export interface DivisionsIndexProps {
  divisions: DivisionItem[];
  filters?: { search?: string };
}

// 7. Admin/Batches/Index
export interface BatchItem {
  id: number;
  name: string;
  academicYear: string;
  currentSemester: number;
  department: string;
  status: 'Active' | 'Graduated';
}

export interface BatchesIndexProps {
  batches: BatchItem[];
  filters?: { search?: string };
}

// 8. Admin/Students/Index
export interface StudentItem {
  id: number;
  rollNumber: string;
  name: string;
  email: string;
  batch: string;
  division: string;
  department: string;
  feedbackStatus: 'Completed' | 'Pending';
}

export interface StudentsIndexProps {
  students: StudentItem[];
  filters?: { search?: string; status?: string };
}

// 9. Admin/Electives/Index
export interface ElectiveItem {
  id: number;
  subjectCode: string;
  subjectName: string;
  department: string;
  batch: string;
  semester: number;
  enrolledCount: number;
  maxSeats: number;
}

export interface ElectivesIndexProps {
  electives: ElectiveItem[];
  filters?: { search?: string };
}

// 10. Admin/Electives/Enrollment
export interface ElectiveEnrollmentStudent {
  id: number;
  rollNumber: string;
  name: string;
  division: string;
  isEnrolled: boolean;
}

export interface ElectiveEnrollmentProps {
  elective: {
    id: number;
    subjectCode: string;
    subjectName: string;
    batch: string;
  };
  availableStudents: ElectiveEnrollmentStudent[];
}

// 11. Admin/SessionAssignments/Index
export interface SessionAssignmentItem {
  id: number;
  facultyName: string;
  subjectName: string;
  subjectCode: string;
  batchName: string;
  divisionName: string;
  semester: number;
}

export interface SessionAssignmentsIndexProps {
  assignments: SessionAssignmentItem[];
  facultyList: { id: number; name: string }[];
  subjectList: { id: number; name: string; code: string }[];
  batchList: { id: number; name: string }[];
}

// 12. Admin/FeedbackImport/Index
export interface FeedbackImportItem {
  id: number;
  fileName: string;
  uploadedBy: string;
  recordCount: number;
  status: 'Success' | 'Failed' | 'Processing';
  date: string;
}

export interface FeedbackImportIndexProps {
  recentImports: FeedbackImportItem[];
}

// 13. Admin/Analytics/Index
export interface AnalyticsIndexProps {
  departmentName?: string;
  departmentRatings: {
    department: string;
    punctuality: number;
    knowledge: number;
    clarity: number;
    material: number;
    overall: number;
  }[];
  topFaculty: {
    id: number;
    name: string;
    department: string;
    avgRating: number;
    totalResponses: number;
  }[];
  scoreDistribution: {
    range: string;
    count: number;
  }[];
}

// 14. Admin/Reports/Index
export interface ReportItem {
  id: number;
  title: string;
  academicYear: string;
  term: string;
  totalResponses: number;
  status: 'Published' | 'Draft';
  generatedAt: string;
}

export interface ReportsIndexProps {
  departmentName?: string;
  reports: ReportItem[];
}

// 15. Admin/CriticalComments/Index
export interface CriticalCommentItem {
  id: number;
  facultyName: string;
  subjectName: string;
  rating: number;
  comment: string;
  severity: 'High' | 'Medium';
  date: string;
  status: 'Reviewed' | 'Pending';
}

export interface CriticalCommentsIndexProps {
  departmentName?: string;
  comments: CriticalCommentItem[];
}

// 16. Admin/Settings/Index
export interface SystemSettings {
  ratingScale: number;
  minFeedbackThreshold: number;
  allowAnonymous: boolean;
  feedbackWindowOpen: string;
  feedbackWindowClose: string;
  autoPublishReports: boolean;
}

export interface SettingsIndexProps {
  settings: SystemSettings;
}

// 17. Faculty/Login
export interface FacultyLoginProps {
  status?: string;
}

// 18. Faculty/MyReports/Index
export interface FacultyReportItem {
  id: number;
  subjectName: string;
  subjectCode: string;
  batchName: string;
  academicYear: string;
  totalStudents: number;
  respondedStudents: number;
  overallScore: number;
  status: 'Published' | 'Pending Review';
}

export interface FacultyReportsIndexProps {
  facultyName: string;
  reports: FacultyReportItem[];
}

// 19. Faculty/MyReports/Show
export interface FacultyReportShowProps {
  report: {
    id: number;
    subjectName: string;
    subjectCode: string;
    batchName: string;
    semester: number;
    academicYear: string;
    totalStudents: number;
    respondedStudents: number;
    overallScore: number;
    metrics: { category: string; score: number }[];
    comments: { text: string; rating: number; date: string }[];
  };
}

// 20. Student/Identify
export interface StudentIdentifyProps {
  error?: string;
}

// 21. Student/Feedback/Show
export interface FeedbackParameter {
  id: string;
  statement: string;
  label?: string;
  description?: string;
}

export interface FacultyOption {
  id: number;
  name: string;
  designation: string;
  department?: string;
}

export interface FeedbackSubjectItem {
  id: number;
  subjectCode: string;
  subjectName: string;
  department: string;
  credits?: number;
  type?: 'Core' | 'Elective';
  facultyOptions: FacultyOption[];
  parameters?: FeedbackParameter[];
  // Backwards compatibility fields if needed
  assignmentId?: number;
  facultyName?: string;
  facultyDesignation?: string;
}

export interface StudentFeedbackShowProps {
  student: {
    studentId: string;
    rollNumber: string;
    name: string;
    role: string;
    program: string;
    batch: string;
    division: string;
    department?: string;
  };
  subjects: FeedbackSubjectItem[];
  feedbackItems?: FeedbackSubjectItem[];
  parameters?: FeedbackParameter[];
}
