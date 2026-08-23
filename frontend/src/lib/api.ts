export const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "/api";

export async function apiFetch(
  path: string,
  options?: RequestInit
) {
  const response = await fetch(`${API_BASE}${path}`, options);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `API request failed (${response.status}): ${text.slice(0, 200)}`
    );
  }

  return response;
}
