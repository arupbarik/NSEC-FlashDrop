import { useState } from 'react'
import { supabase } from '../lib/supabase'

const CATEGORIES = ['Books', 'Electronics', 'Clothing', 'Furniture', 'Other']
const CONDITIONS = ['Like New', 'Good', 'Fair']

export default function ListItemModal({ onClose }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Books',
    condition: 'Good',
    seller_whatsapp: '',
    expires_at: '',
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleImage = e => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('You must be signed in to post a listing.')

      let image_url = null

      // Upload image if selected
      if (imageFile) {
        const ext = imageFile.name.split('.').pop()
        const filename = `${user.id}-${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('item-images')
          .upload(filename, imageFile)
        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('item-images')
          .getPublicUrl(filename)
        image_url = urlData.publicUrl
      }

      const { error: insertError } = await supabase.from('items').insert({
        seller_id: user.id,
        seller_name: user.email.split('@')[0],
        seller_whatsapp: form.seller_whatsapp.replace(/\D/g, ''),
        title: form.title,
        description: form.description,
        price: parseInt(form.price, 10),
        category: form.category,
        condition: form.condition,
        image_url,
        expires_at: new Date(form.expires_at).toISOString(),
      })

      if (insertError) throw insertError
      onClose()
    } catch (err) {
      setError(err.message || 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
      <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto" style={{ background: 'var(--color-card)' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <h2 className="text-lg font-black" style={{ color: 'var(--color-text)' }}>
            ⚡ List an Item
          </h2>
          <button onClick={onClose} className="text-xl leading-none" style={{ color: 'var(--color-text-muted)' }}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4" id="list-item-form">
          {/* Photo Upload */}
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--color-text-muted)' }}>Photo</label>
            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden aspect-[4/3] mb-2">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button type="button" onClick={() => { setImageFile(null); setImagePreview(null) }}
                  className="absolute top-2 right-2 text-xs bg-black/60 text-white px-2 py-1 rounded-full">
                  Remove
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed cursor-pointer py-8 transition-colors hover:border-accent/50"
                style={{ borderColor: 'var(--color-border)' }}>
                <span className="text-2xl mb-1">📷</span>
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Click to upload photo</span>
                <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
              </label>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--color-text-muted)' }}>Item Title *</label>
            <input id="title-input" name="title" value={form.title} onChange={handleChange}
              required placeholder="e.g. Engineering Physics textbook" className="input-field" />
          </div>

          {/* Price */}
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--color-text-muted)' }}>Price (₹) *</label>
            <input id="price-input" name="price" type="number" value={form.price} onChange={handleChange}
              required min="1" placeholder="200" className="input-field" />
          </div>

          {/* Category + Condition */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--color-text-muted)' }}>Category *</label>
              <select id="category-select" name="category" value={form.category} onChange={handleChange} className="input-field">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--color-text-muted)' }}>Condition *</label>
              <select id="condition-select" name="condition" value={form.condition} onChange={handleChange} className="input-field">
                {CONDITIONS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--color-text-muted)' }}>Your WhatsApp Number *</label>
            <input id="whatsapp-input" name="seller_whatsapp" value={form.seller_whatsapp} onChange={handleChange}
              required placeholder="919XXXXXXXXX (with country code)" className="input-field" />
          </div>

          {/* Expiry */}
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--color-text-muted)' }}>Leave Date / Expiry *</label>
            <input id="expiry-input" name="expires_at" type="datetime-local" value={form.expires_at} onChange={handleChange}
              required className="input-field" />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--color-text-muted)' }}>Description (optional)</label>
            <textarea id="description-input" name="description" value={form.description} onChange={handleChange}
              rows={3} placeholder="Any extra details — year, edition, reason for selling..." className="input-field resize-none" />
          </div>

          {error && <p className="text-sm font-semibold" style={{ color: 'var(--color-fomo)' }}>{error}</p>}

          <button id="submit-listing-btn" type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
            {loading ? 'Posting...' : '⚡ Post Listing'}
          </button>
        </form>
      </div>
    </div>
  )
}
