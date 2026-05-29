import { config } from "../config";

interface ApiClientOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
}

interface ApiError {
  status: number;
  message: string;
  details?: unknown;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = config.oathkeeperEndpoint) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: ApiClientOptions = {},
  ): Promise<T> {
    const { method = "GET", body, headers = {} } = options;

    const url = `${this.baseUrl}${endpoint}`;

    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...headers,
    };

    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
      credentials: "include",
    };

    if (body) {
      requestOptions.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        const errorBody = await response.text();
        const error: ApiError = {
          status: response.status,
          message: errorBody || response.statusText,
        };
        throw error;
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return undefined as T;
      }

      return (await response.json()) as T;
    } catch (error) {
      if ((error as ApiError).status) {
        throw error;
      }
      throw {
        status: 0,
        message: (error as Error).message || "Network error",
      } as ApiError;
    }
  }

  async get<T>(endpoint: string, headers?: Record<string, string>) {
    return this.request<T>(endpoint, { method: "GET", headers });
  }

  async post<T>(
    endpoint: string,
    body?: unknown,
    headers?: Record<string, string>,
  ) {
    return this.request<T>(endpoint, { method: "POST", body, headers });
  }

  async put<T>(
    endpoint: string,
    body?: unknown,
    headers?: Record<string, string>,
  ) {
    return this.request<T>(endpoint, { method: "PUT", body, headers });
  }

  async patch<T>(
    endpoint: string,
    body?: unknown,
    headers?: Record<string, string>,
  ) {
    return this.request<T>(endpoint, { method: "PATCH", body, headers });
  }

  async delete<T>(endpoint: string, headers?: Record<string, string>) {
    return this.request<T>(endpoint, { method: "DELETE", headers });
  }
}

export const apiClient = new ApiClient();
export type { ApiClientOptions, ApiError };
