import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import ListItemModal from './ListItemModal'

export default function Navbar() {
  const [user, setUser] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    let active = true

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return
      setUser(session?.user ?? null)
      setAuthReady(true)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setAuthReady(true)
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <>
      <nav className="sticky top-0 z-50 border-b" style={{ background: 'rgba(10,10,15,0.9)', borderColor: 'var(--color-border)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-2xl">⚡</span>
            <span className="text-xl font-black tracking-tight" style={{ color: 'var(--color-text)' }}>
              Flash<span style={{ color: 'var(--color-accent)' }}>Drop</span>
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full border ml-1" style={{ color: 'var(--color-text-muted)', borderColor: 'var(--color-border)', fontSize: '10px' }}>
              NSEC
            </span>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {!authReady ? (
              <span className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>
                Loading...
              </span>
            ) : user ? (
              <>
                <button
                  id="sell-btn"
                  onClick={() => setShowModal(true)}
                  className="btn-primary text-sm"
                >
                  + Sell My Stuff
                </button>
                <Link to="/my-listings" className="btn-ghost text-sm">
                  My Listings
                </Link>
                <button onClick={handleLogout} className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  Sign out
                </button>
              </>
            ) : (
              <Link to="/login" id="login-btn" className="btn-primary text-sm">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      {showModal && <ListItemModal onClose={() => setShowModal(false)} />}
    </>
  )
}
