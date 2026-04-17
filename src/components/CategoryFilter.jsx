const CATEGORIES = ['All', 'Books', 'Electronics', 'Clothing', 'Furniture', 'Other']

const CATEGORY_EMOJI = {
  'All': '✨',
  'Books': '📚',
  'Electronics': '💻',
  'Clothing': '👕',
  'Furniture': '🪑',
  'Other': '📦',
}

export default function CategoryFilter({ selected, onSelect }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {CATEGORIES.map(cat => (
        <button
          key={cat}
          id={`filter-${cat.toLowerCase()}`}
          onClick={() => onSelect(cat)}
          className={`text-sm font-black uppercase tracking-wider px-4 py-2 border-[3px] transition-all duration-200 transform hover:-translate-y-1 ${
            selected === cat
              ? 'bg-[#FF3366] text-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
              : 'bg-white text-black border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
          }`}
        >
          {CATEGORY_EMOJI[cat]} {cat}
        </button>
      ))}
    </div>
  )
}
