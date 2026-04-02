'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import IconRail from './IconRail';
import BottomNav from './BottomNav';
import TopBar from './TopBar';
import Footer from './Footer';

interface AppShellProps {
  children: React.ReactNode;
  userName?: string | null;
  avatarUrl?: string | null;
  userRole?: 'member' | 'admin' | 'super_admin' | null;
}

export default function AppShell({ children, userName, avatarUrl, userRole }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex" style={{ background: '#FDF8F0' }}>
      {/* Desktop sidebar (220px) */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userRole={userRole}
        userName={userName}
      />

      {/* Tablet icon rail (64px) */}
      <IconRail userRole={userRole} />

      {/* Main content area — offset by sidebar/rail width */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-[220px] md:ml-[64px]">
        <TopBar
          onMenuClick={() => setSidebarOpen(true)}
          userName={userName}
          avatarUrl={avatarUrl}
        />

        <main className="flex-1 overflow-y-auto px-4 md:px-6 py-5 pb-20 md:pb-5">
          {children}
        </main>

        <Footer />
      </div>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  );
}
