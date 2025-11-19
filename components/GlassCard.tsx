import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', title, icon, action }) => {
  return (
    <div className={`relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl flex flex-col ${className}`}>
      {(title || icon) && (
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <div className="flex items-center gap-3 text-white/80">
            {icon && <span className="text-blue-400">{icon}</span>}
            <h2 className="text-lg font-semibold tracking-wide uppercase text-white/60 text-xs">{title}</h2>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="flex-1 px-6 pb-6 pt-0 relative z-10">
        {children}
      </div>
      
      {/* Decorative gradients */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 opacity-20 bg-gradient-to-br from-white/5 to-transparent"></div>
    </div>
  );
};