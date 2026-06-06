// Small client-side fetch helpers shared by SWR and mutations.

export class ApiError extends Error {}

export async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(data?.error ?? `Request failed (${res.status})`);
  }
  return data as T;
}

export async function postJSON<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(data?.error ?? `Request failed (${res.status})`);
  }
  return data as T;
}
