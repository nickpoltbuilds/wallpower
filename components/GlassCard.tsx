
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
  noContentPadding = false,
}) => {
  return (
    <div className={`widget-card relative flex flex-col min-h-0 ${className}`}>
      {(title || icon || action) && (
        <div className="flex items-center justify-between px-4 pt-4 pb-2 flex-shrink-0">
          <div className="flex items-center gap-2 opacity-70">
            {icon && <span className="flex-shrink-0">{icon}</span>}
            {title && (
              <h2 className="text-[13px] font-black tracking-[0.1em] uppercase">
                {title}
              </h2>
            )}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      <div className={`flex-1 min-h-0 relative ${noContentPadding ? '' : 'px-4 pb-4 pt-1'}`}>
        {children}
      </div>
    </div>
  );
};
