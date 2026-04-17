/**
 * FomoBadge — shows realtime interest count.
 * Only renders if count > 0.
 */
export default function FomoBadge({ count }) {
  if (!count || count <= 0) return null

  return (
    <span className="badge-fomo flex items-center gap-1">
      🔥 {count} {count === 1 ? 'person' : 'people'} interested
    </span>
  )
}
