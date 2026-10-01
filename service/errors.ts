import axios from 'axios';

/**
 * Normalized error thrown by every function in `service/`.
 * `message` is the server-provided `error` string when available,
 * so callers can use `err.message` instead of digging into axios internals.
 */
export class ApiError extends Error {
  status: number;
  isNetworkError: boolean;

  constructor(message: string, status = 0, isNetworkError = false) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.isNetworkError = isNetworkError;
  }
}

export function toApiError(err: unknown, fallbackMessage = 'Request failed'): ApiError {
  if (err instanceof ApiError) return err;
  if (axios.isAxiosError(err)) {
    // No response at all -> server unreachable / network failure.
    if (!err.response) {
      return new ApiError(err.message || fallbackMessage, 0, true);
    }
    const data = err.response.data as { error?: unknown } | undefined;
    const message =
      typeof data?.error === 'string' && data.error ? data.error : err.message || fallbackMessage;
    return new ApiError(message, err.response.status ?? 0, false);
  }
  if (err instanceof Error) return new ApiError(err.message || fallbackMessage, 0, false);
  return new ApiError(fallbackMessage, 0, false);
}
