import React from 'react';
import { useApp } from '../context/AppContext';

export default function Toast() {
  const { toast } = useApp();
  if (!toast) return null;

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${colors[toast.type] || colors.success} text-white px-5 py-3 rounded-2xl shadow-lg text-sm font-medium animate-bounce`}>
      {toast.message}
    </div>
  );
}
