'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [token, setToken] = useState('')
  const router = useRouter()

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('token')
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
      setToken(storedToken)
    } else {
      router.push('/login')
    }
  }, [])

  const handleLogout = () => {
    localStorage.clear()
    router.push('/login')
  }

  if (!user) return <p>Loading...</p>

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px', border: '1px solid #ccc' }}>
      <h1>Dashboard</h1>
      <p><b>Name:</b> {user.name}</p>
      <p><b>Email:</b> {user.email}</p>
      <p><b>Role:</b> {user.role}</p>
      <div style={{ marginTop: '20px' }}>
        <button onClick={() => router.push('/students')} style={{ marginRight: '10px', padding: '10px' }}>
          Students
        </button>
        <button onClick={() => router.push('/refresh-token')} style={{ marginRight: '10px', padding: '10px' }}>
          Refresh Token
        </button>
        <button onClick={handleLogout} style={{ padding: '10px', background: '#f00', color: '#fff' }}>
          Logout
        </button>
      </div>
    </div>
  )
}