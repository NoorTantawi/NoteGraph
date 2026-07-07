import React, { memo } from 'react';
import { useCodeMirror } from '../../hooks/useCodeMirror';
import { useTheme } from '../../hooks/useTheme';
import { EditorToolbar } from './EditorToolbar';
import { doc, webrtcProvider } from '../../lib/yjsStore';

interface MarkdownEditorProps {
  fileId?: string;
  content: string;
  onChange: (content: string) => void;
  readOnly?: boolean;
}

export const MarkdownEditor = memo(function MarkdownEditor({
  fileId,
  content,
  onChange,
  readOnly = false,
}: MarkdownEditorProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const ytext = React.useMemo(() => fileId ? doc.getText(fileId) : undefined, [fileId]);

  const { containerRef, view } = useCodeMirror({
    fileId: fileId || '',
    initialValue: content,
    onChange,
    isDark,
    readOnly,
    ytext,
    provider: webrtcProvider,
  });

  return (
    <div className="flex flex-col w-full h-full border-r border-[var(--border)] bg-[var(--bg-primary)]">
      {!readOnly && <EditorToolbar view={view} />}
      <div 
        ref={containerRef} 
        className="flex-1 overflow-y-auto"
      />
    </div>
  );
});
