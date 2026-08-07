import React from 'react';
import { Users, Building2, Star, CheckCircle2, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon?: 'users' | 'building' | 'star' | 'check-circle' | string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, change, isPositive = true, icon = 'star' }) => {
  const getIcon = () => {
    switch (icon) {
      case 'users':
        return <Users className="w-5 h-5 text-indigo-600" />;
      case 'building':
        return <Building2 className="w-5 h-5 text-purple-600" />;
      case 'star':
        return <Star className="w-5 h-5 text-amber-500 fill-amber-500/20" />;
      case 'check-circle':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      default:
        return <Star className="w-5 h-5 text-indigo-600" />;
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</span>
        <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg group-hover:scale-105 transition-transform">
          {getIcon()}
        </div>
      </div>
      <div className="mt-4 flex items-baseline justify-between">
        <h4 className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</h4>
        {change && (
          <span
            className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${
              isPositive
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                : 'bg-rose-50 text-rose-700 border border-rose-200/60'
            }`}
          >
            {isPositive ? <TrendingUp className="w-3.5 h-3.5 mr-1 text-emerald-600" /> : <TrendingDown className="w-3.5 h-3.5 mr-1 text-rose-600" />}
            {change}
          </span>
        )}
      </div>
    </div>
  );
};
