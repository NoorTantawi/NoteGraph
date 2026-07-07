import { usePluginStore } from '../stores/pluginStore';
import type { PluginAPI } from '../lib/pluginAPI';
import { StatsPlugin } from './StatsPlugin';

export function initializePlugins() {
  const store = usePluginStore.getState();

  const plugins = [
    StatsPlugin
  ];

  plugins.forEach(plugin => {
    console.log(`[Plugin System] Activating ${plugin.name} v${plugin.version}`);
    
    const api: PluginAPI = {
      ui: {
        registerWidget: (zoneName, component) => {
          store.registerWidget(plugin.id, zoneName, component);
        }
      },
      editor: {
        registerExtension: (extension) => {
          store.registerExtension(extension);
        }
      }
    };

    try {
      plugin.activate(api);
    } catch (e) {
      console.error(`[Plugin System] Failed to activate plugin ${plugin.name}:`, e);
    }
  });
}
