import type { ReactNode } from 'react';
import type { Extension } from '@codemirror/state';

export interface WidgetContext {
  // Context passed to widget when rendered, empty for now
}

export interface PluginAPI {
  ui: {
    registerWidget: (zoneName: string, component: (ctx: WidgetContext) => ReactNode) => void;
  };
  editor: {
    registerExtension: (extension: Extension) => void;
  };
}

export interface NoteGraphPlugin {
  id: string;
  name: string;
  version: string;
  activate: (api: PluginAPI) => void;
  deactivate?: () => void;
}
