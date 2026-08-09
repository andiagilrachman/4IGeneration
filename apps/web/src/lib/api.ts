/** 4IGeneration Web — API client
 *  Wrapper fetch ke NestJS API dengan format respons standar blueprint BAGIAN 8:
 *  { success, data/error, meta }
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

export interface ApiMeta {
  timestamp: string;
  request_id: string;
}

export interface ApiErrorBody {
  code: string;
  message: string;
  details?: unknown;
}

export class ApiClientError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, body: ApiErrorBody) {
    super(body.message ?? "Request gagal");
    this.status = status;
    this.code = body.code ?? "UNKNOWN_ERROR";
    this.details = body.details;
  }
}

/** Ambil access token dari localStorage (client-side only). */
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem("4ig_access_token");
  } catch {
    return null;
  }
}

function setTokens(access: string, refresh: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("4ig_access_token", access);
  window.localStorage.setItem("4ig_refresh_token", refresh);
  // cookie untuk middleware route protection (tanpa httpOnly agar terbaca client)
  document.cookie = "4ig_auth=1; path=/; max-age=604800; samesite=lax";
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem("4ig_access_token");
  window.localStorage.removeItem("4ig_refresh_token");
  document.cookie = "4ig_auth=; path=/; max-age=0";
}

export async function apiFetch<T>(
  path: string,
  options: { method?: string; body?: unknown; auth?: boolean } = {},
): Promise<T> {
  const { method = "GET", body, auth = true } = options;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = auth ? getAccessToken() : null;
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const json = (await res.json().catch(() => null)) as
    | { success: true; data: T }
    | { success: false; error: ApiErrorBody }
    | null;

  if (!res.ok || !json || json.success === false) {
    const errBody: ApiErrorBody =
      json && "error" in json ? json.error : { code: "HTTP_ERROR", message: `HTTP ${res.status}` };
    throw new ApiClientError(res.status, errBody);
  }
  return json.data;
}

export { setTokens, API_URL };
