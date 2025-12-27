'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/students?page=1&limit=10', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setStudents(data.data.students)
      } else {
        setError(data.error)
      }
    } catch (e: any) {
      setError(e.message)
    }
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px', border: '1px solid #ccc' }}>
      <h1>Students</h1>
      <button onClick={() => router.push('/dashboard')} style={{ marginBottom: '20px', padding: '10px' }}>
        Back to Dashboard
      </button>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {students.length === 0 ? (
        <p>No students found</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>NIM</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Name</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Major</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>GPA</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id}>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{s.nim}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{s.name}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{s.major}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{s.gpa || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}