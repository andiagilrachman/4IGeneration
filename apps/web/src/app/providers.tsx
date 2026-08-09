"use client";

/** Client providers — TanStack Query + hydrasi Zustand auth store. */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { hydrateAuth } from "@/store/auth-store";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, refetchOnWindowFocus: false },
        },
      }),
  );

  // hydrasi auth sekali saat mount
  useState(() => {
    hydrateAuth();
  });

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
