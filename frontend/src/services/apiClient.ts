export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5070';

interface RequestOptions {
  method?: string;
  body?: unknown;
  organizerToken?: string;
  viewerToken?: string;
}

async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, organizerToken, viewerToken } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (organizerToken) {
    headers['Organizer-Token'] = organizerToken;
  }

  let url = `${API_BASE_URL}${endpoint}`;
  if (viewerToken && !organizerToken) {
    const separator = endpoint.includes('?') ? '&' : '?';
    url += `${separator}viewerToken=${viewerToken}`;
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

export default apiClient;