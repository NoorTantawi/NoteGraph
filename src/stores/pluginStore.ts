import { create } from 'zustand';
import type { ReactNode } from 'react';
import type { Extension } from '@codemirror/state';
import type { WidgetContext } from '../lib/pluginAPI';

export interface WidgetRegistration {
  id: string;
  pluginId: string;
  zoneName: string;
  component: (ctx: WidgetContext) => ReactNode;
}

interface PluginStoreState {
  widgets: Record<string, WidgetRegistration[]>;
  cmExtensions: Extension[];
  registerWidget: (pluginId: string, zoneName: string, component: (ctx: WidgetContext) => ReactNode) => void;
  registerExtension: (extension: Extension) => void;
}

export const usePluginStore = create<PluginStoreState>((set) => ({
  widgets: {},
  cmExtensions: [],

  registerWidget: (pluginId, zoneName, component) => {
    set((state) => {
      const zoneWidgets = state.widgets[zoneName] || [];
      const newWidget: WidgetRegistration = {
        id: crypto.randomUUID(),
        pluginId,
        zoneName,
        component
      };
      
      return {
        widgets: {
          ...state.widgets,
          [zoneName]: [...zoneWidgets, newWidget]
        }
      };
    });
  },

  registerExtension: (extension) => {
    set((state) => ({
      cmExtensions: [...state.cmExtensions, extension]
    }));
  }
}));
