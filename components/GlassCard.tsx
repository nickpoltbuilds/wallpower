
import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  noContentPadding?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  title, 
  icon, 
  action, 
  noContentPadding = false
}) => {
  return (
    <div className={`widget-card relative overflow-hidden flex flex-col border-0 ${className}`}>
      {(title || icon) && (
        <div className="flex items-center justify-between px-6 pt-5 pb-2 opacity-90">
          <div className="flex items-center gap-3">
            {icon && <span className="trek-icon-hide">{icon}</span>}
            <h2 className="text-xs font-extrabold tracking-widest uppercase opacity-80 trek-title-style">{title}</h2>
          </div>
          {action && <div className="trek-action-hide">{action}</div>}
        </div>
      )}
      <div className={`flex-1 relative z-10 ${noContentPadding ? '' : 'px-6 pb-5 pt-0'}`}>
        {children}
      </div>
    </div>
  );
};
