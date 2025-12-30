import { describe, it, expect } from 'vitest';
import { chatRequestSchema } from '../validation';
import { ZodError } from 'zod';

describe('validation', () => {
  describe('chatRequestSchema', () => {
    describe('valid inputs', () => {
      it('should validate a correct chat request', () => {
        const validRequest = {
          message: 'Hello, how are you?',
          sessionId: '550e8400-e29b-41d4-a716-446655440000',
        };

        const result = chatRequestSchema.parse(validRequest);

        expect(result).toEqual(validRequest);
        expect(result.message).toBe('Hello, how are you?');
        expect(result.sessionId).toBe('550e8400-e29b-41d4-a716-446655440000');
      });

      it('should validate messages of various lengths', () => {
        const validLengths = [
          'a', // minimum 1 character
          'Short message',
          'Medium length message with some more content',
          'A'.repeat(1000), // 1000 characters
          'A'.repeat(5000), // exactly max length
        ];

        validLengths.forEach(message => {
          const request = {
            message,
            sessionId: '550e8400-e29b-41d4-a716-446655440000',
          };

          expect(() => chatRequestSchema.parse(request)).not.toThrow();
        });
      });

      it('should accept UUID in any case', () => {
        const requests = [
          {
            message: 'test',
            sessionId: '550e8400-e29b-41d4-a716-446655440000', // lowercase
          },
          {
            message: 'test',
            sessionId: '550E8400-E29B-41D4-A716-446655440000', // uppercase
          },
          {
            message: 'test',
            sessionId: '550e8400-E29B-41d4-A716-446655440000', // mixed case
          },
        ];

        requests.forEach(request => {
          expect(() => chatRequestSchema.parse(request)).not.toThrow();
        });
      });
    });

    describe('invalid message', () => {
      it('should reject empty message', () => {
        const request = {
          message: '',
          sessionId: '550e8400-e29b-41d4-a716-446655440000',
        };

        expect(() => chatRequestSchema.parse(request)).toThrow(ZodError);

        try {
          chatRequestSchema.parse(request);
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          if (error instanceof ZodError) {
            const messageError = error.issues.find(i => i.path.includes('message'));
            expect(messageError).toBeDefined();
            expect(messageError?.message).toContain('cannot be empty');
          }
        }
      });

      it('should reject message longer than 5000 characters', () => {
        const request = {
          message: 'A'.repeat(5001),
          sessionId: '550e8400-e29b-41d4-a716-446655440000',
        };

        expect(() => chatRequestSchema.parse(request)).toThrow(ZodError);

        try {
          chatRequestSchema.parse(request);
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          if (error instanceof ZodError) {
            const messageError = error.issues.find(i => i.path.includes('message'));
            expect(messageError).toBeDefined();
            expect(messageError?.message).toContain('too long');
          }
        }
      });

      it('should reject whitespace-only message', () => {
        const whitespaceMessages = ['   ', '\n', '\t', '  \n  \t  '];

        whitespaceMessages.forEach(message => {
          const request = {
            message,
            sessionId: '550e8400-e29b-41d4-a716-446655440000',
          };

          // After trimming, these would be empty
          expect(() => chatRequestSchema.parse(request)).toThrow();
        });
      });

      it('should reject missing message field', () => {
        const request = {
          sessionId: '550e8400-e29b-41d4-a716-446655440000',
        };

        // @ts-expect-error - Testing missing field
        expect(() => chatRequestSchema.parse(request)).toThrow(ZodError);
      });
    });

    describe('invalid sessionId', () => {
      it('should reject invalid UUID format', () => {
        const invalidSessionIds = [
          'not-a-uuid',
          '123',
          '550e8400-e29b-41d4-a716', // incomplete
          '550e8400e29b41d4a716446655440000', // missing dashes
          'g50e8400-e29b-41d4-a716-446655440000', // invalid character
        ];

        invalidSessionIds.forEach(sessionId => {
          const request = {
            message: 'test',
            sessionId,
          };

          expect(() => chatRequestSchema.parse(request)).toThrow(ZodError);
        });
      });

      it('should reject empty sessionId', () => {
        const request = {
          message: 'test',
          sessionId: '',
        };

        expect(() => chatRequestSchema.parse(request)).toThrow(ZodError);

        try {
          chatRequestSchema.parse(request);
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          if (error instanceof ZodError) {
            const sessionError = error.issues.find(i => i.path.includes('sessionId'));
            expect(sessionError).toBeDefined();
          }
        }
      });

      it('should reject missing sessionId field', () => {
        const request = {
          message: 'test',
        };

        // @ts-expect-error - Testing missing field
        expect(() => chatRequestSchema.parse(request)).toThrow(ZodError);
      });
    });

    describe('edge cases', () => {
      it('should reject completely empty object', () => {
        // @ts-expect-error - Testing invalid input
        expect(() => chatRequestSchema.parse({})).toThrow(ZodError);
      });

      it('should reject null', () => {
        // @ts-expect-error - Testing invalid input
        expect(() => chatRequestSchema.parse(null)).toThrow();
      });

      it('should reject array', () => {
        // @ts-expect-error - Testing invalid input
        expect(() => chatRequestSchema.parse([])).toThrow();
      });

      it('should reject additional unexpected fields', () => {
        const request = {
          message: 'test',
          sessionId: '550e8400-e29b-41d4-a716-446655440000',
          extraField: 'should be ignored or rejected',
        };

        // Zod by default strips unknown keys, so this should pass
        // but we verify the extra field is not in the result
        const result = chatRequestSchema.parse(request);
        expect(result).not.toHaveProperty('extraField');
      });
    });
  });
});
