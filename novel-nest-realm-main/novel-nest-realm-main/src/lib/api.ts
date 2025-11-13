const API_BASE = import.meta.env.VITE_API_URL || "/api";

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    credentials: 'include',
    ...options,
  });
  if (!res.ok) {
    let errorMessage = `Request failed: ${res.status}`;
    try {
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const json = await res.json();
        errorMessage = json.message || JSON.stringify(json) || errorMessage;
      } else {
        const text = await res.text();
        errorMessage = text || errorMessage;
      }
    } catch (err) {
      console.error('Error reading response:', err);
    }
    throw new Error(errorMessage);
  }
  return res.status === 204 ? null : res.json();
}

export const api = {
  health: () => request('/health'),
  auth: {
    signup: (data: { name?: string; email: string; password: string }) =>
      request('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
    login: (data: { email: string; password: string }) =>
      request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    me: () => request('/auth/me'),
    logout: () => request('/auth/logout', { method: 'POST' }),
    updateProfile: (data: { name?: string }) =>
      request('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),
    changePassword: (data: { currentPassword: string; newPassword: string }) =>
      request('/auth/password', { method: 'PUT', body: JSON.stringify(data) })
  },
  books: {
    list: (params?: { search?: string; genre?: string }) => {
      const qs = params ? new URLSearchParams(params as Record<string, string>).toString() : '';
      return request(`/books${qs ? `?${qs}` : ''}`);
    },
    get: (id: string) => request(`/books/${id}`),
    addReview: (id: string, data: { rating: number; text: string }) =>
      request(`/books/${id}/reviews`, { method: 'POST', body: JSON.stringify(data) }),
    create: (data: { title: string; author?: string; description?: string; coverUrl?: string; genre?: string; content?: string }) =>
      request('/books', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Record<string, unknown>) =>
      request(`/books/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (id: string) => request(`/books/${id}`, { method: 'DELETE' }),
    mine: (drafts?: boolean) => request(`/books/mine${drafts !== undefined ? `?drafts=${drafts}` : ''}`),
  },
};


