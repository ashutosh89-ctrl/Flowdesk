/**
 * Sanitize user input to prevent XSS
 * Removes script tags, event handlers, and dangerous javascript: URLs
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';

  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["']?[^"'>]*["']?/gi, '')
    .replace(/javascript:/gi, '')
    .trim();
}

/**
 * Escape HTML entities for browser display
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Validate file extension against allowed types
 */
export function validateFileExtension(filename: string, allowedExtensions: string[]): boolean {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  return allowedExtensions.includes(ext);
}

/**
 * Validate file size (in bytes)
 */
export function validateFileSize(size: number, maxSizeMB: number = 10): boolean {
  return size <= maxSizeMB * 1024 * 1024;
}
