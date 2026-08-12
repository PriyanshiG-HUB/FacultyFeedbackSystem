import {
  AdminDashboardProps,
  DepartmentsIndexProps,
  DepartmentsCreateProps,
  FacultyIndexProps,
  SubjectsIndexProps,
  DivisionsIndexProps,
  BatchesIndexProps,
  AcademicYearsIndexProps,
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

export const mockDepartmentSummaries = [
  { code: 'CE', name: 'Computer Engineering', hod: 'Dr. Alan Turing', studentCount: 140, facultyCount: 32, avgRating: 4.65, completionRate: 91.5 },
  { code: 'IT', name: 'Information Technology', hod: 'Dr. Grace Hopper', studentCount: 120, facultyCount: 28, avgRating: 4.52, completionRate: 89.2 },
  { code: 'CSE', name: 'Computer Science & Engineering', hod: 'Dr. Donald Knuth', studentCount: 160, facultyCount: 35, avgRating: 4.70, completionRate: 94.0 },
  { code: 'ECE', name: 'Electronics & Communication', hod: 'Dr. Claude Shannon', studentCount: 110, facultyCount: 24, avgRating: 4.40, completionRate: 86.5 },
  { code: 'ME', name: 'Mechanical Engineering', hod: 'Dr. James Watt', studentCount: 105, facultyCount: 26, avgRating: 4.35, completionRate: 84.0 },
];

export const mockPropsMap: Record<string, any> = {
  'Admin/Dashboard': {
    userRole: 'admin',
    assignedDepartmentCode: null,
    activeDepartmentCode: 'ALL',
    hodInfo: {
      name: 'Administrator',
      role: 'System Administrator',
      department: 'All Departments',
      departmentCode: 'ALL',
    },
    departmentOverviews: mockDepartmentSummaries,
    stats: [
      { label: 'Total Submissions', value: '5,420', change: '+12.8% across 5 depts', isPositive: true, icon: 'check-circle' },
      { label: 'Overall Avg Score', value: '4.54 / 5.0', change: '+0.15 points vs last term', isPositive: true, icon: 'star' },
      { label: 'Active Faculty Members', value: '145', change: 'Across 5 Departments', isPositive: true, icon: 'users' },
      { label: 'Active Student Batches', value: '24', change: '89.0% Completion Rate', isPositive: true, icon: 'building' },
    ],
    submissionTrends: [
      { month: 'Week 1', submissions: 620, avgRating: 4.38 },
      { month: 'Week 2', submissions: 1350, avgRating: 4.45 },
      { month: 'Week 3', submissions: 1980, avgRating: 4.52 },
      { month: 'Week 4', submissions: 990, avgRating: 4.60 },
      { month: 'Week 5', submissions: 480, avgRating: 4.54 },
    ],
    facultyPerformance: [
      { facultyName: 'Dr. Donald Knuth (CSE)', avgRating: 4.96, totalFeedback: 210 },
      { facultyName: 'Dr. Sarah Jenkins (IT)', avgRating: 4.92, totalFeedback: 185 },
      { facultyName: 'Dr. Alan Turing (CE)', avgRating: 4.88, totalFeedback: 175 },
      { facultyName: 'Prof. Michael Chang (IT)', avgRating: 4.85, totalFeedback: 160 },
      { facultyName: 'Dr. Claude Shannon (ECE)', avgRating: 4.78, totalFeedback: 150 },
    ],
    recentFeedback: [
      { id: 101, studentRoll: '22IT045', facultyName: 'Dr. Sarah Jenkins', subject: 'Database Management Systems', rating: 5, date: '10 mins ago', commentSnippet: 'Exceptional teaching methodology and clear SQL query explanations.' },
      { id: 102, studentRoll: '22CE018', facultyName: 'Dr. Alan Turing', subject: 'Theory of Computation', rating: 5, date: '18 mins ago', commentSnippet: 'Turing machines and automata concepts explained with supreme clarity.' },
      { id: 103, studentRoll: '22CS089', facultyName: 'Dr. Donald Knuth', subject: 'Advanced Algorithms', rating: 5, date: '35 mins ago', commentSnippet: 'Inspiring lectures on algorithm analysis and tree balancing.' },
      { id: 104, studentRoll: '22EC012', facultyName: 'Dr. Claude Shannon', subject: 'Digital Signal Processing', rating: 4, date: '1 hour ago', commentSnippet: 'Great hands-on Fourier transform demonstrations.' },
    ],
  } as AdminDashboardProps,

  'Admin/Departments/Index': {
    userRole: 'admin',
    assignedDepartmentCode: null,
    departments: [
      { id: 1, name: 'Computer Engineering', code: 'CE', hod: 'Dr. Alan Turing', facultyCount: 32, studentCount: 140, avgRating: 4.65, completionRate: 91.5, status: 'Active' },
      { id: 2, name: 'Information Technology', code: 'IT', hod: 'Dr. Grace Hopper', facultyCount: 28, studentCount: 120, avgRating: 4.52, completionRate: 89.2, status: 'Active' },
      { id: 3, name: 'Computer Science & Engineering', code: 'CSE', hod: 'Dr. Donald Knuth', facultyCount: 35, studentCount: 160, avgRating: 4.70, completionRate: 94.0, status: 'Active' },
      { id: 4, name: 'Electronics & Communication', code: 'ECE', hod: 'Dr. Claude Shannon', facultyCount: 24, studentCount: 110, avgRating: 4.40, completionRate: 86.5, status: 'Active' },
      { id: 5, name: 'Mechanical Engineering', code: 'ME', hod: 'Dr. James Watt', facultyCount: 26, studentCount: 105, avgRating: 4.35, completionRate: 84.0, status: 'Active' },
    ],
  } as DepartmentsIndexProps,

  'Admin/Departments/Create': {
    hodOptions: [
      { id: 10, name: 'Dr. Grace Hopper' },
      { id: 11, name: 'Dr. Alan Turing' },
      { id: 12, name: 'Dr. Donald Knuth' },
      { id: 13, name: 'Dr. Claude Shannon' },
      { id: 14, name: 'Dr. James Watt' },
    ],
  } as DepartmentsCreateProps,

  'Admin/Faculty/Index': {
    faculty: [
      { id: 1, name: 'Dr. Sarah Jenkins', email: 's.jenkins@univ.edu', department: 'Information Technology', designation: 'Professor', status: 'Active' },
      { id: 2, name: 'Prof. Michael Chang', email: 'm.chang@univ.edu', department: 'Information Technology', designation: 'Associate Professor', status: 'Active' },
      { id: 3, name: 'Dr. Alan Turing', email: 'a.turing@univ.edu', department: 'Computer Engineering', designation: 'Professor & HOD', status: 'Active' },
      { id: 4, name: 'Dr. Grace Hopper', email: 'g.hopper@univ.edu', department: 'Information Technology', designation: 'Professor & HOD', status: 'Active' },
      { id: 5, name: 'Dr. Donald Knuth', email: 'd.knuth@univ.edu', department: 'Computer Science & Engineering', designation: 'Professor & HOD', status: 'Active' },
      { id: 6, name: 'Dr. Claude Shannon', email: 'c.shannon@univ.edu', department: 'Electronics & Communication', designation: 'Professor & HOD', status: 'Active' },
      { id: 7, name: 'Dr. James Watt', email: 'j.watt@univ.edu', department: 'Mechanical Engineering', designation: 'Professor & HOD', status: 'Active' },
    ],
    departments: [
      { id: 1, name: 'Computer Engineering' },
      { id: 2, name: 'Information Technology' },
      { id: 3, name: 'Computer Science & Engineering' },
      { id: 4, name: 'Electronics & Communication' },
      { id: 5, name: 'Mechanical Engineering' },
    ],
  } as FacultyIndexProps,

  'Admin/Subjects/Index': {
    subjects: [
      { id: 1, name: 'Database Management Systems', code: 'IT701', department: 'Information Technology', type: 'Core', credits: 4, semester: 7 },
      { id: 2, name: 'Design & Analysis of Algorithms', code: 'IT702', department: 'Information Technology', type: 'Core', credits: 4, semester: 7 },
      { id: 3, name: 'Theory of Computation', code: 'CE701', department: 'Computer Engineering', type: 'Core', credits: 4, semester: 7 },
      { id: 4, name: 'Computer Architecture', code: 'CE702', department: 'Computer Engineering', type: 'Core', credits: 3, semester: 7 },
      { id: 5, name: 'Advanced Data Structures', code: 'CSE701', department: 'Computer Science & Engineering', type: 'Core', credits: 4, semester: 7 },
      { id: 6, name: 'Machine Learning', code: 'CSE702', department: 'Computer Science & Engineering', type: 'Elective', credits: 3, semester: 7 },
      { id: 7, name: 'Digital Signal Processing', code: 'EC701', department: 'Electronics & Communication', type: 'Core', credits: 4, semester: 7 },
      { id: 8, name: 'Thermodynamics & Heat Transfer', code: 'ME701', department: 'Mechanical Engineering', type: 'Core', credits: 4, semester: 7 },
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

  'Admin/AcademicYears/Index': {
    academicYears: [
      {
        id: '2025-26',
        academicYear: '2025-26',
        semesterType: 'Odd',
        semesters: [1, 3, 5, 7],
        activeCohortsCount: 16,
        cohorts: [
          // Computer Engineering (CE) - Odd
          {
            id: '2025-26-sem7-ce',
            semester: 7,
            semesterType: 'Odd',
            batch: 'Batch 2022-2026',
            department: 'Computer Engineering',
            departmentCode: 'CE',
            studentCount: 65,
            students: [
              { rollNo: '22CE001', name: 'David Miller', department: 'Computer Engineering', batch: 'Batch 2022-2026', semester: 7, division: 'CE-1', status: 'Active' },
              { rollNo: '22CE002', name: 'Emma Watson', department: 'Computer Engineering', batch: 'Batch 2022-2026', semester: 7, division: 'CE-1', status: 'Active' },
            ],
          },
          {
            id: '2025-26-sem5-ce',
            semester: 5,
            semesterType: 'Odd',
            batch: 'Batch 2023-2027',
            department: 'Computer Engineering',
            departmentCode: 'CE',
            studentCount: 64,
            students: [
              { rollNo: '23CE001', name: 'Benjamin Taylor', department: 'Computer Engineering', batch: 'Batch 2023-2027', semester: 5, division: 'CE-1', status: 'Active' },
            ],
          },
          {
            id: '2025-26-sem3-ce',
            semester: 3,
            semesterType: 'Odd',
            batch: 'Batch 2024-2028',
            department: 'Computer Engineering',
            departmentCode: 'CE',
            studentCount: 70,
            students: [
              { rollNo: '24CE001', name: 'Charlotte Evans', department: 'Computer Engineering', batch: 'Batch 2024-2028', semester: 3, division: 'CE-1', status: 'Active' },
            ],
          },
          {
            id: '2025-26-sem1-ce',
            semester: 1,
            semesterType: 'Odd',
            batch: 'Batch 2025-2029',
            department: 'Computer Engineering',
            departmentCode: 'CE',
            studentCount: 72,
            students: [
              { rollNo: '25CE001', name: 'Henry Clark', department: 'Computer Engineering', batch: 'Batch 2025-2029', semester: 1, division: 'CE-1', status: 'Active' },
            ],
          },

          // Computer Science & Engineering (CSE) - Odd
          {
            id: '2025-26-sem7-cse',
            semester: 7,
            semesterType: 'Odd',
            batch: 'Batch 2022-2026',
            department: 'Computer Science & Engineering',
            departmentCode: 'CSE',
            studentCount: 70,
            students: [
              { rollNo: '22CSE001', name: 'Lucas Scott', department: 'Computer Science & Engineering', batch: 'Batch 2022-2026', semester: 7, division: 'CSE-1', status: 'Active' },
            ],
          },
          {
            id: '2025-26-sem5-cse',
            semester: 5,
            semesterType: 'Odd',
            batch: 'Batch 2023-2027',
            department: 'Computer Science & Engineering',
            departmentCode: 'CSE',
            studentCount: 68,
            students: [
              { rollNo: '23CSE001', name: 'Amelia Harris', department: 'Computer Science & Engineering', batch: 'Batch 2023-2027', semester: 5, division: 'CSE-1', status: 'Active' },
            ],
          },
          {
            id: '2025-26-sem3-cse',
            semester: 3,
            semesterType: 'Odd',
            batch: 'Batch 2024-2028',
            department: 'Computer Science & Engineering',
            departmentCode: 'CSE',
            studentCount: 74,
            students: [
              { rollNo: '24CSE001', name: 'Mason White', department: 'Computer Science & Engineering', batch: 'Batch 2024-2028', semester: 3, division: 'CSE-1', status: 'Active' },
            ],
          },
          {
            id: '2025-26-sem1-cse',
            semester: 1,
            semesterType: 'Odd',
            batch: 'Batch 2025-2029',
            department: 'Computer Science & Engineering',
            departmentCode: 'CSE',
            studentCount: 76,
            students: [
              { rollNo: '25CSE001', name: 'Harper King', department: 'Computer Science & Engineering', batch: 'Batch 2025-2029', semester: 1, division: 'CSE-1', status: 'Active' },
            ],
          },

          // Information Technology (IT) - Odd
          {
            id: '2025-26-sem7-it',
            semester: 7,
            semesterType: 'Odd',
            batch: 'Batch 2022-2026',
            department: 'Information Technology',
            departmentCode: 'IT',
            studentCount: 62,
            students: [
              { rollNo: '22IT001', name: 'Alex Turner', department: 'Information Technology', batch: 'Batch 2022-2026', semester: 7, division: 'IT-1', status: 'Active' },
              { rollNo: '22IT002', name: 'Sophia Martinez', department: 'Information Technology', batch: 'Batch 2022-2026', semester: 7, division: 'IT-1', status: 'Active' },
              { rollNo: '22IT021', name: 'Ethan Hunt', department: 'Information Technology', batch: 'Batch 2022-2026', semester: 7, division: 'IT-2', status: 'Active' },
            ],
          },
          {
            id: '2025-26-sem5-it',
            semester: 5,
            semesterType: 'Odd',
            batch: 'Batch 2023-2027',
            department: 'Information Technology',
            departmentCode: 'IT',
            studentCount: 68,
            students: [
              { rollNo: '23IT001', name: 'Liam Johnson', department: 'Information Technology', batch: 'Batch 2023-2027', semester: 5, division: 'IT-1', status: 'Active' },
              { rollNo: '23IT002', name: 'Emma Watson', department: 'Information Technology', batch: 'Batch 2023-2027', semester: 5, division: 'IT-1', status: 'Active' },
            ],
          },
          {
            id: '2025-26-sem3-it',
            semester: 3,
            semesterType: 'Odd',
            batch: 'Batch 2024-2028',
            department: 'Information Technology',
            departmentCode: 'IT',
            studentCount: 71,
            students: [
              { rollNo: '24IT001', name: 'Oliver Smith', department: 'Information Technology', batch: 'Batch 2024-2028', semester: 3, division: 'IT-1', status: 'Active' },
            ],
          },
          {
            id: '2025-26-sem1-it',
            semester: 1,
            semesterType: 'Odd',
            batch: 'Batch 2025-2029',
            department: 'Information Technology',
            departmentCode: 'IT',
            studentCount: 75,
            students: [
              { rollNo: '25IT001', name: 'James Wilson', department: 'Information Technology', batch: 'Batch 2025-2029', semester: 1, division: 'IT-1', status: 'Active' },
            ],
          },

          // Artificial Intelligence & Machine Learning (AIML) - Odd
          {
            id: '2025-26-sem7-aiml',
            semester: 7,
            semesterType: 'Odd',
            batch: 'Batch 2022-2026',
            department: 'Artificial Intelligence & Machine Learning',
            departmentCode: 'AIML',
            studentCount: 60,
            students: [
              { rollNo: '22AIML001', name: 'Aarav Patel', department: 'Artificial Intelligence & Machine Learning', batch: 'Batch 2022-2026', semester: 7, division: 'AIML-1', status: 'Active' },
            ],
          },
          {
            id: '2025-26-sem5-aiml',
            semester: 5,
            semesterType: 'Odd',
            batch: 'Batch 2023-2027',
            department: 'Artificial Intelligence & Machine Learning',
            departmentCode: 'AIML',
            studentCount: 64,
            students: [
              { rollNo: '23AIML001', name: 'Ananya Sharma', department: 'Artificial Intelligence & Machine Learning', batch: 'Batch 2023-2027', semester: 5, division: 'AIML-1', status: 'Active' },
            ],
          },
          {
            id: '2025-26-sem3-aiml',
            semester: 3,
            semesterType: 'Odd',
            batch: 'Batch 2024-2028',
            department: 'Artificial Intelligence & Machine Learning',
            departmentCode: 'AIML',
            studentCount: 66,
            students: [
              { rollNo: '24AIML001', name: 'Rohan Gupta', department: 'Artificial Intelligence & Machine Learning', batch: 'Batch 2024-2028', semester: 3, division: 'AIML-1', status: 'Active' },
            ],
          },
          {
            id: '2025-26-sem1-aiml',
            semester: 1,
            semesterType: 'Odd',
            batch: 'Batch 2025-2029',
            department: 'Artificial Intelligence & Machine Learning',
            departmentCode: 'AIML',
            studentCount: 70,
            students: [
              { rollNo: '25AIML001', name: 'Diya Verma', department: 'Artificial Intelligence & Machine Learning', batch: 'Batch 2025-2029', semester: 1, division: 'AIML-1', status: 'Active' },
            ],
          },
        ],
      },
      {
        id: '2026-27',
        academicYear: '2026-27',
        semesterType: 'Even',
        semesters: [2, 4, 6, 8],
        activeCohortsCount: 16,
        cohorts: [
          // Computer Engineering (CE) - Even
          {
            id: '2026-27-sem8-ce',
            semester: 8,
            semesterType: 'Even',
            batch: 'Batch 2022-2026',
            department: 'Computer Engineering',
            departmentCode: 'CE',
            studentCount: 65,
            students: [
              { rollNo: '22CE001', name: 'David Miller', department: 'Computer Engineering', batch: 'Batch 2022-2026', semester: 8, division: 'CE-1', status: 'Active' },
            ],
          },
          {
            id: '2026-27-sem6-ce',
            semester: 6,
            semesterType: 'Even',
            batch: 'Batch 2023-2027',
            department: 'Computer Engineering',
            departmentCode: 'CE',
            studentCount: 64,
            students: [
              { rollNo: '23CE001', name: 'Benjamin Taylor', department: 'Computer Engineering', batch: 'Batch 2023-2027', semester: 6, division: 'CE-1', status: 'Active' },
            ],
          },
          {
            id: '2026-27-sem4-ce',
            semester: 4,
            semesterType: 'Even',
            batch: 'Batch 2024-2028',
            department: 'Computer Engineering',
            departmentCode: 'CE',
            studentCount: 70,
            students: [
              { rollNo: '24CE001', name: 'Charlotte Evans', department: 'Computer Engineering', batch: 'Batch 2024-2028', semester: 4, division: 'CE-1', status: 'Active' },
            ],
          },
          {
            id: '2026-27-sem2-ce',
            semester: 2,
            semesterType: 'Even',
            batch: 'Batch 2025-2029',
            department: 'Computer Engineering',
            departmentCode: 'CE',
            studentCount: 72,
            students: [
              { rollNo: '25CE001', name: 'Henry Clark', department: 'Computer Engineering', batch: 'Batch 2025-2029', semester: 2, division: 'CE-1', status: 'Active' },
            ],
          },

          // Computer Science & Engineering (CSE) - Even
          {
            id: '2026-27-sem8-cse',
            semester: 8,
            semesterType: 'Even',
            batch: 'Batch 2022-2026',
            department: 'Computer Science & Engineering',
            departmentCode: 'CSE',
            studentCount: 70,
            students: [
              { rollNo: '22CSE001', name: 'Lucas Scott', department: 'Computer Science & Engineering', batch: 'Batch 2022-2026', semester: 8, division: 'CSE-1', status: 'Active' },
            ],
          },
          {
            id: '2026-27-sem6-cse',
            semester: 6,
            semesterType: 'Even',
            batch: 'Batch 2023-2027',
            department: 'Computer Science & Engineering',
            departmentCode: 'CSE',
            studentCount: 68,
            students: [
              { rollNo: '23CSE001', name: 'Amelia Harris', department: 'Computer Science & Engineering', batch: 'Batch 2023-2027', semester: 6, division: 'CSE-1', status: 'Active' },
            ],
          },
          {
            id: '2026-27-sem4-cse',
            semester: 4,
            semesterType: 'Even',
            batch: 'Batch 2024-2028',
            department: 'Computer Science & Engineering',
            departmentCode: 'CSE',
            studentCount: 74,
            students: [
              { rollNo: '24CSE001', name: 'Mason White', department: 'Computer Science & Engineering', batch: 'Batch 2024-2028', semester: 4, division: 'CSE-1', status: 'Active' },
            ],
          },
          {
            id: '2026-27-sem2-cse',
            semester: 2,
            semesterType: 'Even',
            batch: 'Batch 2025-2029',
            department: 'Computer Science & Engineering',
            departmentCode: 'CSE',
            studentCount: 76,
            students: [
              { rollNo: '25CSE001', name: 'Harper King', department: 'Computer Science & Engineering', batch: 'Batch 2025-2029', semester: 2, division: 'CSE-1', status: 'Active' },
            ],
          },

          // Information Technology (IT) - Even
          {
            id: '2026-27-sem8-it',
            semester: 8,
            semesterType: 'Even',
            batch: 'Batch 2022-2026',
            department: 'Information Technology',
            departmentCode: 'IT',
            studentCount: 62,
            students: [
              { rollNo: '22IT001', name: 'Alex Turner', department: 'Information Technology', batch: 'Batch 2022-2026', semester: 8, division: 'IT-1', status: 'Active' },
              { rollNo: '22IT002', name: 'Sophia Martinez', department: 'Information Technology', batch: 'Batch 2022-2026', semester: 8, division: 'IT-1', status: 'Active' },
            ],
          },
          {
            id: '2026-27-sem6-it',
            semester: 6,
            semesterType: 'Even',
            batch: 'Batch 2023-2027',
            department: 'Information Technology',
            departmentCode: 'IT',
            studentCount: 68,
            students: [
              { rollNo: '23IT001', name: 'Liam Johnson', department: 'Information Technology', batch: 'Batch 2023-2027', semester: 6, division: 'IT-1', status: 'Active' },
            ],
          },
          {
            id: '2026-27-sem4-it',
            semester: 4,
            semesterType: 'Even',
            batch: 'Batch 2024-2028',
            department: 'Information Technology',
            departmentCode: 'IT',
            studentCount: 71,
            students: [
              { rollNo: '24IT001', name: 'Oliver Smith', department: 'Information Technology', batch: 'Batch 2024-2028', semester: 4, division: 'IT-1', status: 'Active' },
            ],
          },
          {
            id: '2026-27-sem2-it',
            semester: 2,
            semesterType: 'Even',
            batch: 'Batch 2025-2029',
            department: 'Information Technology',
            departmentCode: 'IT',
            studentCount: 75,
            students: [
              { rollNo: '25IT001', name: 'James Wilson', department: 'Information Technology', batch: 'Batch 2025-2029', semester: 2, division: 'IT-1', status: 'Active' },
            ],
          },

          // Artificial Intelligence & Machine Learning (AIML) - Even
          {
            id: '2026-27-sem8-aiml',
            semester: 8,
            semesterType: 'Even',
            batch: 'Batch 2022-2026',
            department: 'Artificial Intelligence & Machine Learning',
            departmentCode: 'AIML',
            studentCount: 60,
            students: [
              { rollNo: '22AIML001', name: 'Aarav Patel', department: 'Artificial Intelligence & Machine Learning', batch: 'Batch 2022-2026', semester: 8, division: 'AIML-1', status: 'Active' },
            ],
          },
          {
            id: '2026-27-sem6-aiml',
            semester: 6,
            semesterType: 'Even',
            batch: 'Batch 2023-2027',
            department: 'Artificial Intelligence & Machine Learning',
            departmentCode: 'AIML',
            studentCount: 64,
            students: [
              { rollNo: '23AIML001', name: 'Ananya Sharma', department: 'Artificial Intelligence & Machine Learning', batch: 'Batch 2023-2027', semester: 6, division: 'AIML-1', status: 'Active' },
            ],
          },
          {
            id: '2026-27-sem4-aiml',
            semester: 4,
            semesterType: 'Even',
            batch: 'Batch 2024-2028',
            department: 'Artificial Intelligence & Machine Learning',
            departmentCode: 'AIML',
            studentCount: 66,
            students: [
              { rollNo: '24AIML001', name: 'Rohan Gupta', department: 'Artificial Intelligence & Machine Learning', batch: 'Batch 2024-2028', semester: 4, division: 'AIML-1', status: 'Active' },
            ],
          },
          {
            id: '2026-27-sem2-aiml',
            semester: 2,
            semesterType: 'Even',
            batch: 'Batch 2025-2029',
            department: 'Artificial Intelligence & Machine Learning',
            departmentCode: 'AIML',
            studentCount: 70,
            students: [
              { rollNo: '25AIML001', name: 'Diya Verma', department: 'Artificial Intelligence & Machine Learning', batch: 'Batch 2025-2029', semester: 2, division: 'AIML-1', status: 'Active' },
            ],
          },
        ],
      },
    ],
  } as AcademicYearsIndexProps,

  'Admin/Students/Index': {
    students: [
      { id: 1, rollNumber: '22IT001', name: 'Alexander Wright', email: 'a.wright@student.univ.edu', batch: 'Batch 2022-2026', division: 'Division A', department: 'Information Technology', feedbackStatus: 'Completed' },
      { id: 2, rollNumber: '22IT002', name: 'Sophia Martinez', email: 's.martinez@student.univ.edu', batch: 'Batch 2022-2026', division: 'Division A', department: 'Information Technology', feedbackStatus: 'Completed' },
      { id: 3, rollNumber: '22IT003', name: 'Ethan Hunt', email: 'e.hunt@student.univ.edu', batch: 'Batch 2022-2026', division: 'Division B', department: 'Information Technology', feedbackStatus: 'Pending' },
      { id: 4, rollNumber: '22CE001', name: 'David Miller', email: 'd.miller@student.univ.edu', batch: 'Batch 2022-2026', division: 'Division A', department: 'Computer Engineering', feedbackStatus: 'Completed' },
      { id: 5, rollNumber: '22CE002', name: 'Emma Watson', email: 'e.watson@student.univ.edu', batch: 'Batch 2022-2026', division: 'Division A', department: 'Computer Engineering', feedbackStatus: 'Completed' },
      { id: 6, rollNumber: '22CS001', name: 'Lucas Scott', email: 'l.scott@student.univ.edu', batch: 'Batch 2022-2026', division: 'Division A', department: 'Computer Science & Engineering', feedbackStatus: 'Completed' },
      { id: 7, rollNumber: '22EC001', name: 'Olivia Brown', email: 'o.brown@student.univ.edu', batch: 'Batch 2022-2026', division: 'Division A', department: 'Electronics & Communication', feedbackStatus: 'Pending' },
      { id: 8, rollNumber: '22ME001', name: 'Noah Davis', email: 'n.davis@student.univ.edu', batch: 'Batch 2022-2026', division: 'Division A', department: 'Mechanical Engineering', feedbackStatus: 'Completed' },
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
      departmentCode: 'IT',
      batch: 'Batch 2022-2026',
      division: 'Division A',
      divisionCode: 'IT-1',
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
      departmentCode: 'IT',
      batch: 'Batch 2022-2026',
      division: 'Division A',
      divisionCode: 'IT-1',
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
        departmentCode: 'IT',
        facultyOptions: [
          { id: 1, name: 'Dr. Sarah Jenkins', designation: 'Professor', department: 'Information Technology', departmentCode: 'IT', division: 'Division A', divisionCode: 'IT-1', subjectCode: 'IT701' },
          { id: 2, name: 'Prof. Sagar Patel', designation: 'Assistant Professor', department: 'Information Technology', departmentCode: 'IT', division: 'Division A', divisionCode: 'IT-1', subjectCode: 'IT701' },
          { id: 3, name: 'Prof. Nishat Shaikh', designation: 'Associate Professor', department: 'Information Technology', departmentCode: 'IT', division: 'Division B', divisionCode: 'IT-2', subjectCode: 'IT701' },
        ],
      },
      {
        id: 2,
        subjectCode: 'IT702',
        subjectName: 'Design & Analysis of Algorithms',
        credits: 4,
        type: 'Core',
        department: 'Information Technology',
        departmentCode: 'IT',
        facultyOptions: [
          { id: 4, name: 'Dr. Robert Smith', designation: 'Professor', department: 'Information Technology', departmentCode: 'IT', division: 'Division A', divisionCode: 'IT-1', subjectCode: 'IT702' },
          { id: 5, name: 'Prof. Amit Shah', designation: 'Associate Professor', department: 'Information Technology', departmentCode: 'IT', division: 'Division A', divisionCode: 'IT-1', subjectCode: 'IT702' },
          { id: 6, name: 'Dr. Emily Brown', designation: 'Professor', department: 'Information Technology', departmentCode: 'IT', division: 'Division B', divisionCode: 'IT-2', subjectCode: 'IT702' },
        ],
      },
      {
        id: 3,
        subjectCode: 'IT703',
        subjectName: 'Computer Organization & Architecture',
        credits: 3,
        type: 'Core',
        department: 'Information Technology',
        departmentCode: 'IT',
        facultyOptions: [
          { id: 7, name: 'Dr. David Wilson', designation: 'Assistant Professor', department: 'Information Technology', departmentCode: 'IT', division: 'Division A', divisionCode: 'IT-1', subjectCode: 'IT703' },
          { id: 8, name: 'Prof. Alan Turing', designation: 'Professor', department: 'Information Technology', departmentCode: 'IT', division: 'Division B', divisionCode: 'IT-2', subjectCode: 'IT703' },
        ],
      },
      {
        id: 4,
        subjectCode: 'IT704',
        subjectName: 'Operating Systems',
        credits: 4,
        type: 'Core',
        department: 'Information Technology',
        departmentCode: 'IT',
        facultyOptions: [
          { id: 9, name: 'Dr. Claude Shannon', designation: 'Professor', department: 'Information Technology', departmentCode: 'IT', division: 'Division A', divisionCode: 'IT-1', subjectCode: 'IT704' },
          { id: 10, name: 'Dr. Grace Hopper', designation: 'Associate Professor', department: 'Information Technology', departmentCode: 'IT', division: 'Division B', divisionCode: 'IT-2', subjectCode: 'IT704' },
        ],
      },
      {
        id: 5,
        subjectCode: 'IT705',
        subjectName: 'Computer Networks',
        credits: 4,
        type: 'Core',
        department: 'Information Technology',
        departmentCode: 'IT',
        facultyOptions: [
          { id: 11, name: 'Prof. James Gosling', designation: 'Assistant Professor', department: 'Information Technology', departmentCode: 'IT', division: 'Division A', divisionCode: 'IT-1', subjectCode: 'IT705' },
        ],
      },
      {
        id: 6,
        subjectCode: 'IT706',
        subjectName: 'Software Engineering',
        credits: 3,
        type: 'Core',
        department: 'Information Technology',
        departmentCode: 'IT',
        facultyOptions: [
          { id: 12, name: 'Dr. Linus Torvalds', designation: 'Professor', department: 'Information Technology', departmentCode: 'IT', division: 'Division A', divisionCode: 'IT-1', subjectCode: 'IT706' },
        ],
      },
    ],
  } as StudentFeedbackShowProps,
};
