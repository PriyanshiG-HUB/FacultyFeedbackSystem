import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { SettingsIndexProps } from '../../../types';
import { Card } from '../../../Components/ui/Card';
import { Input, Select } from '../../../Components/ui/Input';
import { Button } from '../../../Components/ui/Button';
import { api } from '../../../lib/api';
import { Save, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Index({ settings: initialSettings }: SettingsIndexProps) {
  const [settingsId, setSettingsId] = useState<number | null>(null);
  const [ratingScale, setRatingScale] = useState<number>(initialSettings.ratingScale || 5);
  const [minFeedbackThreshold, setMinFeedbackThreshold] = useState<number>(initialSettings.minFeedbackThreshold || 10);
  const [allowAnonymous, setAllowAnonymous] = useState<boolean>(initialSettings.allowAnonymous !== false);
  const [feedbackWindowOpen, setFeedbackWindowOpen] = useState<string>(initialSettings.feedbackWindowOpen || '2026-08-01');
  const [feedbackWindowClose, setFeedbackWindowClose] = useState<string>(initialSettings.feedbackWindowClose || '2026-12-31');
  const [autoPublishReports, setAutoPublishReports] = useState<boolean>(initialSettings.autoPublishReports || false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    api.get('/system-settings').then((res) => {
      if (res.data) {
        setSettingsId(res.data.id);
        setRatingScale(res.data.rating_scale_max || 5);
        setMinFeedbackThreshold(res.data.min_responses_threshold || 10);
        setAllowAnonymous(res.data.enforce_anonymous_submissions !== false);
        setFeedbackWindowOpen(res.data.window_start_date || '2026-08-01');
        setFeedbackWindowClose(res.data.window_end_date || '2026-12-31');
        setAutoPublishReports(res.data.auto_publish_on_window_close || false);
      }
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const endpoint = settingsId ? `/system-settings/${settingsId}` : '/system-settings';
      await api.put(endpoint, {
        rating_scale_min: 1,
        rating_scale_max: Number(ratingScale),
        min_responses_threshold: Number(minFeedbackThreshold),
        window_start_date: feedbackWindowOpen,
        window_end_date: feedbackWindowClose,
        enforce_anonymous_submissions: allowAnonymous,
        auto_publish_on_window_close: autoPublishReports,
      });
      setSuccessMessage('System evaluation settings successfully saved!');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save system settings.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout title="System Settings" currentPath="#Admin/Settings/Index">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Feedback System Configuration</h2>
        <p className="text-xs text-slate-500">Configure global evaluation parameters, active dates, and privacy thresholds</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        {successMessage && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Rating Scale & Thresholds */}
        <Card title="Evaluation Metrics & Scale Builder">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Select
              label="Evaluation Rating Scale"
              value={ratingScale}
              onChange={(e) => setRatingScale(Number(e.target.value))}
            >
              <option value={5}>5-Point Rating Scale (1 = Poor, 5 = Excellent)</option>
              <option value={10}>10-Point Detailed Rating Scale (1 to 10)</option>
            </Select>

            <Input
              label="Minimum Responses Threshold per Report"
              type="number"
              value={minFeedbackThreshold}
              onChange={(e) => setMinFeedbackThreshold(Number(e.target.value))}
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
              value={feedbackWindowOpen}
              onChange={(e) => setFeedbackWindowOpen(e.target.value)}
            />
            <Input
              label="Feedback Window End Date"
              type="date"
              value={feedbackWindowClose}
              onChange={(e) => setFeedbackWindowClose(e.target.value)}
            />
          </div>
        </Card>

        {/* Privacy & Automation Switches */}
        <Card title="Privacy Controls & Automated Publishing">
          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={allowAnonymous}
                onChange={(e) => setAllowAnonymous(e.target.checked)}
                className="mt-0.5 rounded bg-white border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="font-bold text-sm text-slate-900 block">Enforce Anonymous Feedback Submissions</span>
                <span className="text-xs text-slate-500">Student identities are strictly decoupled from response records.</span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer border-t border-slate-100 pt-3">
              <input
                type="checkbox"
                checked={autoPublishReports}
                onChange={(e) => setAutoPublishReports(e.target.checked)}
                className="mt-0.5 rounded bg-white border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="font-bold text-sm text-slate-900 block">Auto-Publish Aggregated Reports on Window Expiry</span>
                <span className="text-xs text-slate-500">Automatically compile and publish final scores when submission window closes.</span>
              </div>
            </label>
          </div>
        </Card>

        <div className="flex justify-end pt-2">
          <Button type="submit" variant="primary" disabled={isSubmitting} size="lg">
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Saving Settings...' : 'Save Configuration Changes'}
          </Button>
        </div>
      </form>
    </AdminLayout>
  );
}
