export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/** URL do painel Express `/admin` (mesma origem da API). */
export function getAdminPanelUrl(): string {
  try {
    return new URL(API_BASE).origin + '/admin/';
  } catch {
    return '/admin/';
  }
}

export async function fetcher<T>(url: string): Promise<T> {
  const r = await fetch(url, { credentials: 'include' });
  if (!r.ok) throw new Error(await r.text());
  if (r.status === 204) return undefined as T;
  const text = await r.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}
