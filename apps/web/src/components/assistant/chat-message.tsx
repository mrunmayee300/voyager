'use client';

import { ExternalLink, Sparkles } from 'lucide-react';
import { MarkdownContent } from './markdown-content';
import { cn } from '@/lib/utils';

export interface AssistantCitation {
  title: string;
  sourceUrl?: string | null;
}

export interface ChatMessageData {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: AssistantCitation[];
  confidence?: number;
}

interface ChatMessageProps {
  message: ChatMessageData;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-ocean-700 px-4 py-3 text-white shadow-sm">
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ocean-50 text-ocean-700"
        aria-hidden
      >
        <Sparkles className="h-4 w-4" />
      </div>
      <div className="min-w-0 max-w-[90%] flex-1">
        <div className="rounded-2xl rounded-bl-md border border-sand-200/80 bg-white px-4 py-4 shadow-sm">
          <MarkdownContent content={message.content} />

          {message.citations && message.citations.length > 0 && (
            <div className="mt-4 border-t border-sand-100 pt-3">
              <p className="text-xs font-medium uppercase tracking-wider text-sand-800/50">Sources</p>
              <ul className="mt-2 space-y-1.5">
                {message.citations.map((c) => (
                  <li key={c.title} className="text-xs">
                    {c.sourceUrl ? (
                      <a
                        href={c.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-ocean-700 hover:underline"
                      >
                        {c.title}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-sand-800/70">{c.title}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {message.confidence != null && message.confidence > 0 && (
            <p className={cn('mt-3 text-[10px] text-sand-800/40')}>
              Confidence: {Math.round(message.confidence * 100)}% · Verify critical details with official sources
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
