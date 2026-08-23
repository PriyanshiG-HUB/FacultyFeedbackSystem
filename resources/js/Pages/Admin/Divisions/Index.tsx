import React, { useState } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { DivisionsIndexProps, DivisionItem } from '../../../types';
import { DataTable, Column } from '../../../Components/ui/DataTable';
import { StatusBadge } from '../../../Components/ui/StatusBadge';
import { Button } from '../../../Components/ui/Button';
import { Modal } from '../../../Components/ui/Modal';
import { Input, Select } from '../../../Components/ui/Input';
import { DEPARTMENTS_LIST } from '../../../utils/departmentScope';
import { Layers, Plus } from 'lucide-react';

const MOCK_BATCHES_BY_DEPT: Record<string, { name: string; semester: number }[]> = {
  'Information Technology': [
    { name: '2022-26', semester: 7 },
    { name: '2023-27', semester: 5 },
    { name: '2024-28', semester: 3 },
  ],
  'Computer Engineering': [
    { name: '2022-26', semester: 7 },
    { name: '2023-27', semester: 5 },
  ],
  'Computer Science & Engineering': [
    { name: '2022-26', semester: 7 },
    { name: '2023-27', semester: 5 },
  ],
  'Electronics & Communication': [
    { name: '2022-26', semester: 7 },
  ],
  'Mechanical Engineering': [
    { name: '2022-26', semester: 7 },
  ],
};

export default function Index({ divisions: initialDivisions }: DivisionsIndexProps) {
  const [divisionsList, setDivisionsList] = useState<DivisionItem[]>(initialDivisions);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state for creating division
  const [selectedDept, setSelectedDept] = useState('Information Technology');
  const [selectedBatch, setSelectedBatch] = useState('2022-26');
  const [divisionName, setDivisionName] = useState('Division 3');

  const availableBatches = MOCK_BATCHES_BY_DEPT[selectedDept] || MOCK_BATCHES_BY_DEPT['Information Technology'];
  const activeBatchObj = availableBatches.find((b) => b.name === selectedBatch) || availableBatches[0];
  const derivedSemester = activeBatchObj ? activeBatchObj.semester : 7;

  const handleDeptChange = (deptName: string) => {
    setSelectedDept(deptName);
    const newBatches = MOCK_BATCHES_BY_DEPT[deptName] || MOCK_BATCHES_BY_DEPT['Information Technology'];
    if (newBatches.length > 0) {
      setSelectedBatch(newBatches[0].name);
    }
  };

  const handleCreateDivision = (e: React.FormEvent) => {
    e.preventDefault();
    const newDivision: DivisionItem = {
      id: Date.now(),
      name: divisionName,
      department: selectedDept,
      batch: selectedBatch,
      currentSemester: derivedSemester,
      studentCount: 0,
      status: 'Active',
    };
    setDivisionsList([newDivision, ...divisionsList]);
    setIsModalOpen(false);
  };

  const columns: Column<DivisionItem>[] = [
    {
      header: 'Division Name',
      accessor: (row) => <span className="font-bold text-slate-900">{row.name}</span>,
      sortable: true,
    },
    {
      header: 'Graduation Batch',
      accessor: (row) => <span className="font-semibold text-slate-800">{row.batch}</span>,
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
      header: 'Department',
      accessor: 'department',
      sortable: true,
    },
    {
      header: 'Student Count',
      accessor: (row) => <span className="text-slate-700 font-medium">{row.studentCount} Students</span>,
      sortable: true,
    },
    {
      header: 'Status',
      accessor: (row) => <StatusBadge status={row.status || 'Active'} />,
      sortable: true,
    },
  ];

  return (
    <AdminLayout title="Academic Divisions" currentPath="#Admin/Divisions/Index">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Academic Divisions</h2>
          <p className="text-xs text-slate-500">Classroom division groupings under graduation batches and current semesters</p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          New Division
        </Button>
      </div>

      <DataTable data={divisionsList} columns={columns} searchPlaceholder="Search division or department..." />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Academic Division">
        <form onSubmit={handleCreateDivision} className="space-y-4">
          <Select
            label="1. Select Department"
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
            label="2. Select Graduation Batch"
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
          >
            {availableBatches.map((b) => (
              <option key={b.name} value={b.name}>
                Batch {b.name} (Semester {b.semester})
              </option>
            ))}
          </Select>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">3. Derived Current Semester</label>
            <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono font-bold text-blue-700">
              Semester {derivedSemester}
            </div>
          </div>

          <Input
            label="4. Division Name (e.g. Division 1, Division 2)"
            value={divisionName}
            onChange={(e) => setDivisionName(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Division
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
