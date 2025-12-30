import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock functions - must be declared before vi.mock calls
const mockConversationFindUnique = vi.fn();
const mockConversationCreate = vi.fn();
const mockMessageCreate = vi.fn();
const mockGenerateResponse = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    conversation: {
      findUnique: (...args: any[]) => mockConversationFindUnique(...args),
      create: (...args: any[]) => mockConversationCreate(...args),
    },
    message: {
      create: (...args: any[]) => mockMessageCreate(...args),
    },
  },
}));

vi.mock('@/lib/mastra/agent', () => ({
  generateResponse: (...args: any[]) => mockGenerateResponse(...args),
}));

// Import after mocks are set up
import { POST, GET } from '../route';

describe('Chat API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/chat', () => {
    const validSessionId = '550e8400-e29b-41d4-a716-446655440000';

    it('should handle a valid chat request successfully', async () => {
      const requestBody = {
        message: 'Hello, AI!',
        sessionId: validSessionId,
      };

      // Mock existing conversation
      const mockConversation = {
        id: validSessionId,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockConversationFindUnique.mockResolvedValue(mockConversation);
      mockMessageCreate.mockResolvedValue({
        id: 'msg-1',
        conversationId: validSessionId,
        role: 'user',
        content: 'Hello, AI!',
        createdAt: new Date(),
      });
      mockGenerateResponse.mockResolvedValue('Hello! How can I help you?');

      const request = new NextRequest('http://localhost/api/chat', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.response).toBe('Hello! How can I help you?');
      expect(data.conversationId).toBe(validSessionId);
      expect(mockConversationFindUnique).toHaveBeenCalledWith({
        where: { id: validSessionId },
        include: { messages: true },
      });
      expect(mockMessageCreate).toHaveBeenCalledTimes(2); // User message + AI response
      expect(mockGenerateResponse).toHaveBeenCalledWith('Hello, AI!');
    });

    it('should create a new conversation if it does not exist', async () => {
      const requestBody = {
        message: 'First message',
        sessionId: validSessionId,
      };

      const mockNewConversation = {
        id: validSessionId,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // First call returns null (no existing conversation)
      mockConversationFindUnique.mockResolvedValue(null);
      // Create call returns new conversation
      mockConversationCreate.mockResolvedValue(mockNewConversation);
      mockMessageCreate.mockResolvedValue({
        id: 'msg-1',
        conversationId: validSessionId,
        role: 'user',
        content: 'First message',
        createdAt: new Date(),
      });
      mockGenerateResponse.mockResolvedValue('This is my first response');

      const request = new NextRequest('http://localhost/api/chat', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(mockConversationCreate).toHaveBeenCalledWith({
        data: { id: validSessionId },
        include: { messages: true },
      });
      expect(data.response).toBe('This is my first response');
    });

    it('should save both user and AI messages to database', async () => {
      const requestBody = {
        message: 'Test message',
        sessionId: validSessionId,
      };

      mockConversationFindUnique.mockResolvedValue({
        id: validSessionId,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockMessageCreate.mockResolvedValue({
        id: 'msg-1',
        conversationId: validSessionId,
        role: 'user',
        content: 'Test message',
        createdAt: new Date(),
      });
      mockGenerateResponse.mockResolvedValue('AI response');

      const request = new NextRequest('http://localhost/api/chat', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      await POST(request);

      // Check user message save
      expect(mockMessageCreate).toHaveBeenNthCalledWith(1, {
        data: {
          conversationId: validSessionId,
          role: 'user',
          content: 'Test message',
        },
      });

      // Check AI message save
      expect(mockMessageCreate).toHaveBeenNthCalledWith(2, {
        data: {
          conversationId: validSessionId,
          role: 'assistant',
          content: 'AI response',
        },
      });
    });

    describe('validation errors', () => {
      it('should return 400 for empty message', async () => {
        const requestBody = {
          message: '',
          sessionId: validSessionId,
        };

        const request = new NextRequest('http://localhost/api/chat', {
          method: 'POST',
          body: JSON.stringify(requestBody),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Invalid request data');
        expect(data.details).toContain('message');
      });

      it('should return 400 for message longer than 5000 characters', async () => {
        const requestBody = {
          message: 'A'.repeat(5001),
          sessionId: validSessionId,
        };

        const request = new NextRequest('http://localhost/api/chat', {
          method: 'POST',
          body: JSON.stringify(requestBody),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Invalid request data');
      });

      it('should return 400 for invalid sessionId format', async () => {
        const requestBody = {
          message: 'Hello',
          sessionId: 'not-a-valid-uuid',
        };

        const request = new NextRequest('http://localhost/api/chat', {
          method: 'POST',
          body: JSON.stringify(requestBody),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Invalid request data');
        expect(data.details).toContain('sessionId');
      });

      it('should return 400 for missing message field', async () => {
        const requestBody = {
          sessionId: validSessionId,
        };

        const request = new NextRequest('http://localhost/api/chat', {
          method: 'POST',
          body: JSON.stringify(requestBody),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Invalid request data');
      });

      it('should return 400 for missing sessionId field', async () => {
        const requestBody = {
          message: 'Hello',
        };

        const request = new NextRequest('http://localhost/api/chat', {
          method: 'POST',
          body: JSON.stringify(requestBody),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Invalid request data');
      });

      it('should return 400 for whitespace-only message', async () => {
        const requestBody = {
          message: '   ',
          sessionId: validSessionId,
        };

        const request = new NextRequest('http://localhost/api/chat', {
          method: 'POST',
          body: JSON.stringify(requestBody),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Invalid request data');
      });
    });

    describe('error handling', () => {
      it('should handle Anthropic API key errors', async () => {
        const requestBody = {
          message: 'Hello',
          sessionId: validSessionId,
        };

        mockConversationFindUnique.mockResolvedValue({
          id: validSessionId,
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        mockMessageCreate.mockResolvedValue({
          id: 'msg-1',
          conversationId: validSessionId,
          role: 'user',
          content: 'Hello',
          createdAt: new Date(),
        });
        mockGenerateResponse.mockRejectedValue(
          new Error('ANTHROPIC_API_KEY is not set')
        );

        const request = new NextRequest('http://localhost/api/chat', {
          method: 'POST',
          body: JSON.stringify(requestBody),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('AI service configuration error');
        expect(data.details).toBe('Please check API key configuration');
      });

      it('should handle database errors', async () => {
        const requestBody = {
          message: 'Hello',
          sessionId: validSessionId,
        };

        mockConversationFindUnique.mockRejectedValue(
          new Error('Prisma Client failed to connect')
        );

        const request = new NextRequest('http://localhost/api/chat', {
          method: 'POST',
          body: JSON.stringify(requestBody),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('Database error');
        expect(data.details).toBe('Failed to save conversation');
      });

      it('should handle generic errors', async () => {
        const requestBody = {
          message: 'Hello',
          sessionId: validSessionId,
        };

        mockConversationFindUnique.mockRejectedValue(
          new Error('Some unexpected error')
        );

        const request = new NextRequest('http://localhost/api/chat', {
          method: 'POST',
          body: JSON.stringify(requestBody),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('Internal server error');
        expect(data.details).toBe('Some unexpected error');
      });
    });
  });

  describe('GET /api/chat', () => {
    const validSessionId = '550e8400-e29b-41d4-a716-446655440000';

    it('should retrieve conversation history successfully', async () => {
      const mockMessages = [
        {
          id: 'msg-1',
          conversationId: validSessionId,
          role: 'user',
          content: 'Hello',
          createdAt: new Date('2024-01-01T10:00:00'),
        },
        {
          id: 'msg-2',
          conversationId: validSessionId,
          role: 'assistant',
          content: 'Hi there!',
          createdAt: new Date('2024-01-01T10:00:01'),
        },
      ];

      const mockConversation = {
        id: validSessionId,
        messages: mockMessages,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockConversationFindUnique.mockResolvedValue(mockConversation);

      const request = new NextRequest(
        `http://localhost/api/chat?sessionId=${validSessionId}`,
        { method: 'GET' }
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.conversationId).toBe(validSessionId);
      expect(data.messages).toHaveLength(2);
      expect(data.messages[0].content).toBe('Hello');
      expect(data.messages[1].content).toBe('Hi there!');
      expect(mockConversationFindUnique).toHaveBeenCalledWith({
        where: { id: validSessionId },
        include: {
          messages: {
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      });
    });

    it('should return empty messages array for non-existent conversation', async () => {
      mockConversationFindUnique.mockResolvedValue(null);

      const request = new NextRequest(
        `http://localhost/api/chat?sessionId=${validSessionId}`,
        { method: 'GET' }
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.messages).toEqual([]);
    });

    it('should return 400 when sessionId is missing', async () => {
      const request = new NextRequest('http://localhost/api/chat', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Session ID is required');
    });

    it('should handle database errors when retrieving history', async () => {
      mockConversationFindUnique.mockRejectedValue(
        new Error('Database connection failed')
      );

      const request = new NextRequest(
        `http://localhost/api/chat?sessionId=${validSessionId}`,
        { method: 'GET' }
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to retrieve conversation history');
      expect(data.details).toBe('Database connection failed');
    });

    it('should order messages by createdAt in ascending order', async () => {
      const mockMessages = [
        {
          id: 'msg-1',
          conversationId: validSessionId,
          role: 'user',
          content: 'First message',
          createdAt: new Date('2024-01-01T10:00:00'),
        },
        {
          id: 'msg-2',
          conversationId: validSessionId,
          role: 'assistant',
          content: 'Second message',
          createdAt: new Date('2024-01-01T10:00:01'),
        },
        {
          id: 'msg-3',
          conversationId: validSessionId,
          role: 'user',
          content: 'Third message',
          createdAt: new Date('2024-01-01T10:00:02'),
        },
      ];

      const mockConversation = {
        id: validSessionId,
        messages: mockMessages,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockConversationFindUnique.mockResolvedValue(mockConversation);

      const request = new NextRequest(
        `http://localhost/api/chat?sessionId=${validSessionId}`,
        { method: 'GET' }
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.messages).toHaveLength(3);
      expect(data.messages[0].content).toBe('First message');
      expect(data.messages[1].content).toBe('Second message');
      expect(data.messages[2].content).toBe('Third message');
    });
  });

  describe('invalid JSON handling', () => {
    it('should handle invalid JSON in POST request', async () => {
      const request = new NextRequest('http://localhost/api/chat', {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });
  });
});
