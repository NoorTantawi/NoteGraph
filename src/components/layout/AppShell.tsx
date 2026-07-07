import React from 'react';
import { useEditorStore } from '../../stores/editorStore';

interface AppShellProps {
  sidebar: React.ReactNode;
  main: React.ReactNode;
}

export function AppShell({ sidebar, main }: AppShellProps) {
  const sidebarOpen = useEditorStore((s) => s.sidebarOpen);

  return (
    <div 
      className="h-screen w-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)] grid transition-[grid-template-columns] duration-300"
      style={{ gridTemplateColumns: sidebarOpen ? '256px 1fr' : '0px 1fr' }}
    >
      {/* Sidebar */}
      <aside className="border-r border-[var(--border)] bg-[var(--bg-secondary)] flex flex-col h-full overflow-hidden min-w-0">
        {sidebar}
      </aside>

      {/* Main Content */}
      <main className="flex flex-col min-w-0 h-full overflow-hidden relative bg-[var(--bg-primary)]">
        {main}
      </main>
    </div>
  );
}
