import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { SystemUpdateBanner } from './SystemUpdateBanner';
import { useState } from 'react';

export function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('procuresync_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('procuresync_sidebar_collapsed', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  return (
    <div className="flex h-screen h-[100dvh] overflow-hidden bg-slate-50 font-sans text-slate-900">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        toggleCollapsed={toggleSidebarCollapse}
      />
      
      <div className="flex flex-col flex-1 w-0 overflow-hidden min-w-0 transition-all duration-300">
        <Header 
          onMenuClick={() => setIsSidebarOpen(true)}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
        />
        <SystemUpdateBanner />
        <main className="flex-1 relative overflow-y-auto focus:outline-none scroll-smooth">
          <div className="p-3 sm:p-6 md:p-8 max-w-7xl mx-auto w-full pb-20 lg:pb-8">
            <Outlet />
          </div>
        </main>
        
        {/* Mobile & PWA Bottom Navigation Bar */}
        <BottomNav 
          onOpenMenu={() => setIsSidebarOpen(prev => !prev)}
          isMenuOpen={isSidebarOpen}
        />
      </div>
    </div>
  );
}
