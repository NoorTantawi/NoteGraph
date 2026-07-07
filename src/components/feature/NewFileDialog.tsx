import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useFileStore } from '../../stores/fileStore';

interface NewFileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  parentId: string | null;
  type: 'file' | 'folder';
}

export function NewFileDialog({ isOpen, onClose, parentId, type }: NewFileDialogProps) {
  const [name, setName] = useState('');
  const { createFile, createFolder } = useFileStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (type === 'file') {
      let finalName = name.trim();
      if (!finalName.endsWith('.md')) {
        finalName += '.md';
      }
      createFile({ name: finalName, parentId, type: 'file' });
    } else {
      createFolder({ name: name.trim(), parentId, type: 'folder' });
    }
    
    setName('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`New ${type === 'file' ? 'File' : 'Folder'}`} size="sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input 
          autoFocus 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder={`Enter ${type} name...`} 
        />
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
          <Button variant="primary" type="submit">Create</Button>
        </div>
      </form>
    </Modal>
  );
}
