'use client';

import { useState, useRef, type FormEvent, type KeyboardEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { ImageUpload } from '@/components/chat/ImageUpload';
import { useChat } from '@/contexts/ChatContext';

export function ChatInput() {
  const [input, setInput] = useState('');
  const [imageData, setImageData] = useState<string | undefined>(undefined);
  const [imageMimeType, setImageMimeType] = useState<string | undefined>(undefined);
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);
  const { sendMessage, isLoading } = useChat();
  const isComposingRef = useRef(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    await sendMessage(input, imageData, imageMimeType);
    setInput('');
    setImageData(undefined);
    setImageMimeType(undefined);
    setImagePreview(undefined);
  };

  const handleImageSelect = (data: string, mimeType: string) => {
    setImageData(data);
    setImageMimeType(mimeType);
    // Create preview URL
    setImagePreview(`data:${mimeType};base64,${data}`);
  };

  const handleImageRemove = () => {
    setImageData(undefined);
    setImageMimeType(undefined);
    setImagePreview(undefined);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift) only when not composing (IME)
    // Check both nativeEvent.isComposing and our ref for Safari compatibility
    if (e.key === 'Enter' && !e.shiftKey) {
      if (e.nativeEvent.isComposing || isComposingRef.current) {
        // Still composing, don't submit
        return;
      }
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleCompositionStart = () => {
    isComposingRef.current = true;
  };

  const handleCompositionEnd = () => {
    // Delay setting to false to ensure Safari processes the composition end
    setTimeout(() => {
      isComposingRef.current = false;
    }, 100);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 w-full"
      aria-label="メッセージ送信フォーム"
    >
      <ImageUpload
        onImageSelect={handleImageSelect}
        onImageRemove={handleImageRemove}
        imagePreview={imagePreview}
        disabled={isLoading}
      />
      <div className="flex gap-2 items-end w-full">
        <div className="flex-1">
          <label htmlFor="message-input" className="sr-only">
            メッセージ
          </label>
          <textarea
            id="message-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            placeholder="メッセージを入力..."
            className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-input bg-background rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all min-h-[56px] sm:min-h-[60px] max-h-[200px] text-base touch-manipulation"
            rows={2}
            disabled={isLoading}
            aria-label="メッセージを入力"
            aria-describedby="message-hint"
            aria-invalid={false}
          />
          <span id="message-hint" className="sr-only">
            Enterキーで送信、Shift+Enterで改行
          </span>
        </div>
        <Button
          type="submit"
          disabled={!input.trim() || isLoading}
          size="lg"
          aria-label={isLoading ? '送信中' : 'メッセージを送信'}
        >
          <span aria-hidden={isLoading}>{isLoading ? '送信中...' : '送信'}</span>
        </Button>
      </div>
    </form>
  );
}
