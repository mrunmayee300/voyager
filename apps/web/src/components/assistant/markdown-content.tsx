'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

interface MarkdownContentProps {
  content: string;
  className?: string;
  inverted?: boolean;
}

export function MarkdownContent({ content, className, inverted }: MarkdownContentProps) {
  return (
    <div
      className={cn(
        'markdown-content text-sm leading-relaxed',
        inverted ? 'text-white [&_a]:text-ocean-100' : 'text-sand-900',
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
          ul: ({ children }) => (
            <ul className="mb-3 ml-4 list-disc space-y-1.5 last:mb-0">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-3 ml-4 list-decimal space-y-1.5 last:mb-0">{children}</ol>
          ),
          li: ({ children }) => <li className="pl-0.5">{children}</li>,
          h1: ({ children }) => (
            <h3 className="mb-2 mt-4 font-display text-base font-semibold first:mt-0">{children}</h3>
          ),
          h2: ({ children }) => (
            <h3 className="mb-2 mt-4 font-display text-base font-semibold first:mt-0">{children}</h3>
          ),
          h3: ({ children }) => (
            <h4 className="mb-2 mt-3 text-sm font-semibold first:mt-0">{children}</h4>
          ),
          strong: ({ children }) => (
            <strong className={cn('font-semibold', inverted ? 'text-white' : 'text-sand-900')}>
              {children}
            </strong>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'underline underline-offset-2',
                inverted ? 'text-ocean-100 hover:text-white' : 'text-ocean-700 hover:text-ocean-800',
              )}
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote
              className={cn(
                'mb-3 border-l-2 pl-3 italic last:mb-0',
                inverted ? 'border-ocean-300/50 text-ocean-50' : 'border-ocean-300 text-sand-800/80',
              )}
            >
              {children}
            </blockquote>
          ),
          code: ({ className: codeClass, children, ...props }) => {
            const isBlock = codeClass?.includes('language-');
            if (isBlock) {
              return (
                <code
                  className={cn(
                    'my-3 block overflow-x-auto rounded-md p-3 text-xs',
                    inverted ? 'bg-ocean-800/50' : 'bg-sand-200/80',
                  )}
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code
                className={cn(
                  'rounded px-1 py-0.5 text-xs',
                  inverted ? 'bg-ocean-800/60' : 'bg-sand-200/90',
                )}
                {...props}
              >
                {children}
              </code>
            );
          },
          hr: () => <hr className={cn('my-4', inverted ? 'border-ocean-600' : 'border-sand-200')} />,
          table: ({ children }) => (
            <div className="mb-3 overflow-x-auto last:mb-0">
              <table className="w-full min-w-[240px] border-collapse text-xs">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th
              className={cn(
                'border px-2 py-1.5 text-left font-semibold',
                inverted ? 'border-ocean-600 bg-ocean-800/40' : 'border-sand-200 bg-sand-100',
              )}
            >
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td
              className={cn(
                'border px-2 py-1.5',
                inverted ? 'border-ocean-600/80' : 'border-sand-200',
              )}
            >
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
