import React from 'react';
import { useEditorStore } from '../../stores/editorStore';
import { useFileStore } from '../../stores/fileStore';

export function WikiLink({ href, children }: { href?: string, children: React.ReactNode }) {
  const targetName = href?.replace('wikilink:', '');
  const { getFileByName } = useFileStore();
  const { openFile } = useEditorStore();

  const handleNavigate = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!targetName) return;

    // See if file exists
    const file = getFileByName(targetName);
    if (file) {
      openFile(file.id);
    } else {
      // Could prompt to create, or handle missing links gracefully
      alert(`Page "${targetName}" does not exist yet.`);
    }
  };

  return (
    <a 
      href="#" 
      onClick={handleNavigate} 
      className="text-[var(--accent)] hover:text-[var(--accent-hover)] underline decoration-dotted underline-offset-4 cursor-pointer"
      title={`Go to ${targetName}`}
    >
      {children}
    </a>
  );
}
