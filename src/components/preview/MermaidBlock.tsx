import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { useTheme } from '../../hooks/useTheme';

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
});

export function MermaidBlock({ code }: { code: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: resolvedTheme === 'dark' ? 'dark' : 'default',
    });

    let isMounted = true;
    const renderDiagram = async () => {
      try {
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(id, code);
        if (isMounted) {
          setSvg(svg);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Invalid mermaid diagram');
        }
      }
    };

    renderDiagram();
    return () => { isMounted = false; };
  }, [code, resolvedTheme]);

  if (error) {
    return (
      <div className="p-4 bg-[var(--danger)]/10 text-[var(--danger)] border border-[var(--danger)]/20 rounded-md my-4 overflow-x-auto text-sm font-mono">
        {error}
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="flex justify-center my-6 overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
