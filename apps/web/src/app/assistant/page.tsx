'use client';

import { useMutation } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { Send } from 'lucide-react';
import { ChatMessage, type ChatMessageData } from '@/components/assistant/chat-message';
import { TypingIndicator } from '@/components/assistant/typing-indicator';

const SUGGESTED = [
  'What documents do I need for a Schengen visa?',
  'How much cash should I carry abroad?',
  'What should I pack for a 2-week trip?',
  'Airport forex vs local ATM — which is better?',
];

interface ChatResponse {
  chatId: string;
  message: string;
  citations?: Array<{ title: string; sourceUrl?: string | null }>;
  confidence?: number;
  suggestedPrompts?: string[];
}

function nextId() {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function AssistantPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [input, setInput] = useState('');
  const [chatId, setChatId] = useState<string | undefined>();
  const [followUps, setFollowUps] = useState<string[]>(SUGGESTED);
  const bottomRef = useRef<HTMLDivElement>(null);

  const mutation = useMutation({
    mutationFn: (msg: string) =>
      api<ChatResponse>('/ai/chat', {
        method: 'POST',
        token: token!,
        body: JSON.stringify({ message: msg, chatId }),
      }),
    onMutate: (msg) => {
      setMessages((m) => [
        ...m,
        { id: nextId(), role: 'user', content: msg },
      ]);
      setInput('');
    },
    onSuccess: (data) => {
      setChatId(data.chatId);
      setMessages((m) => [
        ...m,
        {
          id: nextId(),
          role: 'assistant',
          content: data.message,
          citations: data.citations,
          confidence: data.confidence,
        },
      ]);
      if (data.suggestedPrompts?.length) {
        setFollowUps(data.suggestedPrompts);
      }
    },
    onError: () => {
      setMessages((m) => [
        ...m,
        {
          id: nextId(),
          role: 'assistant',
          content:
            '**Something went wrong.** Please try again in a moment.\n\nIf the problem continues, check that the API is running.',
        },
      ]);
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, mutation.isPending]);

  const send = (text: string) => {
    if (!text.trim() || mutation.isPending) return;
    if (!token) {
      router.push('/login?redirect=/assistant');
      return;
    }
    mutation.mutate(text.trim());
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col px-5 py-12 md:px-8" style={{ minHeight: 'calc(100vh - 12rem)' }}>
      <p className="text-sm font-medium uppercase tracking-wider text-ocean-600">AI assistant</p>
      <h1 className="editorial-heading mt-2 text-3xl font-semibold text-sand-900">Travel assistant</h1>
      <p className="mt-2 text-sm text-sand-800/60">
        Structured answers for visas, packing, customs, and budgets.
      </p>

      <div className="card-elevated mt-8 flex flex-1 flex-col overflow-hidden">
        <div
          className="flex-1 space-y-6 overflow-y-auto p-4 md:p-6"
          style={{ minHeight: 360, maxHeight: 'min(70vh, 560px)' }}
        >
          {messages.length === 0 ? (
            <div className="flex h-full min-h-[280px] flex-col items-center justify-center text-center">
              <p className="text-sm text-sand-800/50">Ask about visas, packing, customs, or budgeting.</p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {SUGGESTED.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="rounded-full border border-sand-200 px-3 py-1.5 text-left text-xs text-sand-800/80 transition-colors hover:border-ocean-200 hover:bg-ocean-50/50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((m) => (
                <ChatMessage key={m.id} message={m} />
              ))}
              {mutation.isPending && <TypingIndicator />}
            </>
          )}
          <div ref={bottomRef} aria-hidden className="h-1 shrink-0" />
        </div>

        {messages.length > 0 && followUps.length > 0 && !mutation.isPending && (
          <div className="border-t border-sand-100 bg-sand-50/50 px-4 py-3">
            <p className="text-[10px] font-medium uppercase tracking-wider text-sand-800/40">
              Suggested follow-ups
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {followUps.slice(0, 4).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-full border border-sand-200 bg-white px-3 py-1 text-xs text-sand-800/70 hover:border-ocean-200"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-sand-100 p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a travel question..."
              disabled={mutation.isPending}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={mutation.isPending || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
