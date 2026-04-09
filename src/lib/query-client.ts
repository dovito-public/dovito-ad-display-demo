import { QueryClient, type QueryFunction } from "@tanstack/react-query";
import { mockGet, mockMutate } from "./mock-api";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
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
