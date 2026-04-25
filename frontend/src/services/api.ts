import type { Artist, ArtistType, Location, Locality, Show, Reservation, Review, User, PageResponse } from '../types/models'

const BASE = '/api'

// Generic fetch wrapper — throws on non-OK responses
async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || `HTTP ${res.status}`)
  }
  // 204 No Content
  if (res.status === 204) return null as T
  return res.json()
}

// ---- Auth ----
export const authApi = {
  login: async (login: string, password: string) => {
    const params = new URLSearchParams({ login, password })
    const res = await fetch(`${BASE}/users/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    })
    if (!res.ok) throw new Error('Identifiants invalides ou compte en attente de validation')
    return res.json() as Promise<{ login: string; roles: string[] }>
  },
  logout: () => request<void>(`${BASE}/users/logout`, { method: 'POST' }),
  getProfile: () => request<User>(`${BASE}/users/profile`),
  register: (data: object) => request<{ message: string }>(`${BASE}/users/register`, {
    method: 'POST', body: JSON.stringify(data),
  }),
  updateProfile: (data: object) => request<User>(`${BASE}/users/profile`, {
    method: 'PUT', body: JSON.stringify(data),
  }),
}

// ---- Shows ----
export const showApi = {
  getAll: (params?: {
    search?: string
    localityId?: number
    locationId?: number
    sort?: string
    page?: number
    size?: number
  }) => {
    const q = new URLSearchParams()
    if (params?.search)                     q.set('search',     params.search)
    if (params?.localityId != null)         q.set('localityId', String(params.localityId))
    if (params?.locationId != null)         q.set('locationId', String(params.locationId))
    if (params?.sort)                       q.set('sort',       params.sort)
    if (params?.page      != null)          q.set('page',       String(params.page))
    if (params?.size      != null)          q.set('size',       String(params.size))
    const qs = q.toString()
    return request<PageResponse<Show>>(`${BASE}/shows${qs ? '?' + qs : ''}`)
  },
  getAllAdmin: () => request<Show[]>(`${BASE}/shows/admin`),
  getById: (id: number) => request<Show>(`${BASE}/shows/${id}`),
  getBySlug: (slug: string) => request<Show>(`${BASE}/shows/slug/${slug}`),
  create: (formData: FormData) => fetch(`${BASE}/shows`, {
    method: 'POST', credentials: 'include', body: formData,
  }).then(r => r.json()) as Promise<Show>,
  update: (id: number, formData: FormData) => fetch(`${BASE}/shows/${id}`, {
    method: 'PUT', credentials: 'include', body: formData,
  }).then(r => r.json()) as Promise<Show>,
  confirm: (id: number) => request<Show>(`${BASE}/shows/${id}/confirm`, { method: 'PUT' }),
  revoke: (id: number) => request<Show>(`${BASE}/shows/${id}/revoke`, { method: 'PUT' }),
  delete: (id: number) => request<void>(`${BASE}/shows/${id}`, { method: 'DELETE' }),
}

// ---- Artists ----
export const artistApi = {
  getAll: () => request<Artist[]>(`${BASE}/artists`),
  getTypes: () => request<ArtistType[]>(`${BASE}/artist-types`),
  create: (data: object) => request<Artist>(`${BASE}/artists`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: object) => request<Artist>(`${BASE}/artists/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request<void>(`${BASE}/artists/${id}`, { method: 'DELETE' }),
}

// ---- Locations ----
export const locationApi = {
  getAll: () => request<Location[]>(`${BASE}/locations`),
  getLocalities: () => request<Locality[]>(`${BASE}/localities`),
  create: (data: object) => request<Location>(`${BASE}/locations`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: object) => request<Location>(`${BASE}/locations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request<void>(`${BASE}/locations/${id}`, { method: 'DELETE' }),
}

// ---- Representations ----
export const representationApi = {
  create: (data: object) => request<object>(`${BASE}/representations`, { method: 'POST', body: JSON.stringify(data) }),
  delete: (id: number) => request<void>(`${BASE}/representations/${id}`, { method: 'DELETE' }),
}

// ---- Reservations ----
export const reservationApi = {
  create: (data: object) => request<Reservation>(`${BASE}/reservations`, { method: 'POST', body: JSON.stringify(data) }),
  myBookings: () => request<Reservation[]>(`${BASE}/reservations/my-bookings`),
  getAll: () => request<Reservation[]>(`${BASE}/reservations`),
}

// ---- Reviews ----
export const reviewApi = {
  getByShow: (showId: number) => request<Review[]>(`${BASE}/reviews/show/${showId}`),
  getPending: () => request<Review[]>(`${BASE}/reviews/pending`),
  create: (data: object) => request<Review>(`${BASE}/reviews`, { method: 'POST', body: JSON.stringify(data) }),
  validate: (id: number) => request<Review>(`${BASE}/reviews/${id}/validate`, { method: 'PUT' }),
  delete: (id: number) => request<void>(`${BASE}/reviews/${id}`, { method: 'DELETE' }),
}

// ---- Admin users ----
export const userApi = {
  getAll: () => request<User[]>(`${BASE}/users`),
  activate: (id: number) => request<User>(`${BASE}/users/${id}/activate`, { method: 'PUT' }),
  deactivate: (id: number) => request<User>(`${BASE}/users/${id}/deactivate`, { method: 'PUT' }),
  approve: (id: number) => request<User>(`${BASE}/users/${id}/approve`, { method: 'PUT' }),
  delete: (id: number) => request<void>(`${BASE}/users/${id}`, { method: 'DELETE' }),
}
