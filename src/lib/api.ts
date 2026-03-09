const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://momenty-backend-production.up.railway.app';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface Album {
  id: string;
  name: string;
  cover_photo?: string;
  user_id: string;
  created_at?: string;
}

export interface Photo {
  id: string;
  url: string;
  filename: string;
  size?: number;
  album_id?: string;
  user_id?: string;
  created_at?: string;
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('momenty_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Don't set Content-Type for FormData — browser sets it with boundary
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || `Request failed: ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  auth: {
    google: (credential: string) =>
      request<{ token: string; user: User }>('/auth/google', {
        method: 'POST',
        body: JSON.stringify({ token: credential }),
      }),
    me: () => request<User>('/auth/me'),
  },

  albums: {
    list: () => request<Album[]>('/albums'),
    create: (name: string) =>
      request<Album>('/albums', {
        method: 'POST',
        body: JSON.stringify({ name }),
      }),
    delete: (id: string) =>
      request<void>(`/albums/${id}`, { method: 'DELETE' }),
  },

  photos: {
    list: (albumId?: string) =>
      request<Photo[]>(`/photos${albumId ? `?album_id=${albumId}` : ''}`),
    upload: (formData: FormData) =>
      request<Photo>('/photos', { method: 'POST', body: formData }),
    delete: (id: string) =>
      request<void>(`/photos/${id}`, { method: 'DELETE' }),
  },
};
