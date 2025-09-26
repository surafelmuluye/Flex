'use client';

import { EnhancedSidebar } from '@/components/dashboard/enhanced-sidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <EnhancedSidebar>
      {children}
    </EnhancedSidebar>
  );
}