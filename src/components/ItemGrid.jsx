import ItemCard from './ItemCard'

export default function ItemGrid({ items, loading, error, currentUser }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="card animate-pulse">
            <div className="aspect-[4/3] bg-gray-200 border-b-[3px] border-[var(--color-border)]" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-300 w-3/4" />
              <div className="h-3 bg-gray-200 w-1/2" />
              <div className="h-10 bg-gray-300 mt-4 border-[3px] border-[var(--color-border)]" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-4xl mb-4">⚠️</p>
        <p className="font-semibold" style={{ color: 'var(--color-fomo)' }}>Error loading listings</p>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>{error}</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-24 px-4">
        <p className="text-6xl mb-4">📭</p>
        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
          Nothing here yet.
        </h2>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Be the first to list something! Hit &ldquo;Sell My Stuff&rdquo; above.
        </p>
      </div>
    )
  }

  return (
    <div id="items-grid" className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map(item => (
        <ItemCard key={item.id} item={item} currentUser={currentUser} />
      ))}
    </div>
  )
}
