import React, { useState } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { StudentsIndexProps, StudentItem } from '../../../types';
import { DataTable, Column } from '../../../Components/ui/DataTable';
import { StatusBadge } from '../../../Components/ui/StatusBadge';
import { Button } from '../../../Components/ui/Button';
import { Mail, Filter, Plus } from 'lucide-react';

import { getDepartmentName, ADMIN_DEPARTMENT_OPTIONS } from '../../../utils/departmentScope';

export default function Index({
  userRole = 'admin',
  assignedDepartmentCode = null,
  students,
}: StudentsIndexProps & { userRole?: 'admin' | 'hod'; assignedDepartmentCode?: string | null }) {
  const isAdministrator = userRole === 'admin';
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');

  const filteredStudents = students.filter((s) => {
    // Role scope check for HOD vs Admin filter
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
      header: 'Batch & Division',
      accessor: (row) => (
        <div className="text-xs">
          <p className="text-slate-800 font-medium">{row.batch}</p>
          <p className="text-slate-500">{row.division}</p>
        </div>
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
          {/* Department Filter for Admin */}
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
            <Button variant="primary" onClick={() => alert('Register Student Modal')}>
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
    </AdminLayout>
  );
}
