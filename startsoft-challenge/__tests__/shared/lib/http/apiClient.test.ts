type MockFetch = jest.Mock<Promise<Response>, [RequestInfo | URL, RequestInit | undefined]>;

function mockResponse(
  bodyText: string,
  init: {
    status?: number;
    statusText?: string;
  } = {},
): Response {
  const status = init.status ?? 200;
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: init.statusText ?? "",
    text: jest.fn().mockResolvedValue(bodyText),
  } as unknown as Response;
}

function mockJsonResponse(
  body: unknown,
  init: {
    status?: number;
    statusText?: string;
  } = {},
): Response {
  return mockResponse(JSON.stringify(body), init);
}

async function loadApiClient() {
  jest.resetModules();
  return import("@/shared/lib/http/apiClient");
}

describe("apiClient", () => {
  const originalBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  let mockFetch: MockFetch;

  beforeEach(() => {
    mockFetch = jest.fn();
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      writable: true,
      value: mockFetch,
    });
  });

  afterEach(() => {
    if (originalBaseUrl === undefined) {
      delete process.env.NEXT_PUBLIC_API_BASE_URL;
    } else {
      process.env.NEXT_PUBLIC_API_BASE_URL = originalBaseUrl;
    }
  });

  it("throws when NEXT_PUBLIC_API_BASE_URL is not defined", async () => {
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
    const { apiRequest } = await loadApiClient();

    await expect(apiRequest({ path: "/products" })).rejects.toThrow(
      "NEXT_PUBLIC_API_BASE_URL is not defined.",
    );
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("builds request URL using normalized base URL + relative path", async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.com/v1/";
    const { apiRequest } = await loadApiClient();

    mockFetch.mockResolvedValue(mockJsonResponse({ ok: true }));

    await apiRequest<{ ok: boolean }>({
      path: "products?page=1",
      method: "GET",
    });

    const [calledUrl] = mockFetch.mock.calls[0];
    expect(calledUrl).toBe("https://api.example.com/v1/products?page=1");
  });

  it("uses absolute URL path directly", async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.com/v1";
    const { apiRequest } = await loadApiClient();

    mockFetch.mockResolvedValue(mockJsonResponse({ ok: true }));

    await apiRequest<{ ok: boolean }>({
      path: "https://external.example.com/resource",
      method: "GET",
    });

    const [calledUrl] = mockFetch.mock.calls[0];
    expect(calledUrl).toBe("https://external.example.com/resource");
  });

  it("sets Accept header and preserves provided headers", async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.com/v1";
    const { apiRequest } = await loadApiClient();

    mockFetch.mockResolvedValue(mockJsonResponse({ ok: true }));

    await apiRequest<{ ok: boolean }>({
      path: "/products",
      method: "GET",
      headers: {
        Authorization: "Bearer test-token",
      },
    });

    const [, init] = mockFetch.mock.calls[0];
    const headers = init?.headers as Headers;

    expect(headers.get("Accept")).toBe("application/json");
    expect(headers.get("Authorization")).toBe("Bearer test-token");
  });

  it("returns parsed JSON when response is ok", async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.com/v1";
    const { apiRequest } = await loadApiClient();

    mockFetch.mockResolvedValue(
      mockJsonResponse({
        products: [{ id: 1 }],
        count: 1,
      }),
    );

    const result = await apiRequest<{ products: Array<{ id: number }>; count: number }>({
      path: "/products",
      method: "GET",
    });

    expect(result).toEqual({
      products: [{ id: 1 }],
      count: 1,
    });
  });

  it("returns null when body is empty and response is ok", async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.com/v1";
    const { apiRequest } = await loadApiClient();

    mockFetch.mockResolvedValue(
      mockResponse("", {
        status: 204,
        statusText: "No Content",
      }),
    );

    const result = await apiRequest<null>({
      path: "/products",
      method: "GET",
    });

    expect(result).toBeNull();
  });

  it("throws HTTP error using parsed message from body when available", async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.com/v1";
    const { apiRequest } = await loadApiClient();

    mockFetch.mockResolvedValue(
      mockJsonResponse(
        {
          message: "Invalid query params",
        },
        {
          status: 400,
          statusText: "Bad Request",
        },
      ),
    );

    await expect(
      apiRequest({
        path: "/products",
        method: "GET",
      }),
    ).rejects.toThrow("HTTP 400: Invalid query params");
  });

  it("falls back to statusText in HTTP errors when body has no message", async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.com/v1";
    const { apiRequest } = await loadApiClient();

    mockFetch.mockResolvedValue(
      mockJsonResponse(
        {
          error: "internal",
        },
        {
          status: 500,
          statusText: "Internal Server Error",
        },
      ),
    );

    await expect(
      apiRequest({
        path: "/products",
        method: "GET",
      }),
    ).rejects.toThrow("HTTP 500: Internal Server Error");
  });
});
