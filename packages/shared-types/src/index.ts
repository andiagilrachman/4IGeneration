/** 4IGeneration — shared types (dipakai web, api, admin). */

// ---------- Response format standar (BAGIAN 8 blueprint) ----------

export interface ApiMeta {
  timestamp: string;
  request_id: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: ApiMeta;
}

export interface Pagination {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: Pagination;
  meta?: ApiMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ErrorResponse {
  success: false;
  error: ApiError;
  meta?: ApiMeta;
}

// ---------- Model dasar ----------

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  PENDING_VERIFICATION = "PENDING_VERIFICATION",
  DELETED = "DELETED",
}

export interface User {
  id: string;
  email: string;
  name?: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}

export interface ProviderStatus {
  name: string;
  priority: number;
  weight: number;
  healthy: boolean;
  failures: number;
  avg_response_ms: number;
  hits: number;
}

export interface AIResult {
  provider: string;
  model: string;
  model_alias: string;
  content: string;
  response_time_ms: number;
}
