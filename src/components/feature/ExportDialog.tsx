import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useFileStore } from '../../stores/fileStore';
import { useEditorStore } from '../../stores/editorStore';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportDialog({ isOpen, onClose }: ExportDialogProps) {
  const { files } = useFileStore();
  const { activeFileId } = useEditorStore();
  
  const activeFile = activeFileId ? files[activeFileId] : null;

  const handleExportMd = () => {
    if (!activeFile) return;
    const blob = new Blob([activeFile.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export File" size="sm">
      <div className="flex flex-col gap-4">
        {activeFile ? (
          <>
            <p className="text-sm text-[var(--text-secondary)]">
              Export <strong>{activeFile.name}</strong>
            </p>
            <div className="flex flex-col gap-2">
              <Button variant="secondary" onClick={handleExportMd}>
                Export as Markdown (.md)
              </Button>
              <Button variant="secondary" onClick={() => alert('HTML Export coming soon!')}>
                Export as HTML
              </Button>
            </div>
          </>
        ) : (
          <p className="text-sm text-[var(--text-tertiary)] text-center py-4">
            Open a file first to export it.
          </p>
        )}
      </div>
    </Modal>
  );
}
