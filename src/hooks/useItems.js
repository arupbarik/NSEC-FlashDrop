import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

/**
 * useItems — fetches active listings and subscribes to realtime updates.
 * Items are filtered by: not sold, not expired.
 */
export function useItems(category = null) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchItems = async () => {
    setLoading(true)
    setError(null)

    let query = supabase
      .from('items')
      .select('*')
      .eq('is_sold', false)
      .gt('expires_at', new Date().toISOString())
      .order('expires_at', { ascending: true })

    if (category && category !== 'All') {
      query = query.eq('category', category)
    }

    const { data, error: fetchError } = await query

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setItems(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchItems()

    // Subscribe to realtime changes on the items table
    const channel = supabase
      .channel('items-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, () => {
        fetchItems()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [category])

  return { items, loading, error, refetch: fetchItems }
}
