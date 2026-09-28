"use client";

import { useState, type ReactNode } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function DashboardShell({ children }: { children: ReactNode }) {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7F7F5]">
      <div className="flex min-h-screen">
        {mobileSidebarOpen && (
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-[#0B2A4A]/30 backdrop-blur-[1px] lg:hidden"
          />
        )}
        <Sidebar
          expanded={sidebarExpanded}
          onExpandedChange={setSidebarExpanded}
          mobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <Header
            mobileMenuOpen={mobileSidebarOpen}
            onMenuClick={() => setMobileSidebarOpen((isOpen) => !isOpen)}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}