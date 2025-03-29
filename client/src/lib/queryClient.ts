import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

type APIMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export async function apiRequest(
  method: APIMethod,
  url: string,
  body?: any,
  options?: RequestInit
) {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options?.headers || {}),
  };

  const config: RequestInit = {
    method,
    headers,
    ...options,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || response.statusText);
  }

  return response;
}

interface QueryFnOptions {
  on401?: "throw" | "returnNull";
}

export function getQueryFn(options: QueryFnOptions = {}) {
  return async ({ queryKey }: { queryKey: string[] }) => {
    const [url] = queryKey;
    try {
      const response = await fetch(url);

      if (response.status === 401) {
        if (options.on401 === "returnNull") {
          return null;
        }
        throw new Error("Unauthorized");
      }

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }
  };
}