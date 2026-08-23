import React, { useState } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { SectionsIndexProps, SectionItem } from '../../../types';
import { DataTable, Column } from '../../../Components/ui/DataTable';
import { StatusBadge } from '../../../Components/ui/StatusBadge';
import { Button } from '../../../Components/ui/Button';
import { Modal } from '../../../Components/ui/Modal';
import { Input, Select } from '../../../Components/ui/Input';
import { DEPARTMENTS_LIST } from '../../../utils/departmentScope';
import { Layers, Plus } from 'lucide-react';

const MOCK_HIERARCHY_DATA: Record<string, { batch: string; semester: number; divisions: string[] }[]> = {
  'Information Technology': [
    { batch: '2022-26', semester: 7, divisions: ['Division 1', 'Division 2'] },
    { batch: '2023-27', semester: 5, divisions: ['Division 1', 'Division 2'] },
    { batch: '2024-28', semester: 3, divisions: ['Division 1'] },
  ],
  'Computer Engineering': [
    { batch: '2022-26', semester: 7, divisions: ['Division 1'] },
    { batch: '2023-27', semester: 5, divisions: ['Division 1'] },
  ],
  'Computer Science & Engineering': [
    { batch: '2022-26', semester: 7, divisions: ['Division 1'] },
  ],
  'Electronics & Communication': [
    { batch: '2022-26', semester: 7, divisions: ['Division 1'] },
  ],
  'Mechanical Engineering': [
    { batch: '2022-26', semester: 7, divisions: ['Division 1'] },
  ],
};

export default function Index({ sections: initialSections }: SectionsIndexProps) {
  const [sectionsList, setSectionsList] = useState<SectionItem[]>(initialSections);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Modal Dependent State
  const [selectedDept, setSelectedDept] = useState('Information Technology');
  const [selectedBatch, setSelectedBatch] = useState('2022-26');
  const [selectedDivision, setSelectedDivision] = useState('Division 1');
  const [sectionName, setSectionName] = useState('D1');

  const deptHierarchy = MOCK_HIERARCHY_DATA[selectedDept] || MOCK_HIERARCHY_DATA['Information Technology'];
  const activeBatchObj = deptHierarchy.find((b) => b.batch === selectedBatch) || deptHierarchy[0];
  const derivedSemester = activeBatchObj ? activeBatchObj.semester : 7;
  const availableDivisions = activeBatchObj ? activeBatchObj.divisions : ['Division 1'];

  const handleDeptChange = (deptName: string) => {
    setSelectedDept(deptName);
    const newHierarchy = MOCK_HIERARCHY_DATA[deptName] || MOCK_HIERARCHY_DATA['Information Technology'];
    if (newHierarchy.length > 0) {
      setSelectedBatch(newHierarchy[0].batch);
      setSelectedDivision(newHierarchy[0].divisions[0] || 'Division 1');
    }
  };

  const handleBatchChange = (batchName: string) => {
    setSelectedBatch(batchName);
    const batchObj = deptHierarchy.find((b) => b.batch === batchName);
    if (batchObj && batchObj.divisions.length > 0) {
      setSelectedDivision(batchObj.divisions[0]);
    }
  };

  const handleCreateSection = (e: React.FormEvent) => {
    e.preventDefault();
    const newSection: SectionItem = {
      id: Date.now(),
      name: sectionName,
      division: selectedDivision,
      batch: selectedBatch,
      currentSemester: derivedSemester,
      department: selectedDept,
      studentCount: 0,
      status: 'Active',
    };
    setSectionsList([newSection, ...sectionsList]);
    setIsModalOpen(false);
  };

  const columns: Column<SectionItem>[] = [
    {
      header: 'Section Code / Name',
      accessor: (row) => (
        <span className="font-mono text-xs font-bold px-2.5 py-1 bg-indigo-50 border border-indigo-200 rounded text-indigo-700">
          {row.name}
        </span>
      ),
      sortable: true,
    },
    {
      header: 'Parent Division',
      accessor: (row) => <span className="font-bold text-slate-900">{row.division}</span>,
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
      accessor: (row) => <StatusBadge status={row.status} />,
      sortable: true,
    },
  ];

  return (
    <AdminLayout title="Classroom Sections" currentPath="#Admin/Sections/Index">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Sections Management</h2>
          <p className="text-xs text-slate-500">Manage practical/tutorial section breakdowns under division groupings</p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          New Section
        </Button>
      </div>

      <DataTable data={sectionsList} columns={columns} searchPlaceholder="Search section, division or department..." />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Classroom Section">
        <form onSubmit={handleCreateSection} className="space-y-4">
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
            onChange={(e) => handleBatchChange(e.target.value)}
          >
            {deptHierarchy.map((b) => (
              <option key={b.batch} value={b.batch}>
                Batch {b.batch} (Semester {b.semester})
              </option>
            ))}
          </Select>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Current Semester</label>
            <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono font-bold text-blue-700">
              Semester {derivedSemester}
            </div>
          </div>

          <Select
            label="3. Select Parent Division"
            value={selectedDivision}
            onChange={(e) => setSelectedDivision(e.target.value)}
          >
            {availableDivisions.map((div) => (
              <option key={div} value={div}>
                {div}
              </option>
            ))}
          </Select>

          <Input
            label="4. Section Code / Name (e.g. A1, B1, C1)"
            value={sectionName}
            onChange={(e) => setSectionName(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Section
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
