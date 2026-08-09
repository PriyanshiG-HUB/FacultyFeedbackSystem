import React from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { ReportsIndexProps, ReportItem } from '../../../types';
import { DataTable, Column } from '../../../Components/ui/DataTable';
import { StatusBadge } from '../../../Components/ui/StatusBadge';
import { Button } from '../../../Components/ui/Button';
import { FileText, Download, Send } from 'lucide-react';

export default function Index({ departmentName = 'Computer Engineering', reports: initialReports }: ReportsIndexProps) {
  const [reports, setReports] = React.useState(initialReports);

  const togglePublish = (id: number) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: r.status === 'Published' ? 'Draft' : 'Published' } : r
      )
    );
  };

  const handleDownload = (title: string) => {
    alert(`Downloading PDF evaluation report for: "${title}"`);
  };

  const columns: Column<ReportItem>[] = [
    {
      header: 'Report Title',
      accessor: (row) => (
        <div className="flex items-center gap-2.5">
          <FileText className="w-4 h-4 text-blue-600 shrink-0" />
          <div>
            <p className="font-bold text-slate-900">{row.title}</p>
            <p className="text-[11px] text-slate-500">Generated on {row.generatedAt}</p>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Academic Term',
      accessor: (row) => (
        <div className="text-xs">
          <p className="font-semibold text-slate-800">{row.academicYear}</p>
          <p className="text-slate-500">{row.term}</p>
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Sample Size',
      accessor: (row) => <span className="font-semibold text-slate-700">{row.totalResponses} Responses</span>,
      sortable: true,
    },
    {
      header: 'Publication Status',
      accessor: (row) => <StatusBadge status={row.status} />,
      sortable: true,
    },
  ];

  return (
    <AdminLayout title="Department Reports" currentPath="#Admin/Reports/Index">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-50 border border-blue-200 rounded-full text-blue-700 text-[11px] font-bold uppercase tracking-wider mb-1">
            HOD Portal &bull; {departmentName}
          </div>
          <h2 className="text-xl font-bold text-slate-900">{departmentName} — Evaluation Reports</h2>
          <p className="text-xs text-slate-500">Official department evaluation reports ready for publication and faculty download</p>
        </div>
        <Button variant="primary" onClick={() => alert('Generate New Evaluation Report action')}>
          <Send className="w-4 h-4 mr-1.5" />
          Generate New Report
        </Button>
      </div>

      <DataTable
        data={reports}
        columns={columns}
        searchPlaceholder="Search reports by title or term..."
        actions={(row) => (
          <div className="flex items-center gap-2 justify-end">
            <Button
              variant={row.status === 'Published' ? 'outline' : 'secondary'}
              size="sm"
              onClick={() => togglePublish(row.id)}
            >
              {row.status === 'Published' ? 'Unpublish' : 'Publish Report'}
            </Button>
            <Button variant="primary" size="sm" onClick={() => handleDownload(row.title)}>
              <Download className="w-3.5 h-3.5 mr-1" />
              Download PDF
            </Button>
          </div>
        )}
      />
    </AdminLayout>
  );
}

