import React, { useState } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { StudentsIndexProps, StudentItem } from '../../../types';
import { DataTable, Column } from '../../../Components/ui/DataTable';
import { StatusBadge } from '../../../Components/ui/StatusBadge';
import { Button } from '../../../Components/ui/Button';
import { Mail, Filter, Plus } from 'lucide-react';

export default function Index({ students }: StudentsIndexProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredStudents = students.filter((s) => {
    if (statusFilter === 'all') return true;
    return s.feedbackStatus.toLowerCase() === statusFilter.toLowerCase();
  });

  const columns: Column<StudentItem>[] = [
    {
      header: 'Roll Number',
      accessor: (row) => (
        <span className="font-mono text-xs font-semibold px-2 py-1 bg-slate-900 border border-slate-800 rounded text-brand-400">
          {row.rollNumber}
        </span>
      ),
      sortable: true,
    },
    {
      header: 'Student Name',
      accessor: (row) => (
        <div>
          <p className="font-semibold text-slate-100">{row.name}</p>
          <p className="text-[11px] text-slate-400">{row.email}</p>
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Batch & Division',
      accessor: (row) => (
        <div className="text-xs">
          <p className="text-slate-200">{row.batch}</p>
          <p className="text-slate-400">{row.division}</p>
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
    <AdminLayout title="Student Directory" currentPath="#Admin/Students/Index">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Enrolled Students</h2>
          <p className="text-xs text-slate-400">Student roster and feedback completion status</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all">All Feedback Statuses</option>
              <option value="completed">Completed Feedback</option>
              <option value="pending">Pending Submission</option>
            </select>
          </div>

          <Button variant="primary" onClick={() => alert('Register Student Modal')}>
            <Plus className="w-4 h-4 mr-1.5" />
            Add Student
          </Button>
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
