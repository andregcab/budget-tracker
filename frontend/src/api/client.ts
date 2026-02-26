const API_BASE = "/api";

function getToken(): string | null {
  return localStorage.getItem("token");
}

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const text = await res.text();
    let message = text;
    try {
      const j = JSON.parse(text) as { message?: string; error?: string };
      message = j.message || j.error || text;
    } catch (error) {
      // ignore JSON parse errors and fall back to raw text
      void error;
    }
    throw new Error(message || `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export async function apiUpload<T>(
  path: string,
  formData: FormData,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {};
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    method: "POST",
    body: formData,
    headers,
  });
  if (!res.ok) {
    const text = await res.text();
    let message = text;
    try {
      const j = JSON.parse(text) as { message?: string; error?: string };
      message = j.message || j.error || text;
    } catch (error) {
      // ignore JSON parse errors and fall back to raw text
      void error;
    }
    throw new Error(message || `HTTP ${res.status}`);
  }
  return res.json();
}
