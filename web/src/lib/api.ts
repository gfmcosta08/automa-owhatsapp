export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function fetcher<T>(url: string): Promise<T> {
  const r = await fetch(url, { credentials: 'include' });
  if (!r.ok) throw new Error(await r.text());
  if (r.status === 204) return undefined as T;
  const text = await r.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}
