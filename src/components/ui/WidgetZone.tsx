import React from 'react';
import { usePluginStore } from '../../stores/pluginStore';

interface WidgetZoneProps {
  name: string;
}

export function WidgetZone({ name }: WidgetZoneProps) {
  const widgets = usePluginStore(state => state.widgets[name] || []);

  if (widgets.length === 0) return null;

  return (
    <div className={`widget-zone widget-zone-${name}`}>
      {widgets.map(widget => {
        const Component = widget.component;
        return (
          <div key={widget.id} className="widget-container">
            <Component />
          </div>
        );
      })}
    </div>
  );
}
