import React, { useState } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { SessionAssignmentsIndexProps, SessionAssignmentItem } from '../../../types';
import { DataTable, Column } from '../../../Components/ui/DataTable';
import { Button } from '../../../Components/ui/Button';
import { Modal } from '../../../Components/ui/Modal';
import { Select } from '../../../Components/ui/Input';
import { CalendarRange, Plus } from 'lucide-react';
import { DEPARTMENTS_LIST } from '../../../utils/departmentScope';

const SESSION_HIERARCHY_DATA: Record<
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
  assignments: initialAssignments,
  facultyList,
  subjectList,
  batchList,
}: SessionAssignmentsIndexProps) {
  const [assignmentsList, setAssignmentsList] = useState<SessionAssignmentItem[]>(initialAssignments);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [facultyId, setFacultyId] = useState<number | string>(facultyList[0]?.id || 1);
  const [subjectId, setSubjectId] = useState<number | string>(subjectList[0]?.id || 1);
  const [selectedDept, setSelectedDept] = useState('Information Technology');
  const [selectedBatch, setSelectedBatch] = useState('2022-26');
  const [selectedDivision, setSelectedDivision] = useState('All');
  const [selectedSection, setSelectedSection] = useState('All');

  // Hierarchy Helpers
  const deptBatches = SESSION_HIERARCHY_DATA[selectedDept] || SESSION_HIERARCHY_DATA['Information Technology'];
  const activeBatchObj = deptBatches.find((b) => b.batch === selectedBatch) || deptBatches[0];
  const derivedSemester = activeBatchObj ? activeBatchObj.semester : 7;

  const availableDivisions = activeBatchObj ? activeBatchObj.divisions : [];
  const activeDivObj = availableDivisions.find((d) => d.name === selectedDivision);
  const availableSections = activeDivObj ? activeDivObj.sections : [];

  // Reset Handlers
  const handleDeptChange = (newDept: string) => {
    setSelectedDept(newDept);
    const batches = SESSION_HIERARCHY_DATA[newDept] || SESSION_HIERARCHY_DATA['Information Technology'];
    if (batches.length > 0) {
      setSelectedBatch(batches[0].batch);
    }
    setSelectedDivision('All');
    setSelectedSection('All');
  };

  const handleBatchChange = (newBatch: string) => {
    setSelectedBatch(newBatch);
    setSelectedDivision('All');
    setSelectedSection('All');
  };

  const handleDivisionChange = (newDiv: string) => {
    setSelectedDivision(newDiv);
    setSelectedSection('All');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const facObj = facultyList.find((f) => String(f.id) === String(facultyId)) || facultyList[0];
    const subObj = subjectList.find((s) => String(s.id) === String(subjectId)) || subjectList[0];

    const newAssignment: SessionAssignmentItem = {
      id: Date.now(),
      facultyName: facObj ? facObj.name : 'Dr. Sarah Jenkins',
      subjectName: subObj ? subObj.name : 'Database Management Systems',
      subjectCode: subObj ? subObj.code : 'IT701',
      batchName: selectedBatch,
      divisionName: selectedDivision,
      sectionName: selectedDivision === 'All' ? 'All' : selectedSection,
      semester: derivedSemester,
      department: selectedDept,
    };

    setAssignmentsList([newAssignment, ...assignmentsList]);
    setIsModalOpen(false);
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
      accessor: (row) => <span className="font-semibold text-slate-800">{row.batchName}</span>,
      sortable: true,
    },
    {
      header: 'Division & Section',
      accessor: (row) => (
        <div className="text-xs">
          <p className="text-slate-800 font-medium">{row.divisionName}</p>
          <p className="text-slate-500 font-mono font-bold">Section: {row.sectionName || 'All'}</p>
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Semester',
      accessor: (row) => (
        <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-700">
          Semester {row.semester}
        </span>
      ),
      sortable: true,
    },
  ];

  return (
    <AdminLayout title="Session Allocations" currentPath="#Admin/SessionAssignments/Index">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Faculty Session Allocations</h2>
          <p className="text-xs text-slate-500">Map faculty members to subjects, graduation batches, divisions, and sections</p>
        </div>

        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          New Session Assignment
        </Button>
      </div>

      <DataTable
        data={assignmentsList}
        columns={columns}
        searchPlaceholder="Search allocations by faculty, subject or batch..."
      />

      {/* New Assignment Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Assign Faculty to Session">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Select Faculty Member *"
            value={facultyId}
            onChange={(e) => setFacultyId(e.target.value)}
          >
            {facultyList.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </Select>

          <Select
            label="Select Course Subject *"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
          >
            {subjectList.map((s) => (
              <option key={s.id} value={s.id}>
                [{s.code}] {s.name}
              </option>
            ))}
          </Select>

          {/* Academic Target Selection */}
          <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">Academic Target Allocation</p>

            <Select
              label="Department *"
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
              label="Graduation Batch *"
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Current Semester</label>
              <div className="p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-blue-700">
                Semester {derivedSemester}
              </div>
            </div>

            <Select
              label="Division Target"
              value={selectedDivision}
              onChange={(e) => handleDivisionChange(e.target.value)}
            >
              <option value="All">All Divisions (Entire Batch)</option>
              {availableDivisions.map((div) => (
                <option key={div.name} value={div.name}>
                  {div.name}
                </option>
              ))}
            </Select>

            <Select
              label="Section Target"
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              disabled={selectedDivision === 'All'}
            >
              <option value="All">All Sections (Entire Division)</option>
              {availableSections.map((sec) => (
                <option key={sec} value={sec}>
                  Section {sec}
                </option>
              ))}
            </Select>
            {selectedDivision === 'All' && (
              <p className="text-[11px] text-slate-400 font-medium">
                Section selection is disabled when Division is set to "All Divisions".
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Confirm Assignment
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
