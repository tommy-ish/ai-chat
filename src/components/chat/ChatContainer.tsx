'use client';

import { Card, CardFooter } from '@/components/ui/Card';
import { ChatHistory } from './ChatHistory';
import { ChatInput } from './ChatInput';
import { useChat } from '@/contexts/ChatContext';

export function ChatContainer() {
  const { error, clearError } = useChat();

  return (
    <div
      className="w-full max-w-4xl mx-auto h-screen sm:h-[calc(100vh-2rem)] md:h-[calc(100vh-4rem)] p-0 sm:p-2 md:p-4"
      role="main"
      aria-label="チャットアプリケーション"
    >
      <Card className="h-full flex flex-col rounded-none sm:rounded-lg shadow-none sm:shadow-md">
        <div className="flex-1 flex flex-col overflow-hidden">
          {error && (
            <div
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-3 py-2 sm:px-4 sm:py-3 rounded-none sm:rounded-lg mx-0 sm:mx-4 mt-0 sm:mt-4 flex items-center justify-between text-sm"
              role="alert"
              aria-live="assertive"
            >
              <span>{error}</span>
              <button
                onClick={clearError}
                className="text-red-700 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 ml-4 min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2"
                aria-label="エラーを閉じる"
                type="button"
              >
                ✕
              </button>
            </div>
          )}
          <ChatHistory />
        </div>
        <CardFooter className="border-t border-border p-3 sm:p-4">
          <ChatInput />
        </CardFooter>
      </Card>
    </div>
  );
}
