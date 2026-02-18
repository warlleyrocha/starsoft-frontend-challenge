import { QueryClient } from "@tanstack/react-query";
import { makeQueryClient } from "@/shared/lib/react-query/queryClient";

type RetryFn = (failureCount: number, error: unknown) => boolean;

function getRetryFn(client: QueryClient): RetryFn {
  const retry = client.getDefaultOptions().queries?.retry;

  if (typeof retry !== "function") {
    throw new Error("Expected query retry option to be a function");
  }

  return retry as RetryFn;
}

describe("makeQueryClient", () => {
  it("creates a QueryClient with expected default query and mutation options", () => {
    const client = makeQueryClient();
    const defaults = client.getDefaultOptions();

    expect(defaults.queries?.refetchOnWindowFocus).toBe(false);
    expect(defaults.queries?.refetchOnReconnect).toBe(true);
    expect(defaults.queries?.staleTime).toBe(1000 * 30);
    expect(defaults.queries?.gcTime).toBe(1000 * 60 * 5);
    expect(defaults.mutations?.retry).toBe(0);
  });

  it("does not retry for HTTP 4xx errors", () => {
    const retry = getRetryFn(makeQueryClient());

    expect(retry(0, new Error("HTTP 404: Not Found"))).toBe(false);
    expect(retry(1, new Error("HTTP 400: Bad Request"))).toBe(false);
  });

  it("retries up to two attempts for non-4xx errors", () => {
    const retry = getRetryFn(makeQueryClient());

    expect(retry(0, new Error("HTTP 500: Internal Server Error"))).toBe(true);
    expect(retry(1, new Error("Network timeout"))).toBe(true);
    expect(retry(2, new Error("Network timeout"))).toBe(false);
  });
});
