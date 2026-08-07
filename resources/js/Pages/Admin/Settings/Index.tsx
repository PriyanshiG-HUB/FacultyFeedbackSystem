import React from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { SettingsIndexProps } from '../../../types';
import { Card } from '../../../Components/ui/Card';
import { Input, Select } from '../../../Components/ui/Input';
import { Button } from '../../../Components/ui/Button';
import { useForm } from '../../../Components/shared/useForm';
import { Save } from 'lucide-react';

export default function Index({ settings: initialSettings }: SettingsIndexProps) {
  const form = useForm({
    ratingScale: initialSettings.ratingScale,
    minFeedbackThreshold: initialSettings.minFeedbackThreshold,
    allowAnonymous: initialSettings.allowAnonymous,
    feedbackWindowOpen: initialSettings.feedbackWindowOpen,
    feedbackWindowClose: initialSettings.feedbackWindowClose,
    autoPublishReports: initialSettings.autoPublishReports,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.submit('post', '#Admin/Settings/Index', {
      onSuccess: () => alert('System evaluation settings successfully saved!'),
    });
  };

  return (
    <AdminLayout title="System Settings" currentPath="#Admin/Settings/Index">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Feedback System Configuration</h2>
        <p className="text-xs text-slate-500">Configure global evaluation parameters, active dates, and privacy thresholds</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        {/* Rating Scale & Thresholds */}
        <Card title="Evaluation Metrics & Scale Builder">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Select
              label="Evaluation Rating Scale"
              value={form.data.ratingScale}
              onChange={(e) => form.setData('ratingScale', Number(e.target.value))}
            >
              <option value={5}>5-Point Rating Scale (1 = Poor, 5 = Excellent)</option>
              <option value={10}>10-Point Detailed Rating Scale (1 to 10)</option>
            </Select>

            <Input
              label="Minimum Responses Threshold per Report"
              type="number"
              value={form.data.minFeedbackThreshold}
              onChange={(e) => form.setData('minFeedbackThreshold', Number(e.target.value))}
              helperText="Minimum student submissions required before generating public report"
            />
          </div>
        </Card>

        {/* Feedback Window Dates */}
        <Card title="Active Submission Window Schedule">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="Feedback Window Start Date"
              type="date"
              value={form.data.feedbackWindowOpen}
              onChange={(e) => form.setData('feedbackWindowOpen', e.target.value)}
            />
            <Input
              label="Feedback Window End Date"
              type="date"
              value={form.data.feedbackWindowClose}
              onChange={(e) => form.setData('feedbackWindowClose', e.target.value)}
            />
          </div>
        </Card>

        {/* Privacy & Automation Toggles */}
        <Card title="Privacy & Publishing Rules">
          <div className="space-y-4">
            <label className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:border-indigo-300 transition-colors">
              <input
                type="checkbox"
                checked={form.data.allowAnonymous}
                onChange={(e) => form.setData('allowAnonymous', e.target.checked)}
                className="mt-1 rounded bg-white border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <p className="text-sm font-bold text-slate-900">Enforce Anonymous Student Submissions</p>
                <p className="text-xs text-slate-500">Hide student roll numbers and identities from faculty report views.</p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:border-indigo-300 transition-colors">
              <input
                type="checkbox"
                checked={form.data.autoPublishReports}
                onChange={(e) => form.setData('autoPublishReports', e.target.checked)}
                className="mt-1 rounded bg-white border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <p className="text-sm font-bold text-slate-900">Automatically Publish Reports Upon Window Closing</p>
                <p className="text-xs text-slate-500">Release aggregate report cards to faculty immediately when feedback window ends.</p>
              </div>
            </label>
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="submit" variant="primary" size="lg" disabled={form.processing}>
            <Save className="w-4 h-4 mr-2" />
            {form.processing ? 'Saving Changes...' : 'Save System Settings'}
          </Button>
        </div>
      </form>
    </AdminLayout>
  );
}
