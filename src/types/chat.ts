// Type definitions for chat functionality

export type MessageRole = 'user' | 'assistant';

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  imageData?: string;      // Base64 encoded image data
  imageMimeType?: string;  // MIME type (image/jpeg, image/png, etc.)
  createdAt: Date;
}

export interface Conversation {
  id: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

// API request/response types
export interface ChatRequest {
  message: string;
  sessionId: string;
  imageData?: string;      // Base64 encoded image data
  imageMimeType?: string;  // MIME type for the image
}

export interface ChatResponse {
  response: string;
  conversationId: string;
}

export interface ErrorResponse {
  error: string;
  details?: string;
}
