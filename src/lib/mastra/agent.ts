import { Agent } from '@mastra/core/agent';

/**
 * Mastra agent configured with Claude 3.5 Sonnet
 * Requires ANTHROPIC_API_KEY environment variable
 */
export const chatAgent = new Agent({
  id: 'ai-chat-assistant',
  name: 'AI Chat Assistant',
  instructions:
    'You are a helpful, knowledgeable, and friendly AI assistant. Provide clear, accurate, and engaging responses to user questions. Be conversational and approachable while maintaining professionalism. When analyzing images, provide detailed and accurate descriptions.',
  model: 'anthropic/claude-3-7-sonnet-latest',
});

/**
 * Generate a response from the agent
 * @param message - User message
 * @param imageData - Optional base64 encoded image data
 * @param imageMimeType - Optional MIME type of the image
 * @returns AI-generated response text
 */
export async function generateResponse(
  message: string,
  imageData?: string,
  imageMimeType?: string
): Promise<string> {
  // If image is provided, format the message for vision
  if (imageData && imageMimeType) {
    const response = await chatAgent.generate([
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: imageMimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
              data: imageData,
            },
          },
          {
            type: 'text',
            text: message,
          },
        ],
      },
    ]);
    return response.text || '';
  }

  // Regular text-only message
  const response = await chatAgent.generate(message);
  return response.text || '';
}

/**
 * Stream a response from the agent
 * @param message - User message
 * @returns AsyncIterable stream of response chunks
 */
export async function streamResponse(message: string) {
  const stream = await chatAgent.stream(message);
  return stream;
}
