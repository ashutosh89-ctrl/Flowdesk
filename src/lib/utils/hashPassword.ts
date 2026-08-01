import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

/**
 * Hashes a plaintext password securely using bcrypt with 12 salt rounds.
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Synchronous version for initial state seeding or fast hashing.
 */
export function hashPasswordSync(password: string): string {
  return bcrypt.hashSync(password, SALT_ROUNDS);
}

/**
 * Verifies a plaintext password against a bcrypt hashed password.
 * Supports legacy fallback migration if needed.
 */
export async function verifyPassword(password: string, hashedPassword?: string): Promise<boolean> {
  if (!hashedPassword) return false;

  try {
    // Standard bcrypt verification
    const isValid = await bcrypt.compare(password, hashedPassword);
    if (isValid) return true;
  } catch (e) {
    // If hashedPassword is not a valid bcrypt hash, check legacy simpleHash
  }

  // Legacy fallback check during migration
  const legacyHash = fnvLegacyHash(password);
  return legacyHash === hashedPassword || hashedPassword.includes(legacyHash);
}

function fnvLegacyHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}
