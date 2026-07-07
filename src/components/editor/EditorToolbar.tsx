import React from 'react';
import { EditorView } from '@codemirror/view';
import { Bold, Italic, Strikethrough, Code, Quote, Heading1, Heading2, Heading3, List, ListOrdered } from 'lucide-react';
import { wrapSelection, insertLinePrefix } from './extensions/shortcuts';
import { isMac } from '../ui/Kbd';

interface EditorToolbarProps {
  view?: EditorView;
}

export function EditorToolbar({ view }: EditorToolbarProps) {
  if (!view) return null;

  const modKey = isMac ? 'Cmd' : 'Ctrl';

  const handleFormat = (formatter: (view: EditorView) => void) => {
    formatter(view);
    view.focus();
  };

  const IconButton = ({ icon: Icon, onClick, title }: any) => (
    <button
      onClick={() => handleFormat(onClick)}
      title={title}
      className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--bg-hover)] rounded-md transition-colors cursor-pointer"
    >
      <Icon size={16} />
    </button>
  );

  return (
    <div className="flex items-center gap-1 p-2 border-b border-[var(--border)] bg-[var(--bg-secondary)] flex-shrink-0">
      <IconButton icon={Bold} title={`Bold (${modKey}+B)`} onClick={(v: EditorView) => wrapSelection(v, '**', '**')} />
      <IconButton icon={Italic} title={`Italic (${modKey}+I)`} onClick={(v: EditorView) => wrapSelection(v, '*', '*')} />
      <IconButton icon={Strikethrough} title={`Strikethrough (${modKey}+Shift+X)`} onClick={(v: EditorView) => wrapSelection(v, '~~', '~~')} />
      <div className="w-px h-4 bg-[var(--border)] mx-1" />
      <IconButton icon={Heading1} title="Heading 1" onClick={(v: EditorView) => insertLinePrefix(v, '# ')} />
      <IconButton icon={Heading2} title="Heading 2" onClick={(v: EditorView) => insertLinePrefix(v, '## ')} />
      <IconButton icon={Heading3} title="Heading 3" onClick={(v: EditorView) => insertLinePrefix(v, '### ')} />
      <div className="w-px h-4 bg-[var(--border)] mx-1" />
      <IconButton icon={Quote} title="Quote" onClick={(v: EditorView) => insertLinePrefix(v, '> ')} />
      <IconButton icon={Code} title={`Code (${modKey}+E)`} onClick={(v: EditorView) => wrapSelection(v, '`', '`')} />
      <div className="w-px h-4 bg-[var(--border)] mx-1" />
      <IconButton icon={List} title="Bullet List" onClick={(v: EditorView) => insertLinePrefix(v, '- ')} />
      <IconButton icon={ListOrdered} title="Numbered List" onClick={(v: EditorView) => insertLinePrefix(v, '1. ')} />
    </div>
  );
}
