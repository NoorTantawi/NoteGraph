import React from 'react';

interface CodeBlockProps {
  className?: string;
  children: React.ReactNode;
  [key: string]: any;
}

export function CodeBlock({ className, children, ...rest }: CodeBlockProps) {
  // Since we don't have Shiki yet, we just render standard code.
  // The 'prose' Tailwind class will handle basic styling.
  return (
    <code className={className} {...rest}>
      {children}
    </code>
  );
}
