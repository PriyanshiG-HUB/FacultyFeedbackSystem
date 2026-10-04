import React, { useState } from 'react';
import { FacultyLoginProps } from '../../types';
import { Input } from '../../Components/ui/Input';
import { Button } from '../../Components/ui/Button';
import { api, setAuthToken, setStoredUserInfo, removeAuthToken } from '../../lib/api';
import Link from '../../Components/shared/Link';
import { LogIn, AlertCircle, GraduationCap } from 'lucide-react';

export default function Login({ status }: FacultyLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage('');
    setFieldErrors({});

    try {
      removeAuthToken();
      const response = await api.post('/auth/login', { email, password });
      if (response.token) {
        setAuthToken(response.token);
        if (response.user) {
          setStoredUserInfo(response.user);
        }

        const role = response.user?.role;
        if (role === 'STUDENT') {
          window.location.hash = '#Student/Feedback/Show';
        } else if (role === 'FACULTY') {
          window.location.hash = '#Faculty/MyReports/Index';
        } else {
          window.location.hash = '#Admin/Dashboard';
        }
        window.location.reload();
      }
    } catch (err: any) {
      if (err.status === 422 && err.errors) {
        setFieldErrors(err.errors);
      } else {
        setErrorMessage(err.message || 'Invalid login credentials. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page font-sans flex items-center justify-center p-4">
      
      {/* Main Login Panel */}
      <div className="login-content w-full max-w-[480px] my-4 bg-white/[0.96] border border-white/80 rounded-[20px] p-8 shadow-[0_20px_50px_rgba(1,7,54,0.20)]">
        
        <div className="text-center mb-6">
          {/* Official Logo */}
          <img 
            src="/charusat-logo.jpg" 
            alt="CHARUSAT Logo" 
            className="w-40 mx-auto object-contain mb-4" 
          />
          
          <h1 className="text-[22px] font-semibold font-heading text-[#0D1C42] tracking-tight leading-tight mb-1">
            Faculty Feedback<br/>Management System
          </h1>
          <p className="text-[13px] text-slate-600 font-medium mb-4">
            Charotar University of Science and Technology
          </p>
          
          <div className="pt-4 border-t border-slate-200">
            <p className="text-[14px] text-[#0D1C42] font-semibold">Sign in to your account</p>
          </div>
        </div>

        {status && (
          <div className="p-3 mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-[13px] text-center font-medium">
            {status}
          </div>
        )}

        {errorMessage && (
          <div className="p-3 mb-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-[13px] flex items-start gap-2 font-medium">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="EMAIL / COLLEGE ID"
            type="text"
            placeholder=""
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors.email?.[0]}
            className="bg-white border-[#D6DCE8] focus:border-[#22396F] focus:ring-[#22396F] rounded-lg text-[14px] h-[48px]"
            required
          />

          <Input
            label="PASSWORD"
            type="password"
            placeholder=""
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password?.[0]}
            className="bg-white border-[#D6DCE8] focus:border-[#22396F] focus:ring-[#22396F] rounded-lg text-[14px] h-[48px]"
            required
          />

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="rounded bg-white border-slate-300 text-[#22396F] focus:ring-[#22396F]"
              />
              <span className="text-[13px]">Remember session</span>
            </label>
            <a href="#" className="text-[#22396F] text-[13px] hover:underline">
              Forgot password?
            </a>
          </div>

          <Button
            id="faculty-login-submit-button"
            type="submit"
            variant="primary"
            className="w-full bg-[#22396F] hover:bg-[#0D1C42] text-white border-none rounded-lg transition-colors h-[48px] font-medium mt-2 text-[15px]"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Authenticating...' : 'SIGN IN'}
          </Button>
        </form>

        {/* Institutional Cream Accent Panel */}
        <div className="mt-6 p-3 bg-[#FCF1D0] rounded-lg flex items-center gap-3">
          <div className="text-lg">🎓</div>
          <div>
            <p className="text-[13px] font-semibold text-[#0D1C42]">College credentials</p>
            <p className="text-[12px] text-[#22396F] mt-0.5">
              Use your institutional login
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
