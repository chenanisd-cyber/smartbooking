// Composant interactif pour choisir une note (1-5 étoiles)
import { useState } from 'react'

interface Props {
  value: number
  onChange: (val: number) => void
  max?: number
}

export default function StarRatingInput({ value, onChange, max = 5 }: Props) {
  const [hovered, setHovered] = useState(0)

  return (
    <span style={{ display: 'inline-flex', gap: '2px', cursor: 'pointer', fontSize: '1.4rem' }}>
      {Array.from({ length: max }, (_, i) => i + 1).map(star => (
        <span
          key={star}
          style={{ color: star <= (hovered || value) ? '#f59e0b' : '#d1d5db', lineHeight: 1 }}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
        >
          ★
        </span>
      ))}
    </span>
  )
}
