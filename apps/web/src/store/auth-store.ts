/** 4IGeneration Web — Auth store (Zustand)
 *  Menyimpan user + token, tersinkron dengan localStorage & cookie.
 */

import { create } from "zustand";
import { apiFetch, clearTokens, setTokens, getAccessToken } from "@/lib/api";

export interface User {
  id: string;
  email: string;
  name?: string | null;
  role: string;
  status: string;
  createdAt: string;
  profile?: { fullName?: string | null; avatarUrl?: string | null } | null;
}

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface AuthState {
  user: User | null;
  isHydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isHydrated: false,

  login: async (email, password) => {
    const data = await apiFetch<AuthResponse>("/auth/login", {
      method: "POST",
      body: { email, password },
      auth: false,
    });
    setTokens(data.accessToken, data.refreshToken);
    set({ user: data.user });
  },

  register: async (email, password, name) => {
    const data = await apiFetch<AuthResponse>("/auth/register", {
      method: "POST",
      body: { email, password, name },
      auth: false,
    });
    setTokens(data.accessToken, data.refreshToken);
    set({ user: data.user });
  },

  logout: async () => {
    const refreshToken = typeof window !== "undefined" ? window.localStorage.getItem("4ig_refresh_token") : null;
    try {
      if (refreshToken) {
        await apiFetch("/auth/logout", { method: "POST", body: { refreshToken }, auth: false });
      }
    } catch {
      // tetap lanjut logout lokal walau server error
    }
    clearTokens();
    set({ user: null });
  },

  fetchMe: async () => {
    if (!getAccessToken()) {
      set({ isHydrated: true });
      return;
    }
    try {
      const user = await apiFetch<User>("/auth/me");
      set({ user, isHydrated: true });
    } catch {
      clearTokens();
      set({ user: null, isHydrated: true });
    }
  },

  clear: () => {
    clearTokens();
    set({ user: null, isHydrated: true });
  },
}));

/** Hydrasi store saat app dimuat (panggil sekali di client providers). */
export function hydrateAuth() {
  void useAuthStore.getState().fetchMe();
}
