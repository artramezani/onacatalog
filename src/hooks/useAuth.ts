'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  userId: string
  phone: string
}

export function useAuth(requireAuth = false) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    const userId = localStorage.getItem('user_id')

    if (token && userId) {
      // decode کردن token برای گرفتن اطلاعات
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        if (payload.exp > Date.now() / 1000) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
            setUser({ userId: payload.userId, phone: payload.phone })
        } else {
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user_id')
          if (requireAuth) router.push('/login')
        }
      } catch {
        if (requireAuth) router.push('/login')
      }
    } else if (requireAuth) {
      router.push('/login')
    }

    setLoading(false)
  }, [requireAuth, router])

   const logout = async () => {
  await fetch('/api/auth/logout', { method: 'POST' })
  window.location.href = '/login'
}

  return { user, loading, logout }
}
