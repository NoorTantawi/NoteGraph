import React from 'react';
import { Modal } from '../ui/Modal';
import { useSettingsStore } from '../../stores/settingsStore';
import { Button } from '../ui/Button';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const settingsState = useSettingsStore();
  const { updateSetting, resetSettings, ...settings } = settingsState;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings" size="md">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-[var(--text-primary)]">Theme</label>
          <select 
            value={settings.theme} 
            onChange={(e) => updateSetting('theme', e.target.value as any)}
            className="w-full bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-md px-3 py-2 text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
          >
            <option value="system">System Default</option>
            <option value="light">Light Mode</option>
            <option value="dark">Dark Mode</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-[var(--text-primary)]">Vim Mode</label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={settings.vimMode} 
              onChange={(e) => updateSetting('vimMode', e.target.checked)}
              className="w-4 h-4 accent-[var(--accent)]"
            />
            <span className="text-sm text-[var(--text-secondary)]">Enable Vim keybindings (requires reload)</span>
          </label>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-[var(--text-primary)]">Storage Provider</label>
          <select 
            value={settings.storageProvider} 
            onChange={(e) => {
              updateSetting('storageProvider', e.target.value as any);
              window.location.reload(); // Quick reload to apply provider change
            }}
            className="w-full bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-md px-3 py-2 text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
          >
            <option value="indexeddb">Local Browser Storage (IndexedDB)</option>
            <option value="filesystem">Local File System (File System Access API)</option>
          </select>
          {settings.storageProvider === 'filesystem' && (
            <div className="flex flex-col gap-2 mt-2">
              <p className="text-xs text-[var(--text-secondary)]">
                Note: File System access requires a modern browser (Chrome/Edge/Opera).
              </p>
              <Button 
                variant="primary" 
                onClick={async () => {
                  const provider = (await import('../../lib/storageProvider')).getStorageProvider();
                  if ('requestMount' in provider) {
                    // @ts-ignore
                    await provider.requestMount();
                    window.location.reload();
                  }
                }}
              >
                Mount / Change Local Folder
              </Button>
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-[var(--text-primary)]">Font Size</label>
          <div className="flex items-center gap-4">
            <input 
              type="range" 
              min="12" max="24" step="1"
              value={settings.fontSize} 
              onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
              className="flex-1 accent-[var(--accent)]"
            />
            <span className="text-sm text-[var(--text-secondary)] w-8 text-right">{settings.fontSize}px</span>
          </div>
        </div>

        <div className="flex justify-between items-center mt-4 border-t border-[var(--border)] pt-4">
          <Button variant="danger" onClick={resetSettings}>Reset to Defaults</Button>
          <Button variant="primary" onClick={onClose}>Done</Button>
        </div>
      </div>
    </Modal>
  );
}
