import React from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { SubjectsIndexProps, SubjectItem } from '../../../types';
import { DataTable, Column } from '../../../Components/ui/DataTable';
import { StatusBadge } from '../../../Components/ui/StatusBadge';
import { Button } from '../../../Components/ui/Button';
import { BookOpen, Plus } from 'lucide-react';

export default function Index({ subjects }: SubjectsIndexProps) {
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
    <AdminLayout title="Course Subjects Catalog" currentPath="#Admin/Subjects/Index">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Subjects Directory</h2>
          <p className="text-xs text-slate-500">Core and Elective academic subjects assigned across semesters</p>
        </div>
        <Button variant="primary" onClick={() => alert('Add Subject dialog triggered')}>
          <Plus className="w-4 h-4 mr-1.5" />
          Add Subject
        </Button>
      </div>

      <DataTable data={subjects} columns={columns} searchPlaceholder="Search subjects by code or title..." />
    </AdminLayout>
  );
}
