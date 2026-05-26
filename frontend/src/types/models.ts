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
  collaborators: Artist[]
  representations: Representation[]
  producer: User | null
  createdAt: string
}

// ---- Reservations (panier multi-lignes) ----

export interface ReservationLine {
  id: number
  representationId: number
  showId: number
  showTitle: string
  showSlug: string
  locationName: string | null
  dateTime: string
  priceType: 'STANDARD' | 'VIP' | 'REDUIT' | 'PREMIUM'
  quantity: number
  unitPrice: number
  lineTotal: number
}

export interface Reservation {
  id: number
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED'
  totalAmount: number
  createdAt: string
  lines: ReservationLine[]
}

// ---- Cart (état local du panier avant paiement) ----

export interface CartLine {
  // Identifiant unique côté frontend (UUID ou timestamp) pour gérer add/remove
  cartLineId: string
  // Métadonnées affichables (snapshot au moment de l'ajout)
  representationId: number
  showId: number
  showTitle: string
  showSlug: string
  locationName: string | null
  dateTime: string
  priceType: 'STANDARD' | 'VIP' | 'REDUIT' | 'PREMIUM'
  unitPrice: number
  quantity: number
}

// ---- Stats producteur ----

export interface RepresentationStats {
  id: number
  dateTime: string
  locationName: string | null
  capacity: number
  confirmedSeats: number
  revenue: number
  fillRate: number
}

export interface ShowStats {
  id: number
  title: string
  slug: string
  totalConfirmedSeats: number
  totalRevenue: number
  representations: RepresentationStats[]
}

export interface ProducerStats {
  totalShows: number
  totalConfirmedSeats: number
  totalRevenue: number
  shows: ShowStats[]
}

export interface Review {
  id: number
  userLogin: string
  showId: number
  showTitle: string
  comment: string
  stars: number
  validated: boolean
  reviewType: 'MEMBER_REVIEW' | 'PRESS_REVIEW'
  articleUrl: string | null
  createdAt: string
}