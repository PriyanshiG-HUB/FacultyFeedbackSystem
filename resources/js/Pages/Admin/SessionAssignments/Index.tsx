import React, { useState } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { SessionAssignmentsIndexProps, SessionAssignmentItem } from '../../../types';
import { DataTable, Column } from '../../../Components/ui/DataTable';
import { Button } from '../../../Components/ui/Button';
import { Modal } from '../../../Components/ui/Modal';
import { Select } from '../../../Components/ui/Input';
import { useForm } from '../../../Components/shared/useForm';
import { CalendarRange, Plus } from 'lucide-react';

export default function Index({
  assignments,
  facultyList,
  subjectList,
  batchList,
}: SessionAssignmentsIndexProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const form = useForm({
    faculty_id: facultyList[0]?.id || '',
    subject_id: subjectList[0]?.id || '',
    batch_id: batchList[0]?.id || '',
    division_name: 'Division A',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.submit('post', '#Admin/SessionAssignments/Index', {
      onSuccess: () => setIsModalOpen(false),
    });
  };

  const columns: Column<SessionAssignmentItem>[] = [
    {
      header: 'Faculty Member',
      accessor: (row) => <span className="font-bold text-slate-900">{row.facultyName}</span>,
      sortable: true,
    },
    {
      header: 'Subject Code & Title',
      accessor: (row) => (
        <div>
          <span className="font-mono text-xs font-bold px-2 py-0.5 bg-blue-50 border border-blue-200 rounded text-blue-700 mr-2">
            {row.subjectCode}
          </span>
          <span className="text-slate-800 font-medium">{row.subjectName}</span>
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Assigned Batch',
      accessor: 'batchName',
      sortable: true,
    },
    {
      header: 'Division & Semester',
      accessor: (row) => (
        <div className="text-xs">
          <p className="text-slate-800 font-medium">{row.divisionName}</p>
          <p className="text-slate-500">Semester {row.semester}</p>
        </div>
      ),
      sortable: true,
    },
  ];

  return (
    <AdminLayout title="Session Allocations" currentPath="#Admin/SessionAssignments/Index">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Faculty Session Allocations</h2>
          <p className="text-xs text-slate-500">Map faculty members to subjects, student batches, and semester sessions</p>
        </div>

        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          New Session Assignment
        </Button>
      </div>

      <DataTable
        data={assignments}
        columns={columns}
        searchPlaceholder="Search allocations by faculty, subject or batch..."
      />

      {/* New Assignment Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Assign Faculty to Session">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Select Faculty Member"
            value={form.data.faculty_id}
            onChange={(e) => form.setData('faculty_id', e.target.value)}
          >
            {facultyList.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </Select>

          <Select
            label="Select Course Subject"
            value={form.data.subject_id}
            onChange={(e) => form.setData('subject_id', e.target.value)}
          >
            {subjectList.map((s) => (
              <option key={s.id} value={s.id}>
                [{s.code}] {s.name}
              </option>
            ))}
          </Select>

          <Select
            label="Target Student Batch"
            value={form.data.batch_id}
            onChange={(e) => form.setData('batch_id', e.target.value)}
          >
            {batchList.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </Select>

          <Select
            label="Target Division"
            value={form.data.division_name}
            onChange={(e) => form.setData('division_name', e.target.value)}
          >
            <option value="Division A">Division A</option>
            <option value="Division B">Division B</option>
            <option value="Division C">Division C</option>
          </Select>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={form.processing}>
              {form.processing ? 'Assigning...' : 'Confirm Assignment'}
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
