import React from 'react';

export interface AppLayoutProps {
  headerContent: React.ReactNode;
  leftSidebarContent: React.ReactNode;
  mainContent: React.ReactNode;
  rightSidebarContent: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  headerContent,
  leftSidebarContent,
  mainContent,
  rightSidebarContent,
}) => {
  return (
    <div className={`
      min-h-screen
      bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900
      text-neutral-100
      flex flex-col items-center justify-center
      p-4 md:p-6
      selection:bg-sky-500 selection:text-white
    `}>
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <header className="mb-6 md:mb-8 text-center relative z-10">
        {headerContent}
      </header>

      <div className={`
        flex flex-col lg:flex-row
        gap-6 items-start
        w-full
        max-w-sm sm:max-w-md md:max-w-xl lg:max-w-6xl xl:max-w-7xl
        relative z-10
      `}>
        {/* Left Side */}
        <div className={`
          w-full lg:w-64
          order-2 lg:order-1
          flex-shrink-0 space-y-4
        `}>
          {leftSidebarContent}
        </div>

        {/* Center - Chess Board */}
        <div className={`
          flex-grow flex justify-center
          order-1 lg:order-2
          w-full lg:w-auto
        `}>
          {mainContent}
        </div>

        {/* Right Side */}
        <div className={`
          w-full lg:w-64
          order-3 lg:order-3
          flex-shrink-0 space-y-6
        `}>
          {rightSidebarContent}
        </div>
      </div>
    </div>
  );
};
