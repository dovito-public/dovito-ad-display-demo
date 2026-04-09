"use client";

import { mockGet, mockMutate } from "./mock-api";

let installed = false;

export function installFetchInterceptor() {
  if (installed) return;
  if (typeof window === "undefined") return;
  installed = true;

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    let url: string;
    if (typeof input === "string") url = input;
    else if (input instanceof URL) url = input.toString();
    else url = (input as Request).url;

    // Only intercept /api/* calls (both absolute-origin and relative)
    let path = url;
    try {
      if (url.startsWith("http://") || url.startsWith("https://")) {
        const u = new URL(url);
        path = u.pathname + u.search;
      }
    } catch {}

    if (!path.startsWith("/api/")) {
      return originalFetch(input as RequestInfo, init);
    }

    const method = (init?.method || "GET").toUpperCase();
    let data: unknown = undefined;
    if (init?.body) {
      if (typeof init.body === "string") {
        try {
          data = JSON.parse(init.body);
        } catch {
          data = init.body;
        }
      } else if (init.body instanceof FormData) {
        const obj: Record<string, unknown> = {};
        (init.body as FormData).forEach((v, k) => {
          obj[k] = typeof v === "string" ? v : (v as File).name;
        });
        data = obj;
      }
    }

    let body: unknown;
    if (method === "GET") {
      body = await mockGet(path);
    } else {
      body = await mockMutate(method, path, data);
    }

    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };
}
