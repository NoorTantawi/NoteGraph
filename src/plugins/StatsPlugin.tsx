import React from 'react';
import type { NoteGraphPlugin, PluginAPI } from '../lib/pluginAPI';
import { useFileStore } from '../stores/fileStore';
import { Database } from 'lucide-react';

function StatsWidget() {
  const files = useFileStore(state => state.files);
  const fileCount = Object.keys(files).filter(id => files[id].type === 'file').length;
  const folderCount = Object.keys(files).filter(id => files[id].type === 'folder').length;

  return (
    <div style={{
      padding: '12px',
      borderTop: '1px solid var(--border)',
      color: 'var(--text-secondary)',
      fontSize: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }}>
      <Database size={14} />
      <span>{fileCount} files, {folderCount} folders</span>
    </div>
  );
}

export const StatsPlugin: NoteGraphPlugin = {
  id: 'core.stats',
  name: 'Workspace Stats',
  version: '1.0.0',
  activate: (api: PluginAPI) => {
    api.ui.registerWidget('sidebar-bottom', () => <StatsWidget />);
  }
};
