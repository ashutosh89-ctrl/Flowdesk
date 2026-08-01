/**
 * Decode the payload of a JWT (client-side). Used to extract user info from
 * the OAuth `#access_token` fragment returned by Supabase's implicit flow.
 * NOTE: this only decodes — it does NOT verify the token signature.
 */
export function decodeJwtPayload(token: string): any {
  const base64Url = token.split('.')[1];
  if (!base64Url) throw new Error('Malformed access token');
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  return JSON.parse(jsonPayload);
}
