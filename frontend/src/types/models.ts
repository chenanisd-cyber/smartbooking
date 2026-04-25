// Shared TypeScript types matching backend DTOs

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number   // current page index
  size: number
}

export interface User {
  id: number
  login: string
  email: string
  firstName: string
  lastName: string
  isActive: boolean
  isApproved: boolean
  roles: string[]
}

export interface ArtistType {
  id: number
  name: string
}

export interface Artist {
  id: number
  name: string
  biography: string | null
  imagePath: string | null
  types: string[]
}

export interface Locality {
  id: number
  name: string
  postalCode: string | null
}

export interface Location {
  id: number
  name: string
  address: string | null
  capacity: number
  locality: Locality | null
}

export interface Price {
  id: number
  type: 'STANDARD' | 'VIP' | 'REDUIT' | 'PREMIUM'
  amount: number
}

export interface Representation {
  id: number
  showId: number
  location: Location | null
  dateTime: string
  availableSeats: number
  prices: Price[]
}

export interface Show {
  id: number
  title: string
  description: string | null
  slug: string
  imagePath: string | null
  isConfirmed: boolean
  artist: Artist | null
  representations: Representation[]
  createdAt: string
}

export interface Reservation {
  id: number
  showId: number
  showTitle: string
  showSlug: string
  locationName: string | null
  dateTime: string
  priceType: string
  quantity: number
  totalAmount: number
  status: 'CONFIRMED' | 'CANCELLED'
  createdAt: string
}

export interface Review {
  id: number
  userLogin: string
  showId: number
  showTitle: string
  comment: string
  stars: number
  validated: boolean
  createdAt: string
}
