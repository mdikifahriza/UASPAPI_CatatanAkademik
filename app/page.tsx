'use client'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px', textAlign: 'center', border: '1px solid #ccc' }}>
      <h1>Academic System API</h1>
      <p>Sistem Catatan Akademik UAS Pemrograman API</p>
      <div style={{ marginTop: '30px' }}>
        <button onClick={() => router.push('/login')} style={{ padding: '12px 24px', fontSize: '16px', marginRight: '10px' }}>
          Login
        </button>
        <button onClick={() => router.push('/register')} style={{ padding: '12px 24px', fontSize: '16px' }}>
          Register
        </button>
      </div>
    </div>
  )
}