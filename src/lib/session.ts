/**
 * Generate a unique session ID (browser-compatible)
 * @returns A UUID v4 string
 */
export function generateSessionId(): string {
  let sessionId: string;

  // Use Web Crypto API if available (modern browsers)
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    sessionId = window.crypto.randomUUID();
  } else {
    // Fallback: Simple UUID v4 generation
    sessionId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  console.log('Generated sessionId:', sessionId);
  return sessionId;
}

/**
 * Validate a session ID format
 * @param sessionId - The session ID to validate
 * @returns True if the session ID is valid UUID format
 */
export function isValidSessionId(sessionId: any): boolean {
  if (typeof sessionId !== 'string') {
    return false;
  }

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(sessionId);
}
