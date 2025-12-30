import { Agent } from '@mastra/core/agent';

/**
 * Mastra agent configured with Claude 3.5 Sonnet
 * Requires ANTHROPIC_API_KEY environment variable
 */
export const chatAgent = new Agent({
  id: 'ai-chat-assistant',
  name: 'AI Chat Assistant',
  instructions:
    'You are a helpful, knowledgeable, and friendly AI assistant. Provide clear, accurate, and engaging responses to user questions. Be conversational and approachable while maintaining professionalism.',
  model: 'anthropic/claude-3-7-sonnet-latest',
});

/**
 * Generate a response from the agent
 * @param message - User message
 * @returns AI-generated response text
 */
export async function generateResponse(message: string): Promise<string> {
  const response = await chatAgent.generate(message);
  // Mastra's generate() returns an object with a .text property
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
