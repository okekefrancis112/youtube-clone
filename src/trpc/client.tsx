'use client';
import type { QueryClient } from '@tanstack/react-query';
import superjson from 'superjson';
import { QueryClientProvider } from '@tanstack/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import { useState } from 'react';
import { makeQueryClient } from './query-client';
import type { AppRouter } from './routers/_app';
import { APP_URL } from '@/constants';
export const trpc = createTRPCReact<AppRouter>();
let clientQueryClientSingleton: QueryClient;
function getQueryClient() {
  if (typeof window === 'undefined') {
    return makeQueryClient();
  }
  if (!clientQueryClientSingleton) clientQueryClientSingleton = makeQueryClient();
  return clientQueryClientSingleton;
}
function getUrl() {
  const base = (() => {
    if (typeof window !== 'undefined') return '';
    return APP_URL;
  })();
  return `${base}/api/trpc`;
}

export function TRPCProvider(
  props: Readonly<{
    children: React.ReactNode;
  }>,
) {
  const queryClient = getQueryClient();
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          transformer: superjson,
          url: getUrl(),
          fetch(url, opts) {
            return fetch(url, {
              ...opts,
              credentials: "include",
            } as RequestInit);
          },
          async headers() {
            const headers = new Headers();
            headers.set('x-trpc-source', 'nextjs-react');
            return headers;
          },
        }),
      ],
    }),
  );
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
            {props.children}
        </QueryClientProvider>
    </trpc.Provider>
  );
}