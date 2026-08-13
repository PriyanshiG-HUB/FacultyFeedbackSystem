import React, { useState } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { FacultyIndexProps, FacultyItem, FacultyFeedbackDetails } from '../../../types';
import { DataTable, Column } from '../../../Components/ui/DataTable';
import { StatusBadge } from '../../../Components/ui/StatusBadge';
import { Button } from '../../../Components/ui/Button';
import { Card } from '../../../Components/ui/Card';
import { Modal } from '../../../Components/ui/Modal';
import { Input, Select } from '../../../Components/ui/Input';
import { useForm } from '../../../Components/shared/useForm';
import { Plus, Mail, Filter, Star, CheckCircle2, BarChart3, PieChart, BookOpen, UserCheck } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';

import { getDepartmentName } from '../../../utils/departmentScope';

const PARAMETER_COLORS = ['#0284c7', '#4f46e5', '#059669', '#d97706'];

export default function Index({
  userRole = 'admin',
  assignedDepartmentCode = null,
  faculty,
  departments,
}: FacultyIndexProps & { userRole?: 'admin' | 'hod'; assignedDepartmentCode?: string | null }) {
  const isAdministrator = userRole === 'admin';
  const initialFilter = !isAdministrator && assignedDepartmentCode
    ? getDepartmentName(assignedDepartmentCode)
    : 'all';

  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>(initialFilter);
  const [selectedFacultyId, setSelectedFacultyId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Synchronize filter when role/assigned department prop changes
  React.useEffect(() => {
    if (!isAdministrator && assignedDepartmentCode) {
      setSelectedDeptFilter(getDepartmentName(assignedDepartmentCode));
    }
  }, [isAdministrator, assignedDepartmentCode]);

  const form = useForm({
    name: '',
    email: '',
    department: departments[0]?.name || '',
    designation: 'Assistant Professor',
  });

  const filteredFaculty = faculty.filter((f) => {
    if (!isAdministrator && assignedDepartmentCode) {
      const targetDeptName = getDepartmentName(assignedDepartmentCode).toLowerCase();
      return f.department.toLowerCase().includes(targetDeptName) || targetDeptName.includes(f.department.toLowerCase());
    }
    if (selectedDeptFilter === 'all') return true;
    return f.department.toLowerCase() === selectedDeptFilter.toLowerCase();
  });

  const selectedFaculty = filteredFaculty.find((f) => f.id === selectedFacultyId) || faculty.find((f) => f.id === selectedFacultyId) || null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.submit('post', '#Admin/Faculty/Index', {
      onSuccess: () => setIsModalOpen(false),
    });
  };

  const columns: Column<FacultyItem>[] = [
    {
      header: 'Faculty Name',
      accessor: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs">
            {row.name.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-slate-900">{row.name}</p>
            <p className="text-[11px] text-slate-500 font-medium">{row.designation}</p>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Email Address',
      accessor: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <Mail className="w-3.5 h-3.5 text-slate-400" />
          <span>{row.email}</span>
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
      header: 'Status',
      accessor: (row) => <StatusBadge status={row.status} />,
      sortable: true,
    },
    {
      header: 'Action',
      accessor: (row) => {
        const isSelected = row.id === selectedFacultyId;
        return (
          <Button
            size="sm"
            variant={isSelected ? 'primary' : 'outline'}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedFacultyId(isSelected ? null : row.id);
            }}
          >
            {isSelected ? 'Selected' : 'Select'}
          </Button>
        );
      },
    },
  ];

  // Selected Faculty Details Data Fallback
  const details: FacultyFeedbackDetails | null = selectedFaculty
    ? selectedFaculty.feedbackDetails || {
        overallScore: 4.80,
        totalResponses: 120,
        parameterScores: {
          punctuality: 4.80,
          subjectKnowledge: 4.85,
          clarityOfTeaching: 4.75,
          studyMaterial: 4.80,
        },
        scoreDistribution: [
          { rating: '5 Stars', count: 85 },
          { rating: '4 Stars', count: 28 },
          { rating: '3 Stars', count: 5 },
          { rating: '2 Stars', count: 2 },
          { rating: '1 Star', count: 0 },
        ],
      }
    : null;

  const parameterChartData = details
    ? [
        { parameter: 'Punctuality', score: details.parameterScores.punctuality },
        { parameter: 'Subject Knowledge', score: details.parameterScores.subjectKnowledge },
        { parameter: 'Clarity of Teaching', score: details.parameterScores.clarityOfTeaching },
        { parameter: 'Study Material', score: details.parameterScores.studyMaterial },
      ]
    : [];

  return (
    <AdminLayout
      title="Faculty Directory"
      currentPath="#Admin/Faculty/Index"
      userRole={userRole}
      departmentScope={isAdministrator ? 'All Departments' : getDepartmentName(assignedDepartmentCode)}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Faculty Members</h2>
          <p className="text-xs text-slate-500">
            {isAdministrator
              ? 'View and manage teaching staff across all academic departments'
              : `View faculty members assigned to ${getDepartmentName(assignedDepartmentCode)}`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Department Filter for Admin vs Scope Indicator for HOD */}
          {isAdministrator ? (
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs shadow-2xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                className="bg-transparent text-slate-800 font-medium focus:outline-none cursor-pointer"
              >
                <option value="all">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.name}>
                    {dept.name}
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
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" />
              Register Faculty
            </Button>
          )}
        </div>
      </div>

      <DataTable
        data={filteredFaculty}
        columns={columns}
        searchPlaceholder="Search faculty by name, email or department..."
        onRowClick={(row) => setSelectedFacultyId(row.id === selectedFacultyId ? null : row.id)}
        selectedRowKey={(row) => row.id === selectedFacultyId}
      />

      {/* Compact Faculty Feedback Details Section */}
      {selectedFaculty && details ? (
        <Card
          className="mt-6 border-indigo-100/90 bg-gradient-to-b from-white to-slate-50/50"
          title={`Faculty Feedback Details — ${selectedFaculty.name}`}
          subtitle={`${selectedFaculty.designation} • ${selectedFaculty.department}`}
          action={
            <Button variant="outline" size="sm" onClick={() => setSelectedFacultyId(null)}>
              Clear Selection
            </Button>
          }
        >
          {/* Overall Stats Callout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
            {/* Overall Score */}
            <div className="lg:col-span-2 bg-indigo-50/70 border border-indigo-100 rounded-xl p-4 flex items-center justify-between shadow-2xs">
              <div>
                <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">Overall Feedback Score</p>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-3xl font-extrabold text-indigo-950">
                    {details.overallScore.toFixed(2)}
                  </span>
                  <span className="text-xs text-indigo-600 font-medium">/ 5.0</span>
                </div>
                <p className="text-[11px] text-indigo-600/80 mt-0.5">Aggregate evaluation rating</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-indigo-600 text-amber-300 flex items-center justify-center shadow-xs">
                <Star className="w-6 h-6 fill-amber-300 stroke-amber-400" />
              </div>
            </div>

            {/* Total Feedback Responses */}
            <div className="lg:col-span-2 bg-emerald-50/70 border border-emerald-100 rounded-xl p-4 flex items-center justify-between shadow-2xs">
              <div>
                <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Total Responses</p>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-3xl font-extrabold text-emerald-950">
                    {details.totalResponses}
                  </span>
                  <span className="text-xs text-emerald-600 font-medium">submissions</span>
                </div>
                <p className="text-[11px] text-emerald-600/80 mt-0.5">Completed feedback responses</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            {/* Parameter Scores Summary */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-center shadow-2xs">
              <p className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">Parameter Scores</p>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Punctuality:</span>
                  <span className="font-bold text-slate-900">{details.parameterScores.punctuality.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Subject Knowledge:</span>
                  <span className="font-bold text-slate-900">{details.parameterScores.subjectKnowledge.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Clarity of Teaching:</span>
                  <span className="font-bold text-slate-900">{details.parameterScores.clarityOfTeaching.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Study Material:</span>
                  <span className="font-bold text-slate-900">{details.parameterScores.studyMaterial.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Compact Charts Container */}
          <div
            className={`grid grid-cols-1 ${
              details.subjectScores && details.subjectScores.length > 0 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'
            } gap-6`}
          >
            {/* Chart 1: Parameter Scores */}
            <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
                  Parameter Evaluation
                </h4>
                <span className="text-[10px] text-slate-400 font-medium">Out of 5.0</span>
              </div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={parameterChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="parameter" stroke="#64748b" fontSize={9} interval={0} />
                    <YAxis domain={[0, 5]} stroke="#64748b" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', fontSize: '12px' }} />
                    <Bar dataKey="score" name="Score" radius={[4, 4, 0, 0]}>
                      {parameterChartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PARAMETER_COLORS[index % PARAMETER_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Rating Distribution */}
            <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <PieChart className="w-3.5 h-3.5 text-emerald-600" />
                  Rating Distribution
                </h4>
                <span className="text-[10px] text-slate-400 font-medium">Rating Count</span>
              </div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={details.scoreDistribution} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" stroke="#64748b" fontSize={10} />
                    <YAxis dataKey="rating" type="category" stroke="#64748b" fontSize={10} width={60} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', fontSize: '12px' }} />
                    <Bar dataKey="count" name="Responses" fill="#059669" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: Subject-wise Performance (shown only if subject-wise feedback data exists) */}
            {details.subjectScores && details.subjectScores.length > 0 && (
              <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                    Subject-wise Feedback
                  </h4>
                  <span className="text-[10px] text-slate-400 font-medium">Subject Ratings</span>
                </div>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={details.subjectScores} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="subjectCode" stroke="#64748b" fontSize={10} />
                      <YAxis domain={[0, 5]} stroke="#64748b" fontSize={10} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', fontSize: '12px' }}
                        formatter={(value: any, _: any, props: any) => [`${value} / 5.0`, props.payload.subjectName]}
                      />
                      <Bar dataKey="score" name="Score" fill="#d97706" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <div className="bg-slate-50 border border-dashed border-slate-300/80 rounded-xl p-6 text-center text-slate-500 text-sm mt-6 flex flex-col items-center justify-center gap-2">
          <UserCheck className="w-8 h-8 text-slate-400" />
          <p className="font-medium text-slate-700">Select a faculty member to view feedback details.</p>
          <p className="text-xs text-slate-400">Click any row in the faculty directory table above to display parameter metrics and feedback charts.</p>
        </div>
      )}

      {/* Add Faculty Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register Faculty Member">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Dr. Robert Vance"
            value={form.data.name}
            onChange={(e) => form.setData('name', e.target.value)}
            required
          />
          <Input
            label="Institutional Email"
            type="email"
            placeholder="r.vance@univ.edu"
            value={form.data.email}
            onChange={(e) => form.setData('email', e.target.value)}
            required
          />
          <Select
            label="Department Assignment"
            value={form.data.department}
            onChange={(e) => form.setData('department', e.target.value)}
          >
            {departments.map((dept) => (
              <option key={dept.id} value={dept.name}>
                {dept.name}
              </option>
            ))}
          </Select>
          <Select
            label="Designation"
            value={form.data.designation}
            onChange={(e) => form.setData('designation', e.target.value)}
          >
            <option value="Professor">Professor</option>
            <option value="Associate Professor">Associate Professor</option>
            <option value="Assistant Professor">Assistant Professor</option>
            <option value="Lecturer">Lecturer</option>
          </Select>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={form.processing}>
              {form.processing ? 'Saving...' : 'Register Faculty'}
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}

