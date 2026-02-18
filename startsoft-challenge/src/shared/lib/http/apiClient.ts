const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type ApiRequestOptions = RequestInit & {
  path?: string;
};

function buildUrl(path = "") {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined.");
  }

  if (!path) return API_BASE_URL;
  // Permite chamadas pontuais para endpoints externos com URL absoluta.
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  // Normaliza barras para evitar "base//path" ao combinar base e rota.
  const normalizedBase = API_BASE_URL.endsWith("/") ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

export async function apiRequest<T>({ path, ...init }: ApiRequestOptions): Promise<T> {
  // Mescla headers do caller e força resposta em JSON para este client.
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");

  const response = await fetch(buildUrl(path), {
    ...init,
    headers,
  });

  // Lê como texto primeiro para tratar respostas vazias (ex.: 204) como null com segurança.
  const bodyText = await response.text();
  const parsedBody = bodyText ? (JSON.parse(bodyText) as unknown) : null;

  if (!response.ok) {
    // Prioriza "message" do backend quando disponível para erros mais acionáveis.
    const message =
      typeof parsedBody === "object" &&
      parsedBody !== null &&
      "message" in parsedBody &&
      typeof parsedBody.message === "string"
        ? parsedBody.message
        : response.statusText || "Request failed";

    throw new Error(`HTTP ${response.status}: ${message}`);
  }

  return parsedBody as T;
}
