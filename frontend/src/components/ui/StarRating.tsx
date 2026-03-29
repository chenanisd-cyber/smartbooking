// Display-only star rating component
interface Props { stars: number; max?: number }

export default function StarRating({ stars, max = 5 }: Props) {
  return (
    <span style={{ color: '#f59e0b', fontSize: '1rem', letterSpacing: '1px' }}>
      {'★'.repeat(stars)}{'☆'.repeat(max - stars)}
    </span>
  )
}
