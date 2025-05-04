import type { NavigateOptions } from 'react-router-dom';

import { HeroUIProvider } from '@heroui/system';
import { ToastProvider } from '@heroui/react';
import { useHref, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

declare module '@react-types/shared' {
  interface RouterConfig {
    routerOptions: NavigateOptions;
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export function Provider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  return (
    <QueryClientProvider client={queryClient}>
      <HeroUIProvider navigate={navigate} useHref={useHref}>
        <ToastProvider />
        {children}
      </HeroUIProvider>
    </QueryClientProvider>
  );
}
