import React from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { BatchesIndexProps, BatchItem } from '../../../types';
import { DataTable, Column } from '../../../Components/ui/DataTable';
import { StatusBadge } from '../../../Components/ui/StatusBadge';
import { Button } from '../../../Components/ui/Button';
import { GraduationCap, Plus } from 'lucide-react';

export default function Index({ batches }: BatchesIndexProps) {
  const columns: Column<BatchItem>[] = [
    {
      header: 'Batch Title',
      accessor: (row) => <span className="font-semibold text-slate-100">{row.name}</span>,
      sortable: true,
    },
    {
      header: 'Department',
      accessor: 'department',
      sortable: true,
    },
    {
      header: 'Academic Year',
      accessor: 'academicYear',
      sortable: true,
    },
    {
      header: 'Current Semester',
      accessor: (row) => (
        <span className="font-mono text-xs px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-brand-400">
          Semester {row.currentSemester}
        </span>
      ),
      sortable: true,
    },
    {
      header: 'Status',
      accessor: (row) => <StatusBadge status={row.status} />,
      sortable: true,
    },
  ];

  return (
    <AdminLayout title="Student Batches" currentPath="#Admin/Batches/Index">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Batches & Graduating Classes</h2>
          <p className="text-xs text-slate-400">Track active student cohorts and academic semester progress</p>
        </div>
        <Button variant="primary" onClick={() => alert('Create Batch dialog')}>
          <Plus className="w-4 h-4 mr-1.5" />
          Create Batch
        </Button>
      </div>

      <DataTable data={batches} columns={columns} searchPlaceholder="Search batch by year or department..." />
    </AdminLayout>
  );
}
