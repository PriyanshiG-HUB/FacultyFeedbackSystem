import React, { useState } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { SubjectsIndexProps, SubjectItem } from '../../../types';
import { DataTable, Column } from '../../../Components/ui/DataTable';
import { StatusBadge } from '../../../Components/ui/StatusBadge';
import { Button } from '../../../Components/ui/Button';
import { BookOpen, Plus, Filter } from 'lucide-react';
import { getDepartmentName, ADMIN_DEPARTMENT_OPTIONS } from '../../../utils/departmentScope';

export default function Index({
  userRole = 'admin',
  assignedDepartmentCode = null,
  subjects,
}: SubjectsIndexProps & { userRole?: 'admin' | 'hod'; assignedDepartmentCode?: string | null }) {
  const isAdministrator = userRole === 'admin';
  const [deptFilter, setDeptFilter] = useState<string>('ALL');

  const filteredSubjects = subjects.filter((s) => {
    if (!isAdministrator && assignedDepartmentCode) {
      const targetDept = getDepartmentName(assignedDepartmentCode).toLowerCase();
      return s.department.toLowerCase().includes(targetDept) || targetDept.includes(s.department.toLowerCase());
    }
    if (isAdministrator && deptFilter !== 'ALL') {
      const targetDept = getDepartmentName(deptFilter).toLowerCase();
      return s.department.toLowerCase().includes(targetDept) || targetDept.includes(s.department.toLowerCase());
    }
    return true;
  });

  const columns: Column<SubjectItem>[] = [
    {
      header: 'Subject Code',
      accessor: (row) => (
        <span className="font-mono text-xs font-bold px-2 py-1 bg-blue-50 border border-blue-200 rounded text-blue-700">
          {row.code}
        </span>
      ),
      sortable: true,
    },
    {
      header: 'Course Name',
      accessor: (row) => <span className="font-bold text-slate-900">{row.name}</span>,
      sortable: true,
    },
    {
      header: 'Department',
      accessor: 'department',
      sortable: true,
    },
    {
      header: 'Course Type',
      accessor: (row) => <StatusBadge status={row.type} />,
      sortable: true,
    },
    {
      header: 'Semester',
      accessor: (row) => <span className="text-slate-700 font-medium">Semester {row.semester}</span>,
      sortable: true,
    },
    {
      header: 'Credits',
      accessor: (row) => <span className="text-slate-700 font-medium">{row.credits} Credits</span>,
      sortable: true,
    },
  ];

  return (
    <AdminLayout
      title="Course Subjects Catalog"
      currentPath="#Admin/Subjects/Index"
      userRole={userRole}
      departmentScope={isAdministrator ? 'All Departments' : getDepartmentName(assignedDepartmentCode)}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Subjects Directory</h2>
          <p className="text-xs text-slate-500">
            {isAdministrator
              ? 'Core and Elective academic subjects assigned across semesters'
              : `Academic subjects for ${getDepartmentName(assignedDepartmentCode)}`}
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

          {isAdministrator && (
            <Button variant="primary" onClick={() => alert('Add Subject dialog triggered')}>
              <Plus className="w-4 h-4 mr-1.5" />
              Add Subject
            </Button>
          )}
        </div>
      </div>

      <DataTable data={filteredSubjects} columns={columns} searchPlaceholder="Search subjects by code or title..." />
    </AdminLayout>
  );
}
