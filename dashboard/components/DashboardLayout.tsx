'use client';

import Header from './Header';
import Footer from './Footer';
import { ReactNode } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-lmnh-dark flex flex-col">
      {/* Header */}
      <Header />
      
      {/* Main Content - Grows to fill space */}
      <main className="flex-1">
        {children}
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

