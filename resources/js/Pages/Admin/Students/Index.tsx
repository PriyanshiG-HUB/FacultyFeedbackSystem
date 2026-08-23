import React, { useState } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { StudentsIndexProps, StudentItem } from '../../../types';
import { DataTable, Column } from '../../../Components/ui/DataTable';
import { StatusBadge } from '../../../Components/ui/StatusBadge';
import { Button } from '../../../Components/ui/Button';
import { Modal } from '../../../Components/ui/Modal';
import { Input, Select } from '../../../Components/ui/Input';
import { Filter, Plus, Edit } from 'lucide-react';
import { getDepartmentName, ADMIN_DEPARTMENT_OPTIONS, DEPARTMENTS_LIST } from '../../../utils/departmentScope';

const HIERARCHY_OPTIONS: Record<
  string,
  {
    batch: string;
    semester: number;
    divisions: { name: string; sections: string[] }[];
  }[]
> = {
  'Information Technology': [
    {
      batch: '2022-26',
      semester: 7,
      divisions: [
        { name: 'Division 1', sections: ['A1', 'B1', 'C1'] },
        { name: 'Division 2', sections: ['A2', 'B2', 'C2'] },
      ],
    },
    {
      batch: '2023-27',
      semester: 5,
      divisions: [
        { name: 'Division 1', sections: ['A1', 'B1'] },
        { name: 'Division 2', sections: ['A2', 'B2'] },
      ],
    },
    {
      batch: '2024-28',
      semester: 3,
      divisions: [{ name: 'Division 1', sections: ['A1', 'B1'] }],
    },
  ],
  'Computer Engineering': [
    {
      batch: '2022-26',
      semester: 7,
      divisions: [{ name: 'Division 1', sections: ['A1', 'B1'] }],
    },
  ],
  'Computer Science & Engineering': [
    {
      batch: '2022-26',
      semester: 7,
      divisions: [{ name: 'Division 1', sections: ['A1', 'B1'] }],
    },
  ],
  'Electronics & Communication': [
    {
      batch: '2022-26',
      semester: 7,
      divisions: [{ name: 'Division 1', sections: ['A1', 'B1'] }],
    },
  ],
  'Mechanical Engineering': [
    {
      batch: '2022-26',
      semester: 7,
      divisions: [{ name: 'Division 1', sections: ['A1', 'B1'] }],
    },
  ],
};

export default function Index({
  userRole = 'admin',
  assignedDepartmentCode = null,
  students: initialStudents,
}: StudentsIndexProps & { userRole?: 'admin' | 'hod'; assignedDepartmentCode?: string | null }) {
  const isAdministrator = userRole === 'admin';
  const [studentsList, setStudentsList] = useState<StudentItem[]>(initialStudents);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<number | null>(null);

  // Form Fields
  const [rollNumber, setRollNumber] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedDept, setSelectedDept] = useState('Information Technology');
  const [selectedBatch, setSelectedBatch] = useState('2022-26');
  const [selectedDivision, setSelectedDivision] = useState('Division 1');
  const [selectedSection, setSelectedSection] = useState('A1');
  const [feedbackStatus, setFeedbackStatus] = useState<'Completed' | 'Pending'>('Pending');

  // Helper functions for dependent options
  const deptBatches = HIERARCHY_OPTIONS[selectedDept] || HIERARCHY_OPTIONS['Information Technology'];
  const activeBatchObj = deptBatches.find((b) => b.batch === selectedBatch) || deptBatches[0];
  const derivedSemester = activeBatchObj ? activeBatchObj.semester : 7;
  const availableDivisions = activeBatchObj ? activeBatchObj.divisions : [];
  const activeDivisionObj = availableDivisions.find((d) => d.name === selectedDivision) || availableDivisions[0];
  const availableSections = activeDivisionObj ? activeDivisionObj.sections : [];

  // Cascading Selection Reset Handlers
  const handleDeptChange = (newDept: string) => {
    setSelectedDept(newDept);
    const newBatches = HIERARCHY_OPTIONS[newDept] || HIERARCHY_OPTIONS['Information Technology'];
    if (newBatches.length > 0) {
      const firstBatch = newBatches[0];
      setSelectedBatch(firstBatch.batch);
      if (firstBatch.divisions.length > 0) {
        const firstDiv = firstBatch.divisions[0];
        setSelectedDivision(firstDiv.name);
        setSelectedSection(firstDiv.sections[0] || 'A1');
      } else {
        setSelectedDivision('');
        setSelectedSection('');
      }
    } else {
      setSelectedBatch('');
      setSelectedDivision('');
      setSelectedSection('');
    }
  };

  const handleBatchChange = (newBatch: string) => {
    setSelectedBatch(newBatch);
    const batchObj = deptBatches.find((b) => b.batch === newBatch);
    if (batchObj && batchObj.divisions.length > 0) {
      const firstDiv = batchObj.divisions[0];
      setSelectedDivision(firstDiv.name);
      setSelectedSection(firstDiv.sections[0] || 'A1');
    } else {
      setSelectedDivision('');
      setSelectedSection('');
    }
  };

  const handleDivisionChange = (newDiv: string) => {
    setSelectedDivision(newDiv);
    const divObj = availableDivisions.find((d) => d.name === newDiv);
    if (divObj && divObj.sections.length > 0) {
      setSelectedSection(divObj.sections[0]);
    } else {
      setSelectedSection('');
    }
  };

  // Open Modal for Create
  const handleOpenCreateModal = () => {
    setEditingStudentId(null);
    setRollNumber(`22IT${Math.floor(100 + Math.random() * 900)}`);
    setName('');
    setEmail('');
    handleDeptChange('Information Technology');
    setFeedbackStatus('Pending');
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (student: StudentItem) => {
    setEditingStudentId(student.id);
    setRollNumber(student.rollNumber);
    setName(student.name);
    setEmail(student.email);
    setSelectedDept(student.department);
    setSelectedBatch(student.batch);
    setSelectedDivision(student.division);
    setSelectedSection(student.section || 'A1');
    setFeedbackStatus(student.feedbackStatus);
    setIsModalOpen(true);
  };

  // Save Student (Add / Edit)
  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingStudentId) {
      setStudentsList((prev) =>
        prev.map((s) =>
          s.id === editingStudentId
            ? {
                ...s,
                rollNumber,
                name,
                email,
                department: selectedDept,
                batch: selectedBatch,
                currentSemester: derivedSemester,
                division: selectedDivision,
                section: selectedSection,
                feedbackStatus,
              }
            : s
        )
      );
    } else {
      const newStudent: StudentItem = {
        id: Date.now(),
        rollNumber,
        name,
        email,
        department: selectedDept,
        batch: selectedBatch,
        currentSemester: derivedSemester,
        division: selectedDivision,
        section: selectedSection,
        feedbackStatus,
      };
      setStudentsList([newStudent, ...studentsList]);
    }

    setIsModalOpen(false);
  };

  const filteredStudents = studentsList.filter((s) => {
    if (!isAdministrator && assignedDepartmentCode) {
      const targetDept = getDepartmentName(assignedDepartmentCode).toLowerCase();
      if (!s.department.toLowerCase().includes(targetDept) && !targetDept.includes(s.department.toLowerCase())) {
        return false;
      }
    } else if (isAdministrator && deptFilter !== 'ALL') {
      const targetDept = getDepartmentName(deptFilter).toLowerCase();
      if (!s.department.toLowerCase().includes(targetDept) && !targetDept.includes(s.department.toLowerCase())) {
        return false;
      }
    }

    if (statusFilter === 'all') return true;
    return s.feedbackStatus.toLowerCase() === statusFilter.toLowerCase();
  });

  const columns: Column<StudentItem>[] = [
    {
      header: 'Roll Number',
      accessor: (row) => (
        <span className="font-mono text-xs font-bold px-2 py-1 bg-blue-50 border border-blue-200 rounded text-blue-700">
          {row.rollNumber}
        </span>
      ),
      sortable: true,
    },
    {
      header: 'Student Name',
      accessor: (row) => (
        <div>
          <p className="font-bold text-slate-900">{row.name}</p>
          <p className="text-[11px] text-slate-500 font-medium">{row.email}</p>
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Graduation Batch & Semester',
      accessor: (row) => (
        <div className="text-xs">
          <p className="text-slate-800 font-bold">{row.batch}</p>
          <p className="text-slate-500">Semester {row.currentSemester || 7}</p>
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Division',
      accessor: (row) => <span className="text-xs font-semibold text-slate-800">{row.division}</span>,
      sortable: true,
    },
    {
      header: 'Section',
      accessor: (row) => (
        <span className="font-mono text-xs font-bold px-2 py-0.5 bg-indigo-50 border border-indigo-200 rounded text-indigo-700">
          {row.section || 'A1'}
        </span>
      ),
      sortable: true,
    },
    {
      header: 'Department',
      accessor: 'department',
      sortable: true,
    },
    {
      header: 'Feedback Status',
      accessor: (row) => <StatusBadge status={row.feedbackStatus} />,
      sortable: true,
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <button
          onClick={() => handleOpenEditModal(row)}
          className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          title="Edit Student Information"
        >
          <Edit className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <AdminLayout
      title="Student Directory"
      currentPath="#Admin/Students/Index"
      userRole={userRole}
      departmentScope={isAdministrator ? 'All Departments' : getDepartmentName(assignedDepartmentCode)}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Enrolled Students</h2>
          <p className="text-xs text-slate-500">
            {isAdministrator
              ? 'Student roster and feedback completion status across all departments'
              : `Student roster for ${getDepartmentName(assignedDepartmentCode)}`}
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
                {ADMIN_DEPARTMENT_OPTIONS.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <span className="px-3 py-1 bg-blue-50 text-blue-800 font-extrabold text-xs rounded-lg border border-blue-200">
              Scope: {getDepartmentName(assignedDepartmentCode)} Only
            </span>
          )}

          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs shadow-2xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-800 font-medium focus:outline-none cursor-pointer"
            >
              <option value="all">All Feedback Statuses</option>
              <option value="completed">Completed Feedback</option>
              <option value="pending">Pending Submission</option>
            </select>
          </div>

          {isAdministrator && (
            <Button variant="primary" onClick={handleOpenCreateModal}>
              <Plus className="w-4 h-4 mr-1.5" />
              Add Student
            </Button>
          )}
        </div>
      </div>

      <DataTable
        data={filteredStudents}
        columns={columns}
        searchPlaceholder="Search by roll number, student name or email..."
      />

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStudentId ? 'Edit Student Details' : 'Register New Student'}
      >
        <form onSubmit={handleSaveStudent} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Roll Number *"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              required
            />
            <Input
              label="Student Full Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <Input
            label="Email Address *"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Academic Hierarchy Selection */}
          <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">Academic Hierarchy</p>

            <Select
              label="1. Department *"
              value={selectedDept}
              onChange={(e) => handleDeptChange(e.target.value)}
            >
              {DEPARTMENTS_LIST.map((d) => (
                <option key={d.code} value={d.name}>
                  {d.name}
                </option>
              ))}
            </Select>

            <Select
              label="2. Graduation Batch *"
              value={selectedBatch}
              onChange={(e) => handleBatchChange(e.target.value)}
            >
              {deptBatches.map((b) => (
                <option key={b.batch} value={b.batch}>
                  Batch {b.batch} (Semester {b.semester})
                </option>
              ))}
            </Select>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Current Semester (Auto-Derived)</label>
              <div className="p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-blue-700">
                Semester {derivedSemester}
              </div>
            </div>

            <Select
              label="3. Division *"
              value={selectedDivision}
              onChange={(e) => handleDivisionChange(e.target.value)}
            >
              {availableDivisions.map((div) => (
                <option key={div.name} value={div.name}>
                  {div.name}
                </option>
              ))}
            </Select>

            <Select
              label="4. Section *"
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
            >
              {availableSections.map((sec) => (
                <option key={sec} value={sec}>
                  Section {sec}
                </option>
              ))}
            </Select>
          </div>

          <Select
            label="Feedback Submission Status"
            value={feedbackStatus}
            onChange={(e) => setFeedbackStatus(e.target.value as 'Completed' | 'Pending')}
          >
            <option value="Pending">Pending Submission</option>
            <option value="Completed">Completed</option>
          </Select>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingStudentId ? 'Save Changes' : 'Register Student'}
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
