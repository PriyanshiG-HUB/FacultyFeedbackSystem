import React, { useState } from 'react';
import StudentLayout from '../../Layouts/StudentLayout';
import { StudentIdentifyProps } from '../../types';
import { Card } from '../../Components/ui/Card';
import { Input } from '../../Components/ui/Input';
import { Button } from '../../Components/ui/Button';
import { api, setAuthToken, setStoredUserInfo, removeAuthToken } from '../../lib/api';
import { GraduationCap, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export default function Identify({ error: propError }: StudentIdentifyProps) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(propError || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      removeAuthToken();
      // If password is not entered, default to roll number as per system credentials specification
      const pwd = password.trim() || identifier.trim().toUpperCase();
      const response = await api.post('/auth/login', {
        email: identifier.trim(),
        password: pwd,
      });

      if (response.token) {
        setAuthToken(response.token);
        if (response.user) {
          setStoredUserInfo(response.user);
        }
        window.location.hash = '#Student/Feedback/Show';
        window.location.reload();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid credentials. Please verify your roll number or college email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <StudentLayout>
      <div className="w-full flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <Card className="max-w-md w-full shadow-xl border-slate-200 bg-white">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-2xs">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">Student Identity Verification</h2>
              <p className="text-xs text-slate-500">
                Sign in with your College Email or University Roll Number to access active feedback forms.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2 font-bold">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-4">
              <Input
                label="College Email or University Roll Number"
                placeholder="e.g. 24it019@charusat.ac.in or 24IT019"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />

              <Input
                label="Password (Default is your Roll Number)"
                type="password"
                placeholder="e.g. 24IT019"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Strict Anonymity Guaranteed</span>
                </div>
                <p>
                  Your identity is used strictly to verify active course registration. Your individual ratings and comments remain completely decoupled from your identity.
                </p>
              </div>
            </div>

            <Button
              id="student-submit-button"
              type="submit"
              variant="primary"
              size="lg"
              className="w-full bg-indigo-600 hover:bg-indigo-700 border-indigo-600 focus:ring-indigo-500 shadow-indigo-600/20"
              disabled={isSubmitting}
            >
              <span>Proceed to Feedback Form</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
        </Card>
      </div>
    </StudentLayout>
  );
}
