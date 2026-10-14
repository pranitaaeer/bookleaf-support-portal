
import { useState, type ReactNode } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="app-shell">
      <Sidebar
        open={sidebarOpen}
        onClose={closeSidebar}
      />

      <div className="app-main">
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main
          className="page-content"
          onClick={() => {
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
