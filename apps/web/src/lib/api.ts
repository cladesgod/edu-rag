export function getApiBase(): string {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const proto = window.location.protocol;
    const env = process.env.NEXT_PUBLIC_API_URL;
    if (env && env.length > 0) return env;
    return `${proto}//${host}:8000`;
  }
  // Fallback for server-side (dev)
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
}


