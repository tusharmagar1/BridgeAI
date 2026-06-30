/**
 * Lightweight per-browser identity to separate user sessions.
 * NOTE: This is NOT real authentication. It simply generates a UUID 
 * stored in localStorage so each browser gets its own conversation history.
 */
export function getClientId(): string {
  const key = 'bridgeai-client-id';
  let clientId = localStorage.getItem(key);
  if (!clientId) {
    clientId = crypto.randomUUID();
    localStorage.setItem(key, clientId);
  }
  return clientId;
}
