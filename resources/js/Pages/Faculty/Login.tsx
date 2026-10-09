import React, { useState } from 'react';
import { FacultyLoginProps } from '../../types';
import { api, setAuthToken, setStoredUserInfo, removeAuthToken } from '../../lib/api';
import { LogIn, AlertCircle, Mail, Lock, Eye, EyeOff, Check, ArrowLeft, Send } from 'lucide-react';

export default function Login({ status }: FacultyLoginProps) {
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Forgot Password State
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState('');

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

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage('');
    setResetStatus('');
    setFieldErrors({});

    try {
      const response = await api.post('/auth/forgot-password', { email: resetEmail });
      setResetStatus(response.message || 'If an account with that email exists, a password reset link has been sent.');
      setResetEmail('');
    } catch (err: any) {
      if (err.status === 422 && err.errors) {
        setFieldErrors(err.errors);
      } else {
        setErrorMessage(err.message || 'Unable to process request. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page font-sans flex items-center justify-center p-4 min-h-screen bg-slate-900/5 backdrop-blur-sm">
      
      {/* Main Login Panel */}
      <div className="login-content w-full max-w-[560px] my-4 bg-white/[0.98] border border-white rounded-[24px] p-10 shadow-[0_24px_60px_rgba(1,7,54,0.12)] backdrop-blur-md">
        
        <div className="text-center mb-8">
          {/* Official Logo */}
          <div className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-5 overflow-hidden">
             <img 
              src="/charusat_logo.png" 
              alt="CHARUSAT Logo" 
              className="w-[120%] h-[120%] object-contain" 
             />
          </div>
          
          <h1 className="text-[26px] font-bold font-heading text-[#0D1C42] tracking-tight leading-tight mb-2">
            Faculty Feedback<br/>Management System
          </h1>
          <p className="text-[14px] text-slate-500 font-medium mb-6">
            Charotar University of Science and Technology
          </p>
          
          <div className="pt-6 border-t border-slate-100 relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-4 text-[12px] font-bold uppercase tracking-widest text-slate-400">
              {isForgotPassword ? 'Reset your password' : 'Sign in to your account'}
            </span>
          </div>
        </div>

        {status && !isForgotPassword && (
          <div className="p-4 mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-[13px] text-center font-medium shadow-sm">
            {status}
          </div>
        )}

        {resetStatus && isForgotPassword && (
          <div className="p-4 mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-[13px] text-center font-medium shadow-sm">
            {resetStatus}
          </div>
        )}

        {errorMessage && (
          <div className="p-4 mb-6 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-[13px] flex items-start gap-3 font-medium shadow-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {isForgotPassword ? (
          // Forgot Password Form
          <form onSubmit={handleForgotSubmit} className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <p className="text-sm text-slate-600 text-center mb-6">
              Enter your college email address and we will send you a link to reset your password.
            </p>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#0D1C42] uppercase tracking-wide">
                EMAIL ADDRESS
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#22396F] transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 bg-slate-50/50 border rounded-xl text-[14px] text-[#0D1C42] placeholder-slate-400 focus:outline-none focus:ring-4 transition-all ${
                    fieldErrors.email
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
                      : 'border-slate-200 focus:border-[#22396F] focus:ring-[#22396F]/10 hover:border-slate-300'
                  }`}
                  required
                />
              </div>
              {fieldErrors.email && <p className="text-xs text-rose-600 font-semibold mt-1.5">{fieldErrors.email[0]}</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#22396F] to-[#0D1C42] hover:from-[#1e3260] hover:to-[#0a1633] text-white border-none rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-[1px] h-[52px] font-bold text-[15px] mt-4 flex items-center justify-center gap-2 focus:ring-4 focus:ring-[#22396F]/20"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                'Sending...'
              ) : (
                <>
                  SEND RESET LINK <Send className="w-4 h-4 ml-1" />
                </>
              )}
            </button>

            <div className="text-center mt-6">
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setErrorMessage('');
                  setFieldErrors({});
                  setResetStatus('');
                }}
                className="text-[#22396F] text-[13.5px] font-semibold hover:text-[#0D1C42] hover:underline transition-colors inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </button>
            </div>
          </form>
        ) : (
          // Standard Login Form
          <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#0D1C42] uppercase tracking-wide">
                EMAIL / COLLEGE ID
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#22396F] transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 bg-slate-50/50 border rounded-xl text-[14px] text-[#0D1C42] placeholder-slate-400 focus:outline-none focus:ring-4 transition-all ${
                    fieldErrors.email
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
                      : 'border-slate-200 focus:border-[#22396F] focus:ring-[#22396F]/10 hover:border-slate-300'
                  }`}
                  required
                />
              </div>
              {fieldErrors.email && <p className="text-xs text-rose-600 font-semibold mt-1.5">{fieldErrors.email[0]}</p>}
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#0D1C42] uppercase tracking-wide">
                PASSWORD
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#22396F] transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-11 pr-12 py-3 bg-slate-50/50 border rounded-xl text-[14px] text-[#0D1C42] placeholder-slate-400 focus:outline-none focus:ring-4 transition-all ${
                    fieldErrors.password
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
                      : 'border-slate-200 focus:border-[#22396F] focus:ring-[#22396F]/10 hover:border-slate-300'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {fieldErrors.password && <p className="text-xs text-rose-600 font-semibold mt-1.5">{fieldErrors.password[0]}</p>}
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center w-5 h-5 rounded-[6px] border border-slate-300 bg-white group-hover:border-[#22396F] transition-colors">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="peer absolute opacity-0 w-full h-full cursor-pointer"
                  />
                  <div className="absolute inset-0 rounded-[5px] bg-[#22396F] scale-0 peer-checked:scale-100 transition-transform duration-200 ease-out flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                  </div>
                </div>
                <span className="text-[13.5px] text-slate-600 font-medium select-none group-hover:text-[#0D1C42] transition-colors">Remember session</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(true);
                  setErrorMessage('');
                  setFieldErrors({});
                }}
                className="text-[#22396F] text-[13.5px] font-semibold hover:text-[#0D1C42] hover:underline transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <button
              id="faculty-login-submit-button"
              type="submit"
              className="w-full bg-gradient-to-r from-[#22396F] to-[#0D1C42] hover:from-[#1e3260] hover:to-[#0a1633] text-white border-none rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-[1px] h-[52px] font-bold text-[15px] mt-4 flex items-center justify-center gap-2 focus:ring-4 focus:ring-[#22396F]/20"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                'Authenticating...'
              ) : (
                <>
                  SIGN IN <LogIn className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Institutional SSO Panel Alternative */}
        {!isForgotPassword && (
          <button type="button" className="w-full mt-6 p-4 bg-[#FCF1D0]/30 hover:bg-[#FCF1D0]/60 border border-[#FCF1D0] rounded-xl flex items-center gap-4 transition-all duration-300 group hover:shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm border border-[#f5e6b3] group-hover:scale-105 transition-transform duration-300">
              <span className="text-xl">🎓</span>
            </div>
            <div className="text-left flex-1">
              <p className="text-[14px] font-bold text-[#0D1C42]">College credentials</p>
              <p className="text-[12px] text-[#22396F] font-medium mt-0.5">
                Use your institutional login portal
              </p>
            </div>
            <LogIn className="w-4 h-4 text-[#22396F] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
          </button>
        )}

      </div>
    </div>
  );
}
