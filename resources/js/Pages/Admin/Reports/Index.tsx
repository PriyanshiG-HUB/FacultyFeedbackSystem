import React from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { ReportsIndexProps, ReportItem } from '../../../types';
import { DataTable, Column } from '../../../Components/ui/DataTable';
import { StatusBadge } from '../../../Components/ui/StatusBadge';
import { Button } from '../../../Components/ui/Button';
import { FileText, Download, CheckCircle, Send } from 'lucide-react';

export default function Index({ reports: initialReports }: ReportsIndexProps) {
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
          <FileText className="w-4 h-4 text-brand-400" />
          <div>
            <p className="font-semibold text-slate-100">{row.title}</p>
            <p className="text-[11px] text-slate-400">Generated on {row.generatedAt}</p>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Academic Term',
      accessor: (row) => (
        <div className="text-xs">
          <p className="text-slate-200">{row.academicYear}</p>
          <p className="text-slate-400">{row.term}</p>
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Sample Size',
      accessor: (row) => <span>{row.totalResponses} Responses</span>,
      sortable: true,
    },
    {
      header: 'Publication Status',
      accessor: (row) => <StatusBadge status={row.status} />,
      sortable: true,
    },
  ];

  return (
    <AdminLayout title="Institutional Reports" currentPath="#Admin/Reports/Index">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Generated Evaluation Reports</h2>
          <p className="text-xs text-slate-400">Official institutional reports ready for publication and faculty download</p>
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
