'use client';

import { useEffect, useRef } from 'react';
import { ChatMessage } from './ChatMessage';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useChat } from '@/contexts/ChatContext';

export function ChatHistory() {
  const { messages, isLoading } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div
      className="flex-1 overflow-y-auto px-3 py-4 sm:px-4 sm:py-6 space-y-3 sm:space-y-4 scroll-smooth"
      role="log"
      aria-label="会話履歴"
      aria-live="polite"
      aria-atomic="false"
    >
      {messages.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center h-full text-center px-4"
          role="status"
        >
          <div className="max-w-md space-y-3 sm:space-y-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
              AIチャットへようこそ
            </h2>
            <p className="text-sm sm:text-base text-secondary">
              メッセージを入力して会話を始めましょう。
            </p>
          </div>
        </div>
      ) : (
        <>
          {messages.map((message, index) => (
            <ChatMessage
              key={message.id}
              message={message}
              isLatest={index === messages.length - 1}
            />
          ))}
          {isLoading && (
            <div className="flex justify-start mb-4" role="status" aria-label="AI が応答を生成中">
              <div className="bg-muted rounded-lg px-3 py-2 sm:px-4 sm:py-3">
                <LoadingSpinner size="sm" />
                <span className="sr-only">AIが応答を生成しています...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} aria-hidden="true" />
        </>
      )}
    </div>
  );
}
