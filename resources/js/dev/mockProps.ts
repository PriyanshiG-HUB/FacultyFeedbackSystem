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
    stats: [
      { label: 'Total Feedback Submissions', value: '3,842', change: '+14.2% vs last term', isPositive: true, icon: 'check-circle' },
      { label: 'Average Faculty Score', value: '4.35 / 5.0', change: '+0.18 points', isPositive: true, icon: 'star' },
      { label: 'Active Faculty Members', value: '148', change: '12 Departments', isPositive: true, icon: 'users' },
      { label: 'Active Student Batches', value: '24', change: '85.4% Completion Rate', isPositive: true, icon: 'building' },
    ],
    submissionTrends: [
      { month: 'Week 1', submissions: 240, avgRating: 4.1 },
      { month: 'Week 2', submissions: 680, avgRating: 4.25 },
      { month: 'Week 3', submissions: 1250, avgRating: 4.3 },
      { month: 'Week 4', submissions: 980, avgRating: 4.4 },
      { month: 'Week 5', submissions: 692, avgRating: 4.38 },
    ],
    departmentPerformance: [
      { department: 'Computer Engineering', avgRating: 4.52, totalFeedback: 1240 },
      { department: 'Information Technology', avgRating: 4.41, totalFeedback: 980 },
      { department: 'Electronics & Comm.', avgRating: 4.28, totalFeedback: 750 },
      { department: 'Mechanical Engineering', avgRating: 4.15, totalFeedback: 520 },
      { department: 'Civil Engineering', avgRating: 4.08, totalFeedback: 352 },
    ],
    recentFeedback: [
      { id: 101, studentRoll: '22CE045', facultyName: 'Dr. Sarah Jenkins', subject: 'Data Structures & Algorithms', rating: 5, date: '10 mins ago', commentSnippet: 'Exceptional teaching methodology and clear problem explanations.' },
      { id: 102, studentRoll: '22IT012', facultyName: 'Prof. Michael Chang', subject: 'Database Management Systems', rating: 4, date: '25 mins ago', commentSnippet: 'Very interactive sessions and useful practical lab demonstrations.' },
      { id: 103, studentRoll: '23EC089', facultyName: 'Dr. Elena Rostova', subject: 'Digital Signal Processing', rating: 3, date: '1 hour ago', commentSnippet: 'Pacing is slightly fast during mathematical derivations.' },
      { id: 104, studentRoll: '21ME034', facultyName: 'Prof. David Miller', subject: 'Thermodynamics', rating: 5, date: '2 hours ago', commentSnippet: 'Great real-world examples provided in every single class.' },
    ],
  } as AdminDashboardProps,

  'Admin/Departments/Index': {
    departments: [
      { id: 1, name: 'Computer Engineering', code: 'COMP', hod: 'Dr. Alan Turing', facultyCount: 32, status: 'Active' },
      { id: 2, name: 'Information Technology', code: 'IT', hod: 'Dr. Grace Hopper', facultyCount: 28, status: 'Active' },
      { id: 3, name: 'Electronics & Communication', code: 'ECE', hod: 'Dr. Claude Shannon', facultyCount: 24, status: 'Active' },
      { id: 4, name: 'Mechanical Engineering', code: 'MECH', hod: 'Dr. James Watt', facultyCount: 26, status: 'Active' },
      { id: 5, name: 'Civil Engineering', code: 'CIVIL', hod: 'Dr. Isambard Brunel', facultyCount: 20, status: 'Active' },
      { id: 6, name: 'Applied Sciences & Humanities', code: 'ASH', hod: 'Dr. Marie Curie', facultyCount: 18, status: 'Active' },
    ],
  } as DepartmentsIndexProps,

  'Admin/Departments/Create': {
    hodOptions: [
      { id: 10, name: 'Dr. Alan Turing' },
      { id: 11, name: 'Dr. Grace Hopper' },
      { id: 12, name: 'Dr. Claude Shannon' },
      { id: 13, name: 'Dr. Richard Feynman' },
    ],
  } as DepartmentsCreateProps,

  'Admin/Faculty/Index': {
    faculty: [
      { id: 1, name: 'Dr. Sarah Jenkins', email: 's.jenkins@univ.edu', department: 'Computer Engineering', designation: 'Professor', status: 'Active' },
      { id: 2, name: 'Prof. Michael Chang', email: 'm.chang@univ.edu', department: 'Information Technology', designation: 'Associate Professor', status: 'Active' },
      { id: 3, name: 'Dr. Elena Rostova', email: 'e.rostova@univ.edu', department: 'Electronics & Comm.', designation: 'Assistant Professor', status: 'Active' },
      { id: 4, name: 'Prof. David Miller', email: 'd.miller@univ.edu', department: 'Mechanical Engineering', designation: 'Professor', status: 'On Leave' },
      { id: 5, name: 'Dr. Anita Sharma', email: 'a.sharma@univ.edu', department: 'Computer Engineering', designation: 'Associate Professor', status: 'Active' },
      { id: 6, name: 'Prof. Robert Vance', email: 'r.vance@univ.edu', department: 'Civil Engineering', designation: 'Assistant Professor', status: 'Active' },
    ],
    departments: [
      { id: 1, name: 'Computer Engineering' },
      { id: 2, name: 'Information Technology' },
      { id: 3, name: 'Electronics & Comm.' },
      { id: 4, name: 'Mechanical Engineering' },
      { id: 5, name: 'Civil Engineering' },
    ],
  } as FacultyIndexProps,

  'Admin/Subjects/Index': {
    subjects: [
      { id: 1, name: 'Data Structures & Algorithms', code: 'CS301', department: 'Computer Engineering', type: 'Core', credits: 4, semester: 3 },
      { id: 2, name: 'Database Management Systems', code: 'IT302', department: 'Information Technology', type: 'Core', credits: 4, semester: 3 },
      { id: 3, name: 'Machine Learning', code: 'CS701', department: 'Computer Engineering', type: 'Elective', credits: 3, semester: 7 },
      { id: 4, name: 'Digital Signal Processing', code: 'EC501', department: 'Electronics & Comm.', type: 'Core', credits: 4, semester: 5 },
      { id: 5, name: 'Thermodynamics', code: 'ME303', department: 'Mechanical Engineering', type: 'Core', credits: 3, semester: 3 },
      { id: 6, name: 'Cloud Computing Architecture', code: 'IT703', department: 'Information Technology', type: 'Elective', credits: 3, semester: 7 },
    ],
  } as SubjectsIndexProps,

  'Admin/Divisions/Index': {
    divisions: [
      { id: 1, name: 'Division A', department: 'Computer Engineering', academicYear: '2025-26', studentCount: 65 },
      { id: 2, name: 'Division B', department: 'Computer Engineering', academicYear: '2025-26', studentCount: 62 },
      { id: 3, name: 'Division A', department: 'Information Technology', academicYear: '2025-26', studentCount: 60 },
      { id: 4, name: 'Division A', department: 'Electronics & Comm.', academicYear: '2025-26', studentCount: 58 },
      { id: 5, name: 'Division A', department: 'Mechanical Engineering', academicYear: '2025-26', studentCount: 55 },
    ],
  } as DivisionsIndexProps,

  'Admin/Batches/Index': {
    batches: [
      { id: 1, name: 'Batch 2022-2026 (B.Tech)', academicYear: '2025-26', currentSemester: 7, department: 'Computer Engineering', status: 'Active' },
      { id: 2, name: 'Batch 2023-2027 (B.Tech)', academicYear: '2025-26', currentSemester: 5, department: 'Computer Engineering', status: 'Active' },
      { id: 3, name: 'Batch 2024-2028 (B.Tech)', academicYear: '2025-26', currentSemester: 3, department: 'Information Technology', status: 'Active' },
      { id: 4, name: 'Batch 2021-2025 (B.Tech)', academicYear: '2024-25', currentSemester: 8, department: 'Electronics & Comm.', status: 'Graduated' },
    ],
  } as BatchesIndexProps,

  'Admin/Students/Index': {
    students: [
      { id: 1, rollNumber: '22CE001', name: 'Alexander Wright', email: 'a.wright@student.univ.edu', batch: 'Batch 2022-2026', division: 'Division A', department: 'Computer Engineering', feedbackStatus: 'Completed' },
      { id: 2, rollNumber: '22CE002', name: 'Sophia Martinez', email: 's.martinez@student.univ.edu', batch: 'Batch 2022-2026', division: 'Division A', department: 'Computer Engineering', feedbackStatus: 'Completed' },
      { id: 3, rollNumber: '22CE003', name: 'Ethan Hunt', email: 'e.hunt@student.univ.edu', batch: 'Batch 2022-2026', division: 'Division B', department: 'Computer Engineering', feedbackStatus: 'Pending' },
      { id: 4, rollNumber: '23IT014', name: 'Olivia Taylor', email: 'o.taylor@student.univ.edu', batch: 'Batch 2023-2027', division: 'Division A', department: 'Information Technology', feedbackStatus: 'Completed' },
      { id: 5, rollNumber: '23IT015', name: 'Lucas Scott', email: 'l.scott@student.univ.edu', batch: 'Batch 2023-2027', division: 'Division A', department: 'Information Technology', feedbackStatus: 'Pending' },
    ],
  } as StudentsIndexProps,

  'Admin/Electives/Index': {
    electives: [
      { id: 1, subjectCode: 'CS701', subjectName: 'Machine Learning & AI', department: 'Computer Engineering', batch: 'Batch 2022-2026', semester: 7, enrolledCount: 48, maxSeats: 60 },
      { id: 2, subjectCode: 'IT703', subjectName: 'Cloud Architecture & DevOps', department: 'Information Technology', batch: 'Batch 2022-2026', semester: 7, enrolledCount: 55, maxSeats: 60 },
      { id: 3, subjectCode: 'EC704', subjectName: 'IoT & Embedded Systems', department: 'Electronics & Comm.', batch: 'Batch 2022-2026', semester: 7, enrolledCount: 38, maxSeats: 50 },
      { id: 4, subjectCode: 'CS705', subjectName: 'Cybersecurity Fundamentals', department: 'Computer Engineering', batch: 'Batch 2022-2026', semester: 7, enrolledCount: 42, maxSeats: 50 },
    ],
  } as ElectivesIndexProps,

  'Admin/Electives/Enrollment': {
    elective: {
      id: 1,
      subjectCode: 'CS701',
      subjectName: 'Machine Learning & AI',
      batch: 'Batch 2022-2026',
    },
    availableStudents: [
      { id: 101, rollNumber: '22CE001', name: 'Alexander Wright', division: 'Division A', isEnrolled: true },
      { id: 102, rollNumber: '22CE002', name: 'Sophia Martinez', division: 'Division A', isEnrolled: true },
      { id: 103, rollNumber: '22CE003', name: 'Ethan Hunt', division: 'Division B', isEnrolled: false },
      { id: 104, rollNumber: '22CE004', name: 'Emily Davis', division: 'Division B', isEnrolled: true },
      { id: 105, rollNumber: '22CE005', name: 'Noah Wilson', division: 'Division A', isEnrolled: false },
    ],
  } as ElectiveEnrollmentProps,

  'Admin/SessionAssignments/Index': {
    assignments: [
      { id: 1, facultyName: 'Dr. Sarah Jenkins', subjectName: 'Data Structures & Algorithms', subjectCode: 'CS301', batchName: 'Batch 2023-2027', divisionName: 'Division A', semester: 3 },
      { id: 2, facultyName: 'Prof. Michael Chang', subjectName: 'Database Management Systems', subjectCode: 'IT302', batchName: 'Batch 2023-2027', divisionName: 'Division A', semester: 3 },
      { id: 3, facultyName: 'Dr. Anita Sharma', subjectName: 'Machine Learning', subjectCode: 'CS701', batchName: 'Batch 2022-2026', divisionName: 'Division B', semester: 7 },
      { id: 4, facultyName: 'Dr. Elena Rostova', subjectName: 'Digital Signal Processing', subjectCode: 'EC501', batchName: 'Batch 2023-2027', divisionName: 'Division A', semester: 5 },
    ],
    facultyList: [
      { id: 1, name: 'Dr. Sarah Jenkins' },
      { id: 2, name: 'Prof. Michael Chang' },
      { id: 3, name: 'Dr. Anita Sharma' },
      { id: 4, name: 'Dr. Elena Rostova' },
    ],
    subjectList: [
      { id: 1, name: 'Data Structures & Algorithms', code: 'CS301' },
      { id: 2, name: 'Database Management Systems', code: 'IT302' },
      { id: 3, name: 'Machine Learning', code: 'CS701' },
    ],
    batchList: [
      { id: 1, name: 'Batch 2022-2026' },
      { id: 2, name: 'Batch 2023-2027' },
    ],
  } as SessionAssignmentsIndexProps,

  'Admin/FeedbackImport/Index': {
    recentImports: [
      { id: 1, fileName: 'Student_Roster_Sem7_2026.csv', uploadedBy: 'Admin (Robert Vance)', recordCount: 245, status: 'Success', date: '2026-08-05 14:30' },
      { id: 2, fileName: 'Faculty_Session_Mapping_Fall.xlsx', uploadedBy: 'Admin (Robert Vance)', recordCount: 64, status: 'Success', date: '2026-08-04 11:15' },
      { id: 3, fileName: 'Elective_Selection_Data.csv', uploadedBy: 'HOD (Alan Turing)', recordCount: 180, status: 'Success', date: '2026-08-02 09:45' },
    ],
  } as FeedbackImportIndexProps,

  'Admin/Analytics/Index': {
    departmentRatings: [
      { department: 'Computer Engg', punctuality: 4.6, knowledge: 4.8, clarity: 4.5, material: 4.4, overall: 4.58 },
      { department: 'Information Tech', punctuality: 4.4, knowledge: 4.6, clarity: 4.3, material: 4.5, overall: 4.45 },
      { department: 'Electronics & Comm', punctuality: 4.3, knowledge: 4.5, clarity: 4.2, material: 4.1, overall: 4.28 },
      { department: 'Mechanical Engg', punctuality: 4.2, knowledge: 4.4, clarity: 4.0, material: 4.2, overall: 4.20 },
      { department: 'Civil Engg', punctuality: 4.1, knowledge: 4.3, clarity: 3.9, material: 4.0, overall: 4.08 },
    ],
    topFaculty: [
      { id: 1, name: 'Dr. Sarah Jenkins', department: 'Computer Engineering', avgRating: 4.92, totalResponses: 185 },
      { id: 2, name: 'Dr. Alan Turing', department: 'Computer Engineering', avgRating: 4.88, totalResponses: 190 },
      { id: 3, name: 'Prof. Michael Chang', department: 'Information Technology', avgRating: 4.78, totalResponses: 160 },
      { id: 4, name: 'Dr. Marie Curie', department: 'Applied Sciences', avgRating: 4.75, totalResponses: 210 },
    ],
    scoreDistribution: [
      { range: '4.5 - 5.0 (Excellent)', count: 68 },
      { range: '4.0 - 4.4 (Good)', count: 52 },
      { range: '3.5 - 3.9 (Average)', count: 18 },
      { range: '3.0 - 3.4 (Below Avg)', count: 6 },
      { range: '< 3.0 (Critical)', count: 4 },
    ],
  } as AnalyticsIndexProps,

  'Admin/Reports/Index': {
    reports: [
      { id: 1, title: 'Fall 2025 Institutional Faculty Feedback Summary', academicYear: '2025-26', term: 'Odd Semester', totalResponses: 3842, status: 'Published', generatedAt: '2026-08-01' },
      { id: 2, title: 'Department of Computer Engineering Detailed Evaluation', academicYear: '2025-26', term: 'Odd Semester', totalResponses: 1240, status: 'Published', generatedAt: '2026-08-02' },
      { id: 3, title: 'Elective Courses Student Rating Audit', academicYear: '2025-26', term: 'Odd Semester', totalResponses: 450, status: 'Draft', generatedAt: '2026-08-06' },
    ],
  } as ReportsIndexProps,

  'Admin/CriticalComments/Index': {
    comments: [
      { id: 1, facultyName: 'Prof. David Miller', subjectName: 'Thermodynamics', rating: 2, comment: 'Lectures often start late and course materials are uploaded right before exams.', severity: 'High', date: '2026-08-06', status: 'Pending' },
      { id: 2, facultyName: 'Dr. Elena Rostova', subjectName: 'Digital Signal Processing', rating: 2, comment: 'Speed of problem solving on the board is too fast to copy and understand.', severity: 'Medium', date: '2026-08-05', status: 'Reviewed' },
      { id: 3, facultyName: 'Prof. Robert Vance', subjectName: 'Structural Engineering', rating: 1, comment: 'Lab equipment is not demonstrated properly before student assignments.', severity: 'High', date: '2026-08-03', status: 'Pending' },
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
      { id: 101, subjectName: 'Data Structures & Algorithms', subjectCode: 'CS301', batchName: 'Batch 2023-2027', academicYear: '2025-26', totalStudents: 65, respondedStudents: 61, overallScore: 4.88, status: 'Published' },
      { id: 102, subjectName: 'Advanced Algorithms Lab', subjectCode: 'CS301L', batchName: 'Batch 2023-2027', academicYear: '2025-26', totalStudents: 65, respondedStudents: 59, overallScore: 4.94, status: 'Published' },
      { id: 103, subjectName: 'Machine Learning Fundamentals', subjectCode: 'CS701', batchName: 'Batch 2022-2026', academicYear: '2024-25', totalStudents: 50, respondedStudents: 48, overallScore: 4.76, status: 'Published' },
    ],
  } as FacultyReportsIndexProps,

  'Faculty/MyReports/Show': {
    report: {
      id: 101,
      subjectName: 'Data Structures & Algorithms',
      subjectCode: 'CS301',
      batchName: 'Batch 2023-2027 (Division A)',
      semester: 3,
      academicYear: '2025-26 (Odd Term)',
      totalStudents: 65,
      respondedStudents: 61,
      overallScore: 4.88,
      metrics: [
        { category: 'Punctuality & Attendance', score: 4.95 },
        { category: 'Subject Command & Depth', score: 4.92 },
        { category: 'Clarity of Explanation', score: 4.85 },
        { category: 'Learning Material & Slides', score: 4.80 },
        { category: 'Lab & Practical Guidance', score: 4.88 },
      ],
      comments: [
        { text: 'One of the best professors in the department! Algorithm visualizations made tree traversals crystal clear.', rating: 5, date: '2026-08-04' },
        { text: 'Extremely helpful during office hours when debugging recursion problems.', rating: 5, date: '2026-08-03' },
        { text: 'Pacing was great, though a few extra practice code sessions before midterms would be awesome.', rating: 4, date: '2026-08-02' },
      ],
    },
  } as FacultyReportShowProps,

  'Student/Identify': {
    error: undefined,
  } as StudentIdentifyProps,

  'Student/Feedback/Show': {
    student: {
      studentId: 'STU-2022-045',
      rollNumber: '22CE045',
      name: 'Alexander Wright',
      role: 'Student',
      program: 'B.Tech Computer Engineering',
      batch: 'Batch 2022–2026',
      division: 'Division A',
      department: 'Computer Engineering',
    },
    subjects: [
      {
        id: 101,
        subjectCode: 'CS701',
        subjectName: 'Database Management Systems',
        department: 'Computer Engineering',
        credits: 4,
        type: 'Core',
        facultyOptions: [
          { id: 1, name: 'Dr. Sarah Jenkins', designation: 'Professor', department: 'Computer Engineering' },
          { id: 2, name: 'Prof. Michael Chang', designation: 'Associate Professor', department: 'Computer Engineering' },
        ],
        parameters: [
          { id: 'p1', statement: '1. The faculty explains concepts clearly.', description: 'Pacing, clarity, and real-world examples during lectures' },
          { id: 'p2', statement: '2. The faculty demonstrates good subject knowledge.', description: 'Command over fundamental and advanced concepts' },
          { id: 'p3', statement: '3. The faculty completes the syllabus effectively.', description: 'Structured coverage of curriculum and practical labs' },
          { id: 'p4', statement: '4. The faculty provides useful study material.', description: 'Quality of notes, reference material, and practice problems' },
          { id: 'p5', statement: '5. The faculty maintains punctuality and classroom engagement.', description: 'Regularity, interactive teaching, and addressing student questions' },
        ],
      },
      {
        id: 102,
        subjectCode: 'CS702',
        subjectName: 'Design & Analysis of Algorithms',
        department: 'Computer Engineering',
        credits: 4,
        type: 'Core',
        facultyOptions: [
          { id: 3, name: 'Dr. Robert Smith', designation: 'Professor', department: 'Computer Engineering' },
        ],
        parameters: [
          { id: 'p1', statement: '1. The faculty explains concepts clearly.', description: 'Pacing, clarity, and real-world examples during lectures' },
          { id: 'p2', statement: '2. The faculty demonstrates good subject knowledge.', description: 'Command over fundamental and advanced concepts' },
          { id: 'p3', statement: '3. The faculty completes the syllabus effectively.', description: 'Structured coverage of curriculum and practical labs' },
          { id: 'p4', statement: '4. The faculty provides useful study material.', description: 'Quality of notes, reference material, and practice problems' },
          { id: 'p5', statement: '5. The faculty maintains punctuality and classroom engagement.', description: 'Regularity, interactive teaching, and addressing student questions' },
        ],
      },
      {
        id: 103,
        subjectCode: 'CS703',
        subjectName: 'Computer Organization & Architecture',
        department: 'Computer Engineering',
        credits: 3,
        type: 'Core',
        facultyOptions: [
          { id: 4, name: 'Dr. Emily Brown', designation: 'Professor', department: 'Computer Engineering' },
          { id: 5, name: 'Dr. David Wilson', designation: 'Assistant Professor', department: 'Computer Engineering' },
        ],
        parameters: [
          { id: 'p1', statement: '1. The faculty explains concepts clearly.', description: 'Pacing, clarity, and real-world examples during lectures' },
          { id: 'p2', statement: '2. The faculty demonstrates good subject knowledge.', description: 'Command over fundamental and advanced concepts' },
          { id: 'p3', statement: '3. The faculty completes the syllabus effectively.', description: 'Structured coverage of curriculum and practical labs' },
          { id: 'p4', statement: '4. The faculty provides useful study material.', description: 'Quality of notes, reference material, and practice problems' },
          { id: 'p5', statement: '5. The faculty maintains punctuality and classroom engagement.', description: 'Regularity, interactive teaching, and addressing student questions' },
        ],
      },
      {
        id: 104,
        subjectCode: 'CS704',
        subjectName: 'Operating Systems',
        department: 'Computer Engineering',
        credits: 4,
        type: 'Core',
        facultyOptions: [
          { id: 6, name: 'Prof. Alan Turing', designation: 'Professor', department: 'Computer Engineering' },
        ],
        parameters: [
          { id: 'p1', statement: '1. The faculty explains concepts clearly.', description: 'Pacing, clarity, and real-world examples during lectures' },
          { id: 'p2', statement: '2. The faculty demonstrates good subject knowledge.', description: 'Command over fundamental and advanced concepts' },
          { id: 'p3', statement: '3. The faculty completes the syllabus effectively.', description: 'Structured coverage of curriculum and practical labs' },
          { id: 'p4', statement: '4. The faculty provides useful study material.', description: 'Quality of notes, reference material, and practice problems' },
          { id: 'p5', statement: '5. The faculty maintains punctuality and classroom engagement.', description: 'Regularity, interactive teaching, and addressing student questions' },
        ],
      },
      {
        id: 105,
        subjectCode: 'CS705',
        subjectName: 'Computer Networks',
        department: 'Computer Engineering',
        credits: 4,
        type: 'Core',
        facultyOptions: [
          { id: 7, name: 'Dr. Claude Shannon', designation: 'Professor', department: 'Computer Engineering' },
          { id: 8, name: 'Dr. Grace Hopper', designation: 'Associate Professor', department: 'Computer Engineering' },
        ],
        parameters: [
          { id: 'p1', statement: '1. The faculty explains concepts clearly.', description: 'Pacing, clarity, and real-world examples during lectures' },
          { id: 'p2', statement: '2. The faculty demonstrates good subject knowledge.', description: 'Command over fundamental and advanced concepts' },
          { id: 'p3', statement: '3. The faculty completes the syllabus effectively.', description: 'Structured coverage of curriculum and practical labs' },
          { id: 'p4', statement: '4. The faculty provides useful study material.', description: 'Quality of notes, reference material, and practice problems' },
          { id: 'p5', statement: '5. The faculty maintains punctuality and classroom engagement.', description: 'Regularity, interactive teaching, and addressing student questions' },
        ],
      },
      {
        id: 106,
        subjectCode: 'CS706',
        subjectName: 'Software Engineering',
        department: 'Computer Engineering',
        credits: 3,
        type: 'Core',
        facultyOptions: [
          { id: 9, name: 'Prof. James Gosling', designation: 'Assistant Professor', department: 'Computer Engineering' },
        ],
        parameters: [
          { id: 'p1', statement: '1. The faculty explains concepts clearly.', description: 'Pacing, clarity, and real-world examples during lectures' },
          { id: 'p2', statement: '2. The faculty demonstrates good subject knowledge.', description: 'Command over fundamental and advanced concepts' },
          { id: 'p3', statement: '3. The faculty completes the syllabus effectively.', description: 'Structured coverage of curriculum and practical labs' },
          { id: 'p4', statement: '4. The faculty provides useful study material.', description: 'Quality of notes, reference material, and practice problems' },
          { id: 'p5', statement: '5. The faculty maintains punctuality and classroom engagement.', description: 'Regularity, interactive teaching, and addressing student questions' },
        ],
      },
      {
        id: 107,
        subjectCode: 'CS707',
        subjectName: 'Web Development & Cloud Architecture',
        department: 'Computer Engineering',
        credits: 3,
        type: 'Elective',
        facultyOptions: [
          { id: 10, name: 'Dr. Linus Torvalds', designation: 'Professor', department: 'Computer Engineering' },
        ],
        parameters: [
          { id: 'p1', statement: '1. The faculty explains concepts clearly.', description: 'Pacing, clarity, and real-world examples during lectures' },
          { id: 'p2', statement: '2. The faculty demonstrates good subject knowledge.', description: 'Command over fundamental and advanced concepts' },
          { id: 'p3', statement: '3. The faculty completes the syllabus effectively.', description: 'Structured coverage of curriculum and practical labs' },
          { id: 'p4', statement: '4. The faculty provides useful study material.', description: 'Quality of notes, reference material, and practice problems' },
          { id: 'p5', statement: '5. The faculty maintains punctuality and classroom engagement.', description: 'Regularity, interactive teaching, and addressing student questions' },
        ],
      },
    ],
  } as StudentFeedbackShowProps,
};
