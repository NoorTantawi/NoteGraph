import React, { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import { remarkWikilinks } from '../../plugins/remarkWikilinks';
import { MermaidBlock } from './MermaidBlock';
import { WikiLink } from './WikiLink';
import { CodeBlock } from './CodeBlock';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import 'katex/dist/katex.min.css';

interface MarkdownPreviewProps {
  content: string;
}

export const MarkdownPreview = memo(function MarkdownPreview({ content }: MarkdownPreviewProps) {
  return (
    <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none p-6">
      <ErrorBoundary name="Markdown Preview">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath, remarkWikilinks]}
          rehypePlugins={[rehypeRaw, rehypeKatex]}
          components={{
            code(props) {
              const {children, className, node, ...rest} = props;
              const match = /language-(\w+)/.exec(className || '');
              if (match && match[1] === 'mermaid') {
                return (
                  <ErrorBoundary name="Mermaid Diagram">
                    <MermaidBlock code={String(children).replace(/\n$/, '')} />
                  </ErrorBoundary>
                );
              }
              return <CodeBlock className={className} {...rest}>{children}</CodeBlock>;
            },
            a(props) {
              const { href, children } = props;
              if (href?.startsWith('wikilink:')) {
                return <WikiLink href={href}>{children}</WikiLink>;
              }
              return <a href={href} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">{children}</a>;
            }
          }}
        >
          {content}
        </ReactMarkdown>
      </ErrorBoundary>
    </div>
  );
});
