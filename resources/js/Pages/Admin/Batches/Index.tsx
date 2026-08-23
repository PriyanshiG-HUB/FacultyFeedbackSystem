import React, { useState } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { BatchesIndexProps, BatchItem } from '../../../types';
import { DataTable, Column } from '../../../Components/ui/DataTable';
import { StatusBadge } from '../../../Components/ui/StatusBadge';
import { Button } from '../../../Components/ui/Button';
import { Modal } from '../../../Components/ui/Modal';
import { Input, Select } from '../../../Components/ui/Input';
import { useForm } from '../../../Components/shared/useForm';
import { DEPARTMENTS_LIST } from '../../../utils/departmentScope';
import { Plus } from 'lucide-react';

export default function Index({ batches: initialBatches }: BatchesIndexProps) {
  const [batchesList, setBatchesList] = useState<BatchItem[]>(initialBatches);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const form = useForm({
    name: '2025-29 (B.Tech IT)',
    department: 'Information Technology',
    academicYear: '2025-26',
    currentSemester: 1,
    status: 'Active' as 'Active' | 'Graduated',
  });

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const newBatch: BatchItem = {
      id: Date.now(),
      name: form.data.name,
      department: form.data.department,
      academicYear: form.data.academicYear,
      currentSemester: Number(form.data.currentSemester),
      status: form.data.status,
    };
    setBatchesList([newBatch, ...batchesList]);
    setIsModalOpen(false);
  };

  const columns: Column<BatchItem>[] = [
    {
      header: 'Graduation Batch / Cohort',
      accessor: (row) => <span className="font-bold text-slate-900">{row.name}</span>,
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
        <span className="font-mono text-xs font-bold px-2 py-0.5 bg-blue-50 border border-blue-200 rounded text-blue-700">
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
          <h2 className="text-xl font-bold text-slate-900">Graduation Batches & Cohorts</h2>
          <p className="text-xs text-slate-500">Track active student graduation cohorts and current semester progress</p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Create Graduation Batch
        </Button>
      </div>

      <DataTable data={batchesList} columns={columns} searchPlaceholder="Search batch by year or department..." />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Graduation Batch">
        <form onSubmit={handleCreateBatch} className="space-y-4">
          <Input
            label="Graduation Batch Title (e.g. 2025-29)"
            value={form.data.name}
            onChange={(e) => form.setData('name', e.target.value)}
            required
          />

          <Select
            label="Department"
            value={form.data.department}
            onChange={(e) => form.setData('department', e.target.value)}
          >
            {DEPARTMENTS_LIST.map((d) => (
              <option key={d.code} value={d.name}>
                {d.name}
              </option>
            ))}
          </Select>

          <Input
            label="Academic Year"
            value={form.data.academicYear}
            onChange={(e) => form.setData('academicYear', e.target.value)}
            required
          />

          <Select
            label="Current Semester"
            value={form.data.currentSemester}
            onChange={(e) => form.setData('currentSemester', Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
              <option key={sem} value={sem}>
                Semester {sem}
              </option>
            ))}
          </Select>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Batch
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
