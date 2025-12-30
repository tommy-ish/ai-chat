'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type { Message, ChatResponse } from '@/types/chat';
import { generateSessionId } from '@/lib/session';

interface ChatContextType {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sessionId: string;
  sendMessage: (content: string) => Promise<void>;
  clearError: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>('');

  // Initialize session ID on mount
  useEffect(() => {
    const storedSessionId = localStorage.getItem('chatSessionId');
    if (storedSessionId) {
      setSessionId(storedSessionId);
      loadHistory(storedSessionId);
    } else {
      const newSessionId = generateSessionId();
      setSessionId(newSessionId);
      localStorage.setItem('chatSessionId', newSessionId);
    }
  }, []);

  // Load conversation history
  const loadHistory = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/chat?sessionId=${sessionId}`);
      if (!response.ok) {
        // If history doesn't exist or can't be loaded, start with empty conversation
        console.log('No existing conversation history, starting fresh');
        setMessages([]);
        return;
      }
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (err) {
      // Log error but don't prevent app from working
      console.log('Could not load conversation history, starting fresh:', err);
      setMessages([]);
    }
  };

  // Send message to API
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      setIsLoading(true);
      setError(null);

      // Optimistically add user message to UI
      const userMessage: Message = {
        id: `temp-${Date.now()}`,
        conversationId: sessionId,
        role: 'user',
        content: content.trim(),
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);

      try {
        console.log('Sending message with sessionId:', sessionId);
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: content.trim(),
            sessionId,
          }),
        });

        if (!response.ok) {
          console.error('API Response not OK. Status:', response.status, response.statusText);
          let errorData;
          try {
            errorData = await response.json();
          } catch (e) {
            console.error('Failed to parse error response as JSON:', e);
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
          }
          console.error('API Error:', errorData);
          throw new Error(errorData.details || errorData.error || 'Failed to send message');
        }

        const data: ChatResponse = await response.json();

        // Add assistant message to UI
        const assistantMessage: Message = {
          id: `temp-assistant-${Date.now()}`,
          conversationId: sessionId,
          role: 'assistant',
          content: data.response,
          createdAt: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'An unexpected error occurred'
        );
        // Remove optimistic user message on error
        setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId, isLoading]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: ChatContextType = {
    messages,
    isLoading,
    error,
    sessionId,
    sendMessage,
    clearError,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
