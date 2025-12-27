'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RefreshTokenPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleRefresh = async () => {
    setLoading(true)
    setMessage('')
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${refreshToken}` },
      })
      const data = await res.json()
      if (data.success) {
        localStorage.setItem('token', data.data.token)
        localStorage.setItem('refreshToken', data.data.refreshToken)
        setMessage('Token refreshed successfully!')
      } else {
        setMessage(`Error: ${data.error}`)
      }
    } catch (e: any) {
      setMessage(`Error: ${e.message}`)
    }
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc' }}>
      <h1>Refresh Token</h1>
      <button onClick={handleRefresh} disabled={loading} style={{ width: '100%', padding: '10px', marginBottom: '10px' }}>
        {loading ? 'Loading...' : 'Refresh Access Token'}
      </button>
      <button onClick={() => router.push('/dashboard')} style={{ width: '100%', padding: '10px' }}>
        Back to Dashboard
      </button>
      {message && <p style={{ marginTop: '20px', padding: '10px', background: '#f5f5f5' }}>{message}</p>}
    </div>
  )
}