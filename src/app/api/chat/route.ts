import { NextRequest, NextResponse } from 'next/server';
import { generateResponse } from '@/lib/mastra/agent';
import { validateChatRequest } from '@/lib/validation';
import { prisma } from '@/lib/prisma';
import type { ChatResponse, ErrorResponse } from '@/types/chat';

/**
 * POST /api/chat
 * Send a message and receive an AI response
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const { message, sessionId, imageData, imageMimeType } = validateChatRequest(body);

    // Find or create conversation
    let conversation = await prisma.conversation.findUnique({
      where: { id: sessionId },
      include: { messages: true },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          id: sessionId,
        },
        include: { messages: true },
      });
    }

    // Save user message to database
    await prisma.message.create({
      data: {
        conversationId: sessionId,
        role: 'user',
        content: message,
        imageData,
        imageMimeType,
      },
    });

    // Generate AI response using Mastra with image support
    const aiResponse = await generateResponse(message, imageData, imageMimeType);

    // Save AI response to database
    await prisma.message.create({
      data: {
        conversationId: sessionId,
        role: 'assistant',
        content: aiResponse,
      },
    });

    // Return response
    const response: ChatResponse = {
      response: aiResponse,
      conversationId: sessionId,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Chat API error:', error instanceof Error ? error.message : String(error));

    // Handle validation errors (Zod errors)
    if (error && typeof error === 'object' && 'issues' in error) {
      const zodError = error as { issues: Array<{ message: string; path: string[] }> };
      const errorResponse: ErrorResponse = {
        error: 'Invalid request data',
        details: zodError.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', '),
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Handle Anthropic API errors
    if (error instanceof Error && error.message.includes('ANTHROPIC_API_KEY')) {
      const errorResponse: ErrorResponse = {
        error: 'AI service configuration error',
        details: 'Please check API key configuration',
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    // Handle database errors
    if (error instanceof Error && error.message.includes('Prisma')) {
      const errorResponse: ErrorResponse = {
        error: 'Database error',
        details: 'Failed to save conversation',
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    // Generic error response
    const errorResponse: ErrorResponse = {
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * GET /api/chat?sessionId=xxx
 * Retrieve conversation history for a session
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: sessionId },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json({ messages: [] }, { status: 200 });
    }

    return NextResponse.json(
      {
        conversationId: conversation.id,
        messages: conversation.messages,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('History retrieval error:', error instanceof Error ? error.message : String(error));

    const errorResponse: ErrorResponse = {
      error: 'Failed to retrieve conversation history',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
