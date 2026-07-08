import React, { useState } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { Modal } from '../ui/Modal';
import { MarkdownPreview } from '../preview/MarkdownPreview';
import { useEditorStore } from '../../stores/editorStore';
import { FileText, Eye } from 'lucide-react';

export interface FileNodeData extends Record<string, unknown> {
  label: string;
  content: string;
}

export type FileNodeProps = NodeProps<Node<FileNodeData>>;

export function FileNodeWidget({ id, data }: FileNodeProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const openFile = useEditorStore((s) => s.openFile);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPreviewOpen(true);
  };

  const handleOpenEditor = (e: React.MouseEvent) => {
    e.stopPropagation();
    openFile(id);
    useEditorStore.getState().toggleGraphView();
  };

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]/80 backdrop-blur-md shadow-lg hover:border-[var(--accent)] hover:shadow-xl transition-all duration-300 min-w-[220px] max-w-[280px] select-none text-[var(--text-primary)] relative"
      style={{
        fontFamily: 'var(--font-ui)',
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-2.5 h-2.5 !bg-[var(--accent)] border-2 border-[var(--bg-primary)]"
      />
      
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-[var(--accent-glow)] text-[var(--accent)] shrink-0">
          <FileText size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">{data.label}</h3>
          <p className="text-[var(--text-tertiary)] text-xs mt-0.5">
            {data.content ? `${data.content.split(/\s+/).filter(Boolean).length} words` : 'Empty note'}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-[var(--border)] pt-2.5">
        <button
          onClick={handleDoubleClick}
          className="flex items-center gap-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs transition-colors py-1 px-2 rounded hover:bg-[var(--bg-hover)] cursor-pointer"
        >
          <Eye size={12} />
          Preview
        </button>
        <button
          onClick={handleOpenEditor}
          className="text-xs text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium transition-colors py-1 px-2 rounded hover:bg-[var(--accent-glow)] cursor-pointer"
        >
          Edit Note
        </button>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-2.5 h-2.5 !bg-[var(--accent)] border-2 border-[var(--bg-primary)]"
      />

      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={data.label}
        size="lg"
      >
        <div className="max-h-[60vh] overflow-y-auto pr-2">
          <MarkdownPreview content={data.content} />
        </div>
      </Modal>
    </div>
  );
}
