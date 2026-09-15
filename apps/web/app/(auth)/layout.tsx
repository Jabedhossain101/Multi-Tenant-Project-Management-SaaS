import * as React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-8 bg-background overflow-hidden">
      {/* Dynamic Background Glow Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-blue-600/15 via-indigo-600/10 to-purple-600/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
      
      {/* Content wrapper */}
      <div className="relative z-10 w-full flex justify-center">
        {children}
      </div>
    </div>
  );
}
