/** Admin Panel — API client (NestJS /api/v1). */

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api/v1";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function getToken(): string | null {
  return localStorage.getItem("4ig_admin_token");
}

export function setToken(token: string) {
  localStorage.setItem("4ig_admin_token", token);
}

export function clearToken() {
  localStorage.removeItem("4ig_admin_token");
}

export async function api<T>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const { method = "GET", body } = options;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const json = (await res.json().catch(() => null)) as {
    success: boolean;
    data: T;
    error?: { message: string };
  } | null;

  if (!res.ok || !json || json.success === false) {
    throw new ApiError(res.status, json?.error?.message ?? `HTTP ${res.status}`);
  }
  return json.data;
}

export async function loginAdmin(email: string, password: string) {
  const data = await api<{ accessToken: string; user: { role: string } }>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
  if (data.user.role !== "ADMIN" && data.user.role !== "SUPER_ADMIN") {
    throw new ApiError(403, "Akun bukan admin");
  }
  setToken(data.accessToken);
  return data.user;
}

export async function logoutAdmin() {
  clearToken();
}
