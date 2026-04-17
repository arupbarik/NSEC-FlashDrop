import { useState, useEffect } from 'react'

/**
 * CountdownTimer — shows a live ticking countdown to expiry.
 * Goes red + pulsing when under 24 hours.
 */
export default function CountdownTimer({ expiresAt }) {
  const [timeLeft, setTimeLeft] = useState('')
  const [urgent, setUrgent] = useState(false)
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    const tick = () => {
      const diff = new Date(expiresAt) - new Date()
      if (diff <= 0) {
        setExpired(true)
        setTimeLeft('EXPIRED')
        return
      }
      const d = Math.floor(diff / 86400000)
      const h = Math.floor((diff % 86400000) / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      setUrgent(diff < 86400000) // under 24h = urgent red
      setTimeLeft(d > 0 ? `${d}d ${h}h left` : `${h}h ${m}m left`)
    }

    tick()
    const id = setInterval(tick, 60000) // update every 60s
    return () => clearInterval(id)
  }, [expiresAt])

  if (expired) {
    return (
      <span className="text-xs font-bold text-gray-500 font-mono">
        EXPIRED
      </span>
    )
  }

  return (
    <span
      className={`text-xs font-bold font-mono ${
        urgent
          ? 'text-red-500 animate-pulse'
          : 'text-orange-400'
      }`}
    >
      ⏱ {timeLeft}
    </span>
  )
}
