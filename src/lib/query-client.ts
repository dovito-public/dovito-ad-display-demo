import { QueryClient, type QueryFunction } from "@tanstack/react-query";
import { mockGet, mockMutate } from "./mock-api";

// Default queryFn: any useQuery call whose queryKey[0] starts with "/api/"
// gets routed through the in-process mock API. Components that want to call
// fetch() directly can still provide their own queryFn — the fetch
// interceptor in mock-fetch.ts handles those paths too.
const defaultQueryFn: QueryFunction = async ({ queryKey }) => {
  const url = queryKey[0] as string;
  return (await mockGet(url)) as unknown;
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn,
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | FormData | undefined
): Promise<Response> {
  // FormData files aren't meaningfully handled in demo mode; pass through as plain object.
  let payload: unknown = data;
  if (data instanceof FormData) {
    const obj: Record<string, unknown> = {};
    data.forEach((v, k) => {
      obj[k] = typeof v === "string" ? v : (v as File).name;
    });
    payload = obj;
  }
  const body = await mockMutate(method, url, payload);
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  () =>
  async ({ queryKey }) => {
    const url = queryKey[0] as string;
    return (await mockGet(url)) as unknown as Awaited<ReturnType<QueryFunction<unknown>>> as never;
  };
