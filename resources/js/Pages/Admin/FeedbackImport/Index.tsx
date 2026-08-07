import React, { useState } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { FeedbackImportIndexProps, FeedbackImportItem } from '../../../types';
import { Card } from '../../../Components/ui/Card';
import { Button } from '../../../Components/ui/Button';
import { StatusBadge } from '../../../Components/ui/StatusBadge';
import { DataTable, Column } from '../../../Components/ui/DataTable';
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Index({ recentImports }: FeedbackImportIndexProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewData, setPreviewData] = useState<any[] | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      // Generate realistic preview rows
      setPreviewData([
        { row: 1, rollNumber: '22CE001', studentName: 'Alexander Wright', subjectCode: 'CS701', status: 'Valid' },
        { row: 2, rollNumber: '22CE002', studentName: 'Sophia Martinez', subjectCode: 'CS701', status: 'Valid' },
        { row: 3, rollNumber: '22CE003', studentName: 'Ethan Hunt', subjectCode: 'CS701', status: 'Valid' },
        { row: 4, rollNumber: 'INVALID_ID', studentName: 'Unknown Entry', subjectCode: 'CS701', status: 'Invalid Roll' },
      ]);
    }
  };

  const handleStartImport = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      alert('Mock CSV data successfully imported into database records!');
      setSelectedFile(null);
      setPreviewData(null);
    }, 1200);
  };

  const columns: Column<FeedbackImportItem>[] = [
    {
      header: 'File Name',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span className="font-mono text-xs font-bold text-slate-800">{row.fileName}</span>
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Uploaded By',
      accessor: 'uploadedBy',
      sortable: true,
    },
    {
      header: 'Records',
      accessor: (row) => <span>{row.recordCount} Rows</span>,
      sortable: true,
    },
    {
      header: 'Status',
      accessor: (row) => <StatusBadge status={row.status} />,
      sortable: true,
    },
    {
      header: 'Timestamp',
      accessor: 'date',
      sortable: true,
    },
  ];

  return (
    <AdminLayout title="Data Import Center" currentPath="#Admin/FeedbackImport/Index">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Bulk Data Import (CSV / Excel)</h2>
        <p className="text-xs text-slate-500">Import student rosters, faculty assignments, and historic feedback metrics</p>
      </div>

      {/* Upload Zone */}
      <Card title="Upload CSV Dataset">
        <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-8 text-center transition-all bg-slate-50/60 space-y-4">
          <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mx-auto shadow-2xs">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">
              Drag & drop your CSV or Excel file here, or{' '}
              <label className="text-indigo-600 hover:text-indigo-700 font-bold underline cursor-pointer">
                browse files
                <input type="file" accept=".csv, .xlsx" className="hidden" onChange={handleFileChange} />
              </label>
            </p>
            <p className="text-xs text-slate-400 mt-1">Supported formats: .CSV, .XLSX (Max file size: 10MB)</p>
          </div>

          {selectedFile && (
            <div className="inline-flex items-center gap-2 bg-white border border-slate-200 px-3.5 py-1.5 rounded-lg text-xs font-mono text-slate-800 shadow-2xs">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>{selectedFile.name}</span>
            </div>
          )}
        </div>

        {/* Data Preview Table */}
        {previewData && (
          <div className="mt-6 space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">Dataset Validation Preview</h4>
              <Button variant="primary" size="sm" onClick={handleStartImport} disabled={isUploading}>
                {isUploading ? 'Importing Dataset...' : 'Confirm & Import Records'}
              </Button>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden text-xs shadow-2xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Row #</th>
                    <th className="p-2.5">Roll Number</th>
                    <th className="p-2.5">Student Name</th>
                    <th className="p-2.5">Subject Code</th>
                    <th className="p-2.5">Validation Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {previewData.map((p, i) => (
                    <tr key={i}>
                      <td className="p-2.5 text-slate-400 font-mono">{p.row}</td>
                      <td className="p-2.5 font-mono text-slate-800 font-bold">{p.rollNumber}</td>
                      <td className="p-2.5 text-slate-700">{p.studentName}</td>
                      <td className="p-2.5 font-mono text-indigo-600 font-semibold">{p.subjectCode}</td>
                      <td className="p-2.5">
                        {p.status === 'Valid' ? (
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Valid
                          </span>
                        ) : (
                          <span className="text-rose-700 font-bold flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> {p.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>

      {/* History Table */}
      <Card title="Recent Data Imports Log">
        <DataTable data={recentImports} columns={columns} searchPlaceholder="Search import history..." />
      </Card>
    </AdminLayout>
  );
}
