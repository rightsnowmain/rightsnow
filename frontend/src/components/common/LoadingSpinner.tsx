import React from 'react';

export const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'පූරණය වෙමින් පවතී...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-10 h-10 border-4 border-rose-900 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-sm font-medium text-slate-600">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
