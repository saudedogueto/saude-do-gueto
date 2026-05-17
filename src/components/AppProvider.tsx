import React from 'react';
import { ToastProvider } from './Toast';

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      {children}
    </ToastProvider>
  );
}
