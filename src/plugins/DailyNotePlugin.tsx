import React, { useState } from 'react';
import type { NoteGraphPlugin, PluginAPI } from '../lib/pluginAPI';
import { useFileStore } from '../stores/fileStore';
import { useEditorStore } from '../stores/editorStore';
import { CalendarDays, Sunrise } from 'lucide-react';

function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDayLabel(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function buildTemplate(dateStr: string): string {
  return `# ${dateStr}

## Tasks for today
- [ ] 

## Notes

`;
}

function DailyNoteWidget() {
  const files = useFileStore(s => s.files);
  const createFile = useFileStore(s => s.createFile);
  const openFile = useEditorStore(s => s.openFile);
  const [loading, setLoading] = useState(false);

  const today = getTodayString();
  const dayLabel = getDayLabel();
  const fileName = `${today}.md`;

  const existingFile = Object.values(files).find(
    f => f.type === 'file' && f.name === fileName,
  );

  const handleClick = async () => {
    setLoading(true);
    try {
      if (existingFile) {
        openFile(existingFile.id);
      } else {
        const id = await createFile({
          name: fileName,
          parentId: null,
          type: 'file',
          content: buildTemplate(today),
        });
        openFile(id);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        margin: '8px 12px',
        padding: '14px',
        borderRadius: 'var(--radius-lg)',
        background:
          'linear-gradient(135deg, hsla(250, 80%, 65%, 0.12), hsla(200, 60%, 50%, 0.08))',
        border: '1px solid hsla(250, 80%, 65%, 0.2)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '10px',
        }}
      >
        <Sunrise size={16} style={{ color: 'var(--accent)' }} />
        <span
          style={{
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--text-secondary)',
          }}
        >
          Daily Note
        </span>
      </div>

      {/* Date */}
      <p
        style={{
          fontSize: '13px',
          fontWeight: 500,
          color: 'var(--text-primary)',
          marginBottom: '12px',
          lineHeight: 1.3,
        }}
      >
        {dayLabel}
      </p>

      {/* Button */}
      <button
        onClick={handleClick}
        disabled={loading}
        style={{
          width: '100%',
          padding: '7px 0',
          fontSize: '12px',
          fontWeight: 600,
          color: '#fff',
          background: existingFile
            ? 'hsla(250, 80%, 65%, 0.8)'
            : 'linear-gradient(135deg, hsl(250, 80%, 60%), hsl(220, 70%, 55%))',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          cursor: loading ? 'wait' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          transition: 'filter 150ms ease, transform 100ms ease',
        }}
        onMouseOver={e => {
          if (!loading) e.currentTarget.style.filter = 'brightness(1.15)';
        }}
        onMouseOut={e => {
          e.currentTarget.style.filter = 'brightness(1)';
        }}
        onMouseDown={e => {
          if (!loading) e.currentTarget.style.transform = 'scale(0.97)';
        }}
        onMouseUp={e => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <CalendarDays size={13} />
        {existingFile ? "Open Today's Note" : "Create Today's Note"}
      </button>
    </div>
  );
}

export const DailyNotePlugin: NoteGraphPlugin = {
  id: 'core.daily-note',
  name: 'Daily Notes',
  version: '1.0.0',
  activate: (api: PluginAPI) => {
    api.ui.registerWidget('sidebar-top', () => <DailyNoteWidget />);
  },
};
