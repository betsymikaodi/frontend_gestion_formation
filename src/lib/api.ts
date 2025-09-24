export const API_BASE = import.meta.env.VITE_API_BASE?.toString() || http://localhost:8080/api;

export function getToken(): string | null {
  return localStorage.getItem(token);
}

export async function apiFetch(input: string, init: RequestInit = {}) {
  const token = getToken();
  const headers = new Headers(init.headers || {});
  if (!headers.has(Content-Type) && init.method && init.method !== GET) {
    headers.set(Content-Type, application/json);
  }
  if (token) {
    headers.set(Authorization, `Bearer ${token}`);
  }
  const res = await fetch(`${API_BASE}${input}`, { ...init, headers });
  return res;
}
