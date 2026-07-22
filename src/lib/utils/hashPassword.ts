/**
 * Client-safe cryptographic password hashing mock.
 * Uses a basic salt + string conversion to simulate solid hashing signatures
 * that can be easily ported.
 */
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = Math.random().toString(36).substring(2, 10);
  // Simple deterministic but opaque transformation
  const hash = simpleHash(password + salt);
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  return simpleHash(password + salt) === hash;
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}
