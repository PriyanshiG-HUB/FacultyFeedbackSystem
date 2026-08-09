import {
  AdminDashboardProps,
  DepartmentsIndexProps,
  DepartmentsCreateProps,
  FacultyIndexProps,
  SubjectsIndexProps,
  DivisionsIndexProps,
  BatchesIndexProps,
  StudentsIndexProps,
  ElectivesIndexProps,
  ElectiveEnrollmentProps,
  SessionAssignmentsIndexProps,
  FeedbackImportIndexProps,
  AnalyticsIndexProps,
  ReportsIndexProps,
  CriticalCommentsIndexProps,
  SettingsIndexProps,
  FacultyLoginProps,
  FacultyReportsIndexProps,
  FacultyReportShowProps,
  StudentIdentifyProps,
  StudentFeedbackShowProps,
} from '../types';

export const mockPropsMap: Record<string, any> = {
  'Admin/Dashboard': {
    hodInfo: {
      name: 'Dr. Grace Hopper',
      role: 'Head of Department (HOD)',
      department: 'Information Technology',
      departmentCode: 'IT',
    },
    stats: [
      { label: 'Department Submissions', value: '1,240', change: '+14.2% in IT dept', isPositive: true, icon: 'check-circle' },
      { label: 'IT Avg Faculty Score', value: '4.52 / 5.0', change: '+0.18 points vs last term', isPositive: true, icon: 'star' },
      { label: 'Active IT Faculty', value: '28', change: 'Information Technology Dept', isPositive: true, icon: 'users' },
      { label: 'Active Student Batches', value: '6', change: '89.2% Completion Rate', isPositive: true, icon: 'building' },
    ],
    submissionTrends: [
      { month: 'Week 1', submissions: 120, avgRating: 4.35 },
      { month: 'Week 2', submissions: 310, avgRating: 4.42 },
      { month: 'Week 3', submissions: 450, avgRating: 4.50 },
      { month: 'Week 4', submissions: 240, avgRating: 4.58 },
      { month: 'Week 5', submissions: 120, avgRating: 4.52 },
    ],
    facultyPerformance: [
      { facultyName: 'Dr. Sarah Jenkins', avgRating: 4.92, totalFeedback: 185 },
      { facultyName: 'Prof. Michael Chang', avgRating: 4.85, totalFeedback: 160 },
      { facultyName: 'Dr. Anita Sharma', avgRating: 4.65, totalFeedback: 140 },
      { facultyName: 'Dr. Robert Smith', avgRating: 4.45, totalFeedback: 120 },
      { facultyName: 'Dr. Emily Brown', avgRating: 4.28, totalFeedback: 110 },
    ],
    recentFeedback: [
      { id: 101, studentRoll: '22IT045', facultyName: 'Dr. Sarah Jenkins', subject: 'Database Management Systems', rating: 5, date: '10 mins ago', commentSnippet: 'Exceptional teaching methodology and clear SQL query explanations.' },
      { id: 102, studentRoll: '22IT012', facultyName: 'Prof. Michael Chang', subject: 'Database Management Systems', rating: 4, date: '25 mins ago', commentSnippet: 'Very interactive sessions and useful lab demonstrations.' },
      { id: 103, studentRoll: '23IT089', facultyName: 'Dr. Robert Smith', subject: 'Design & Analysis of Algorithms', rating: 4, date: '1 hour ago', commentSnippet: 'Great algorithm visualizations and problem solving.' },
      { id: 104, studentRoll: '22IT034', facultyName: 'Dr. Emily Brown', subject: 'Computer Organization & Architecture', rating: 5, date: '2 hours ago', commentSnippet: 'Pipelining concepts explained with superb visual examples.' },
    ],
  } as AdminDashboardProps,

  'Admin/Departments/Index': {
    departments: [
      { id: 1, name: 'Information Technology', code: 'IT', hod: 'Dr. Grace Hopper', facultyCount: 28, status: 'Active' },
      { id: 2, name: 'Computer Engineering', code: 'COMP', hod: 'Dr. Alan Turing', facultyCount: 32, status: 'Active' },
      { id: 3, name: 'Electronics & Communication', code: 'ECE', hod: 'Dr. Claude Shannon', facultyCount: 24, status: 'Active' },
      { id: 4, name: 'Mechanical Engineering', code: 'MECH', hod: 'Dr. James Watt', facultyCount: 26, status: 'Active' },
      { id: 5, name: 'Civil Engineering', code: 'CIVIL', hod: 'Dr. Isambard Brunel', facultyCount: 20, status: 'Active' },
      { id: 6, name: 'Applied Sciences & Humanities', code: 'ASH', hod: 'Dr. Marie Curie', facultyCount: 18, status: 'Active' },
    ],
  } as DepartmentsIndexProps,

  'Admin/Departments/Create': {
    hodOptions: [
      { id: 10, name: 'Dr. Grace Hopper' },
      { id: 11, name: 'Dr. Alan Turing' },
      { id: 12, name: 'Dr. Claude Shannon' },
      { id: 13, name: 'Dr. Richard Feynman' },
    ],
  } as DepartmentsCreateProps,

  'Admin/Faculty/Index': {
    faculty: [
      { id: 1, name: 'Dr. Sarah Jenkins', email: 's.jenkins@univ.edu', department: 'Information Technology', designation: 'Professor', status: 'Active' },
      { id: 2, name: 'Prof. Michael Chang', email: 'm.chang@univ.edu', department: 'Information Technology', designation: 'Associate Professor', status: 'Active' },
      { id: 3, name: 'Dr. Anita Sharma', email: 'a.sharma@univ.edu', department: 'Information Technology', designation: 'Associate Professor', status: 'Active' },
      { id: 4, name: 'Dr. Robert Smith', email: 'r.smith@univ.edu', department: 'Information Technology', designation: 'Professor', status: 'Active' },
      { id: 5, name: 'Dr. Emily Brown', email: 'e.brown@univ.edu', department: 'Information Technology', designation: 'Professor', status: 'Active' },
    ],
    departments: [
      { id: 1, name: 'Information Technology' },
      { id: 2, name: 'Computer Engineering' },
      { id: 3, name: 'Electronics & Comm.' },
    ],
  } as FacultyIndexProps,

  'Admin/Subjects/Index': {
    subjects: [
      { id: 1, name: 'Database Management Systems', code: 'IT701', department: 'Information Technology', type: 'Core', credits: 4, semester: 7 },
      { id: 2, name: 'Design & Analysis of Algorithms', code: 'IT702', department: 'Information Technology', type: 'Core', credits: 4, semester: 7 },
      { id: 3, name: 'Computer Organization & Architecture', code: 'IT703', department: 'Information Technology', type: 'Core', credits: 3, semester: 7 },
      { id: 4, name: 'Operating Systems', code: 'IT704', department: 'Information Technology', type: 'Core', credits: 4, semester: 7 },
      { id: 5, name: 'Computer Networks', code: 'IT705', department: 'Information Technology', type: 'Core', credits: 4, semester: 7 },
      { id: 6, name: 'Software Engineering', code: 'IT706', department: 'Information Technology', type: 'Core', credits: 3, semester: 7 },
      { id: 7, name: 'Web Development & Cloud Architecture', code: 'IT707', department: 'Information Technology', type: 'Elective', credits: 3, semester: 7 },
    ],
  } as SubjectsIndexProps,

  'Admin/Divisions/Index': {
    divisions: [
      { id: 1, name: 'Division A', department: 'Information Technology', academicYear: '2025-26', studentCount: 65 },
      { id: 2, name: 'Division B', department: 'Information Technology', academicYear: '2025-26', studentCount: 62 },
    ],
  } as DivisionsIndexProps,

  'Admin/Batches/Index': {
    batches: [
      { id: 1, name: 'Batch 2022-2026 (B.Tech IT)', academicYear: '2025-26', currentSemester: 7, department: 'Information Technology', status: 'Active' },
      { id: 2, name: 'Batch 2023-2027 (B.Tech IT)', academicYear: '2025-26', currentSemester: 5, department: 'Information Technology', status: 'Active' },
    ],
  } as BatchesIndexProps,

  'Admin/Students/Index': {
    students: [
      { id: 1, rollNumber: '22IT001', name: 'Alexander Wright', email: 'a.wright@student.univ.edu', batch: 'Batch 2022-2026', division: 'Division A', department: 'Information Technology', feedbackStatus: 'Completed' },
      { id: 2, rollNumber: '22IT002', name: 'Sophia Martinez', email: 's.martinez@student.univ.edu', batch: 'Batch 2022-2026', division: 'Division A', department: 'Information Technology', feedbackStatus: 'Completed' },
      { id: 3, rollNumber: '22IT003', name: 'Ethan Hunt', email: 'e.hunt@student.univ.edu', batch: 'Batch 2022-2026', division: 'Division B', department: 'Information Technology', feedbackStatus: 'Pending' },
    ],
  } as StudentsIndexProps,

  'Admin/Electives/Index': {
    electives: [
      { id: 1, subjectCode: 'IT707', subjectName: 'Web Development & Cloud Architecture', department: 'Information Technology', batch: 'Batch 2022-2026', semester: 7, enrolledCount: 48, maxSeats: 60 },
    ],
  } as ElectivesIndexProps,

  'Admin/Electives/Enrollment': {
    elective: {
      id: 1,
      subjectCode: 'IT707',
      subjectName: 'Web Development & Cloud Architecture',
      batch: 'Batch 2022-2026',
    },
    availableStudents: [
      { id: 101, rollNumber: '22IT001', name: 'Alexander Wright', division: 'Division A', isEnrolled: true },
      { id: 102, rollNumber: '22IT002', name: 'Sophia Martinez', division: 'Division A', isEnrolled: true },
    ],
  } as ElectiveEnrollmentProps,

  'Admin/SessionAssignments/Index': {
    assignments: [
      { id: 1, facultyName: 'Dr. Sarah Jenkins', subjectName: 'Database Management Systems', subjectCode: 'IT701', batchName: 'Batch 2022-2026', divisionName: 'Division A', semester: 7 },
      { id: 2, facultyName: 'Prof. Michael Chang', subjectName: 'Database Management Systems', subjectCode: 'IT701', batchName: 'Batch 2022-2026', divisionName: 'Division A', semester: 7 },
    ],
    facultyList: [
      { id: 1, name: 'Dr. Sarah Jenkins' },
      { id: 2, name: 'Prof. Michael Chang' },
    ],
    subjectList: [
      { id: 1, name: 'Database Management Systems', code: 'IT701' },
    ],
    batchList: [
      { id: 1, name: 'Batch 2022-2026' },
    ],
  } as SessionAssignmentsIndexProps,

  'Admin/FeedbackImport/Index': {
    recentImports: [
      { id: 1, fileName: 'IT_Student_Roster_Sem7_2026.csv', uploadedBy: 'HOD (Dr. Grace Hopper)', recordCount: 127, status: 'Success', date: '2026-08-05 14:30' },
      { id: 2, fileName: 'IT_Faculty_Session_Mapping.xlsx', uploadedBy: 'HOD (Dr. Grace Hopper)', recordCount: 28, status: 'Success', date: '2026-08-04 11:15' },
    ],
  } as FeedbackImportIndexProps,

  'Admin/Analytics/Index': {
    departmentName: 'Information Technology',
    departmentRatings: [
      { department: 'DBMS (IT701)', punctuality: 4.8, knowledge: 4.9, clarity: 4.7, material: 4.6, overall: 4.75 },
      { department: 'DAA (IT702)', punctuality: 4.6, knowledge: 4.8, clarity: 4.5, material: 4.4, overall: 4.58 },
      { department: 'COA (IT703)', punctuality: 4.5, knowledge: 4.7, clarity: 4.4, material: 4.3, overall: 4.48 },
      { department: 'OS (IT704)', punctuality: 4.7, knowledge: 4.8, clarity: 4.6, material: 4.5, overall: 4.65 },
      { department: 'Networks (IT705)', punctuality: 4.4, knowledge: 4.6, clarity: 4.3, material: 4.2, overall: 4.38 },
    ],
    topFaculty: [
      { id: 1, name: 'Dr. Sarah Jenkins', department: 'Information Technology', avgRating: 4.92, totalResponses: 185 },
      { id: 2, name: 'Prof. Michael Chang', department: 'Information Technology', avgRating: 4.85, totalResponses: 160 },
      { id: 3, name: 'Dr. Anita Sharma', department: 'Information Technology', avgRating: 4.65, totalResponses: 140 },
      { id: 4, name: 'Dr. Robert Smith', department: 'Information Technology', avgRating: 4.45, totalResponses: 120 },
    ],
    scoreDistribution: [
      { range: '4.5 - 5.0 (Excellent)', count: 68 },
      { range: '4.0 - 4.4 (Good)', count: 52 },
      { range: '3.5 - 3.9 (Average)', count: 18 },
      { range: '3.0 - 3.4 (Below Avg)', count: 6 },
      { range: '< 3.0 (Critical)', count: 2 },
    ],
  } as AnalyticsIndexProps,

  'Admin/Reports/Index': {
    departmentName: 'Information Technology',
    reports: [
      { id: 1, title: 'Fall 2025 Information Technology Faculty Evaluation Summary', academicYear: '2025-26', term: 'Odd Semester', totalResponses: 1240, status: 'Published', generatedAt: '2026-08-01' },
      { id: 2, title: 'Department of Information Technology Core Courses Rating Audit', academicYear: '2025-26', term: 'Odd Semester', totalResponses: 980, status: 'Published', generatedAt: '2026-08-02' },
      { id: 3, title: 'IT Elective Courses Student Feedback Report', academicYear: '2025-26', term: 'Odd Semester', totalResponses: 260, status: 'Draft', generatedAt: '2026-08-06' },
    ],
  } as ReportsIndexProps,

  'Admin/CriticalComments/Index': {
    departmentName: 'Information Technology',
    comments: [
      { id: 1, facultyName: 'Dr. Robert Smith', subjectName: 'Design & Analysis of Algorithms', rating: 2, comment: 'Pacing during dynamic programming derivations was slightly too fast.', severity: 'Medium', date: '2026-08-06', status: 'Pending' },
      { id: 2, facultyName: 'Prof. Michael Chang', subjectName: 'Database Management Systems', rating: 2, comment: 'Lab server connection issues during B+ Tree indexing assignment.', severity: 'Medium', date: '2026-08-05', status: 'Reviewed' },
    ],
  } as CriticalCommentsIndexProps,

  'Admin/Settings/Index': {
    settings: {
      ratingScale: 5,
      minFeedbackThreshold: 10,
      allowAnonymous: true,
      feedbackWindowOpen: '2026-08-01',
      feedbackWindowClose: '2026-08-31',
      autoPublishReports: false,
    },
  } as SettingsIndexProps,

  'Faculty/Login': {
    status: undefined,
  } as FacultyLoginProps,

  'Faculty/MyReports/Index': {
    facultyName: 'Dr. Sarah Jenkins',
    reports: [
      { id: 101, subjectName: 'Database Management Systems', subjectCode: 'IT701', batchName: 'Batch 2022-2026', academicYear: '2025-26', totalStudents: 65, respondedStudents: 61, overallScore: 4.88, status: 'Published' },
      { id: 102, subjectName: 'Web Development & Cloud Architecture', subjectCode: 'IT707', batchName: 'Batch 2022-2026', academicYear: '2025-26', totalStudents: 50, respondedStudents: 48, overallScore: 4.94, status: 'Published' },
    ],
  } as FacultyReportsIndexProps,

  'Faculty/MyReports/Show': {
    report: {
      id: 101,
      subjectName: 'Database Management Systems',
      subjectCode: 'IT701',
      batchName: 'Batch 2022-2026 (Division A)',
      semester: 7,
      academicYear: '2025-26 (Odd Term)',
      totalStudents: 65,
      respondedStudents: 61,
      overallScore: 4.88,
      metrics: [
        { category: 'Punctuality & Discipline', score: 4.9 },
        { category: 'Subject Depth & Preparation', score: 4.95 },
        { category: 'Clarity of Presentation', score: 4.82 },
        { category: 'Lab / Practical Guidance', score: 4.85 },
      ],
      comments: [
        { text: 'Exceptional teaching methodology and clear SQL query explanations.', rating: 5, date: '2026-08-04' },
        { text: 'Always approachable and resolves doubts quickly during lab sessions.', rating: 5, date: '2026-08-03' },
      ],
    },
  } as FacultyReportShowProps,

  'Student/Identify': {
    student: {
      studentId: 'STU-2022-045',
      rollNumber: '22IT045',
      name: 'Alex Turner',
      program: 'B.Tech Information Technology',
      department: 'Information Technology',
      batch: 'Batch 2022-2026',
      division: 'Division A',
    },
  } as StudentIdentifyProps,

  'Student/Feedback/Show': {
    student: {
      studentId: 'STU-2022-045',
      rollNumber: '22IT045',
      name: 'Alex Turner',
      role: 'Student',
      program: 'B.Tech (Information Technology)',
      department: 'Information Technology',
      batch: 'Batch 2022-2026',
      division: 'Division A',
    },
    academicYear: '2025-26',
    term: 'Odd Semester (Sem 7)',
    subjects: [
      {
        id: 1,
        subjectCode: 'IT701',
        subjectName: 'Database Management Systems',
        credits: 4,
        type: 'Core',
        department: 'Information Technology',
        facultyOptions: [
          { id: 1, name: 'Dr. Sarah Jenkins', designation: 'Professor', department: 'Information Technology' },
          { id: 2, name: 'Prof. Michael Chang', designation: 'Associate Professor', department: 'Information Technology' },
        ],
      },
      {
        id: 2,
        subjectCode: 'IT702',
        subjectName: 'Design & Analysis of Algorithms',
        credits: 4,
        type: 'Core',
        department: 'Information Technology',
        facultyOptions: [
          { id: 3, name: 'Dr. Robert Smith', designation: 'Professor', department: 'Information Technology' },
        ],
      },
      {
        id: 3,
        subjectCode: 'IT703',
        subjectName: 'Computer Organization & Architecture',
        credits: 3,
        type: 'Core',
        department: 'Information Technology',
        facultyOptions: [
          { id: 4, name: 'Dr. Emily Brown', designation: 'Professor', department: 'Information Technology' },
          { id: 5, name: 'Dr. David Wilson', designation: 'Assistant Professor', department: 'Information Technology' },
        ],
      },
      {
        id: 4,
        subjectCode: 'IT704',
        subjectName: 'Operating Systems',
        credits: 4,
        type: 'Core',
        department: 'Information Technology',
        facultyOptions: [
          { id: 6, name: 'Prof. Alan Turing', designation: 'Professor', department: 'Information Technology' },
        ],
      },
      {
        id: 5,
        subjectCode: 'IT705',
        subjectName: 'Computer Networks',
        credits: 4,
        type: 'Core',
        department: 'Information Technology',
        facultyOptions: [
          { id: 7, name: 'Dr. Claude Shannon', designation: 'Professor', department: 'Information Technology' },
          { id: 8, name: 'Dr. Grace Hopper', designation: 'Associate Professor', department: 'Information Technology' },
        ],
      },
      {
        id: 6,
        subjectCode: 'IT706',
        subjectName: 'Software Engineering',
        credits: 3,
        type: 'Core',
        department: 'Information Technology',
        facultyOptions: [
          { id: 9, name: 'Prof. James Gosling', designation: 'Assistant Professor', department: 'Information Technology' },
        ],
      },
      {
        id: 7,
        subjectCode: 'IT707',
        subjectName: 'Web Development & Cloud Architecture',
        credits: 3,
        type: 'Elective',
        department: 'Information Technology',
        facultyOptions: [
          { id: 10, name: 'Dr. Linus Torvalds', designation: 'Professor', department: 'Information Technology' },
        ],
      },
    ],
  } as StudentFeedbackShowProps,
};
