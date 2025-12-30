import { z } from 'zod';

/**
 * Schema for validating chat message requests
 */
export const chatRequestSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, 'Message cannot be empty')
    .max(5000, 'Message is too long (max 5000 characters)'),
  sessionId: z
    .string()
    .min(1, 'Session ID is required')
    .regex(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      'Invalid session ID format'
    ),
});

/**
 * Type for validated chat request
 */
export type ChatRequestInput = z.infer<typeof chatRequestSchema>;

/**
 * Validate chat request data
 * @param data - Request data to validate
 * @returns Validated data or throws error
 */
export function validateChatRequest(data: unknown): ChatRequestInput {
  return chatRequestSchema.parse(data);
}
