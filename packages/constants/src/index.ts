/** 4IGeneration — konstanta global (no hardcode tersebar). */

export const APP_NAME = "4IGeneration";
export const APP_SHORT_NAME = "4IG";

// Model family (BAGIAN 2 blueprint)
export const MODEL_ALIASES = {
  SMALL: "4IG-Small",
  MEDIUM: "4IG-Medium",
  PRO: "4IG-Pro",
  FINANCE: "4IG-Finance",
} as const;

// AI providers default (BAGIAN 10) — prioritas & weight
export const DEFAULT_PROVIDERS = [
  { slug: "gemini", priority: 1, weight: 40 },
  { slug: "groq", priority: 2, weight: 40 },
  { slug: "mistral", priority: 3, weight: 15 },
  { slug: "openrouter", priority: 4, weight: 5 },
] as const;

// Port per service (BAGIAN 14)
export const PORTS = {
  web: 3000,
  api: 3001,
  admin: 3002,
  aiService: 8000,
  mysql: 3306,
  redis: 6379,
} as const;

// Timezone default
export const DEFAULT_TIMEZONE = "Asia/Makassar";

// Rate limit default (free tier)
export const FREE_TIER = {
  requestsPerDay: 50,
  requestsPerMinute: 5,
} as const;
