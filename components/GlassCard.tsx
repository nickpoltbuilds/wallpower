import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  darkText?: boolean; // New prop to toggle text color
  noContentPadding?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  title, 
  icon, 
  action, 
  darkText = false,
  noContentPadding = false
}) => {
  const textColor = darkText ? 'text-slate-900' : 'text-white';
  const iconColor = darkText ? 'text-slate-700' : 'text-white/80';
  const titleColor = darkText ? 'text-slate-500' : 'text-white/60';

  return (
    <div className={`relative overflow-hidden rounded-[2rem] shadow-lg flex flex-col border-0 ${className}`}>
      {(title || icon) && (
        <div className="flex items-center justify-between px-6 pt-5 pb-2">
          <div className={`flex items-center gap-3 ${iconColor}`}>
            {icon && <span>{icon}</span>}
            <h2 className={`text-xs font-extrabold tracking-widest uppercase ${titleColor}`}>{title}</h2>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={`flex-1 relative z-10 ${textColor} ${noContentPadding ? '' : 'px-6 pb-5 pt-0'}`}>
        {children}
      </div>
    </div>
  );
};