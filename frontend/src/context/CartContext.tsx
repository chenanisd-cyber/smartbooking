import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { CartLine } from '../types/models'

interface CartContextType {
  lines: CartLine[]
  totalItems: number
  totalAmount: number
  addLine: (line: Omit<CartLine, 'cartLineId'>) => void
  updateQuantity: (cartLineId: string, quantity: number) => void
  removeLine: (cartLineId: string) => void
  clear: () => void
}

const CartContext = createContext<CartContextType | null>(null)

const STORAGE_KEY = 'smartbooking_cart'

// Génère un ID unique pour chaque ligne de panier (côté frontend uniquement)
function generateCartLineId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

// Charge le panier depuis localStorage au démarrage
function loadFromStorage(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(loadFromStorage)

  // Persiste le panier à chaque modif
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
    } catch {
      // localStorage plein ou désactivé — on continue silencieusement
    }
  }, [lines])

  const addLine = (line: Omit<CartLine, 'cartLineId'>) => {
    setLines(prev => {
      // Si une ligne identique existe déjà (même représentation + même tarif),
      // on incrémente sa quantité au lieu d'ajouter un doublon
      const existing = prev.find(l =>
        l.representationId === line.representationId &&
        l.priceType === line.priceType
      )
      if (existing) {
        return prev.map(l =>
          l === existing
            ? { ...l, quantity: l.quantity + line.quantity }
            : l
        )
      }
      // Sinon on ajoute une nouvelle ligne
      return [...prev, { ...line, cartLineId: generateCartLineId() }]
    })
  }

  const updateQuantity = (cartLineId: string, quantity: number) => {
    if (quantity < 1) {
      removeLine(cartLineId)
      return
    }
    setLines(prev => prev.map(l =>
      l.cartLineId === cartLineId ? { ...l, quantity } : l
    ))
  }

  const removeLine = (cartLineId: string) => {
    setLines(prev => prev.filter(l => l.cartLineId !== cartLineId))
  }

  const clear = () => {
    setLines([])
  }

  const totalItems = lines.reduce((sum, l) => sum + l.quantity, 0)
  const totalAmount = lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0)

  return (
    <CartContext.Provider value={{
      lines,
      totalItems,
      totalAmount,
      addLine,
      updateQuantity,
      removeLine,
      clear
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}