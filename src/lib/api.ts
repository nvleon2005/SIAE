export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  timeoutMs?: number;
  parseJson?: boolean;
};

type ResponseLike = Pick<Response, "headers" | "ok" | "status" | "text" | "json" | "clone">;

function normalizeHeaders(headers?: HeadersInit): Record<string, string> {
  if (!headers) return {};
  if (typeof (headers as Headers).forEach === "function") {
    const normalized: Record<string, string> = {};
    (headers as Headers).forEach((value, key) => {
      normalized[key] = value;
    });
    return normalized;
  }

  if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  }

  return Object.fromEntries(
    Object.entries(headers as Record<string, string>),
  );
}

function getHeaderValue(headers: HeadersInit | undefined, name: string): string {
  if (!headers) return "";
  return new Headers(headers).get(name) ?? "";
}

function parseResponsePayload(response: ResponseLike): Promise<unknown> {
  const hasText = typeof response?.text === "function";
  const hasJson = typeof response?.json === "function";

  if (hasText) {
    const responseToRead = typeof response.clone === "function" ? response.clone() : response;
    return responseToRead.text().then((payload: string) => {
      if (!payload) {
        return undefined;
      }

      const contentType = getHeaderValue(response.headers ?? responseToRead.headers, "content-type");
      if (contentType.includes("application/json")) {
        try {
          return JSON.parse(payload);
        } catch {
          return payload;
        }
      }

      return payload;
    });
  }

  if (hasJson) {
    return response.json();
  }

  return Promise.resolve(undefined);
}

export async function apiRequest<T>(
  url: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const {
    body,
    timeoutMs = 8000,
    parseJson = true,
    headers,
    ...rest
  } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const requestHeaders = normalizeHeaders(headers);
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

    if (body !== undefined && body !== null && !isFormData && !Object.prototype.hasOwnProperty.call(requestHeaders, "Content-Type")) {
      requestHeaders["Content-Type"] = "application/json";
    }

    const response = await fetch(url, {
      ...rest,
      credentials: rest.credentials ?? "include",
      headers: requestHeaders,
      signal: controller.signal,
      body: body === undefined || body === null
        ? undefined
        : typeof body === "string" || isFormData || body instanceof Blob || body instanceof ArrayBuffer || ArrayBuffer.isView(body)
          ? body as BodyInit
          : JSON.stringify(body),
    });

    if (!parseJson) {
      return undefined as T;
    }

    const data = await parseResponsePayload(response);

    if (!response.ok) {
      const serverMessage = typeof data === "object" && data !== null
        ? (data as { message?: string; code?: string }).message ?? (data as { error?: string }).error
        : undefined;
      const serverCode = typeof data === "object" && data !== null
        ? (data as { code?: string }).code
        : undefined;
      throw new ApiError(serverMessage ?? "Request failed", response.status, serverCode, data);
    }

    if (data === "" || data === undefined) {
      return undefined as T;
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiError("Request timeout", 408, "TIMEOUT");
    }
    throw new ApiError(error instanceof Error ? error.message : "Request failed", 500, "UNKNOWN_ERROR");
  } finally {
    clearTimeout(timeoutId);
  }
}
