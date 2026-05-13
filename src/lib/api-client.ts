// Tiny fetch wrapper that always sends cookies and surfaces JSON errors.
export async function api<T = unknown>(
  url: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await fetch(url, {
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init.headers || {}),
    },
    ...init,
  });

  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    /* empty body */
  }

  if (!res.ok) {
    const message =
      (body && typeof body === "object" && "error" in body && (body as { error: string }).error) ||
      `Request failed (${res.status})`;
    throw new ApiError(String(message), res.status, body);
  }

  return body as T;
}

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}
