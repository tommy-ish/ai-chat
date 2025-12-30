import type { Message } from '@/types/chat';

interface ChatMessageProps {
  message: Message;
  isLatest?: boolean;
}

export function ChatMessage({ message, isLatest: _isLatest = false }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const roleLabel = isUser ? 'あなた' : 'AI';

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3 sm:mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300`}
      role="article"
      aria-label={`${roleLabel}のメッセージ`}
    >
      <div
        className={`max-w-[85%] sm:max-w-[80%] rounded-lg px-3 py-2.5 sm:px-4 sm:py-3 shadow-sm ${
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-foreground border border-border'
        }`}
      >
        <div className="flex items-start gap-2 sm:gap-3">
          <div className="flex-1 min-w-0">
            <div className="sr-only">{roleLabel}:</div>
            {message.imageData && message.imageMimeType && (
              <div className="mb-2">
                <img
                  src={`data:${message.imageMimeType};base64,${message.imageData}`}
                  alt="添付画像"
                  className="max-w-full h-auto max-h-60 rounded border border-border"
                />
              </div>
            )}
            <p className="text-sm sm:text-base whitespace-pre-wrap break-words leading-relaxed">
              {message.content}
            </p>
            <time
              className={`text-xs mt-1.5 sm:mt-2 block ${
                isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
              }`}
              dateTime={new Date(message.createdAt).toISOString()}
            >
              {new Date(message.createdAt).toLocaleTimeString('ja-JP', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </time>
          </div>
        </div>
      </div>
    </div>
  );
}
