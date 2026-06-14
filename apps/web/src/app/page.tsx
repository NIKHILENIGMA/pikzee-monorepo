import { useEffect, useState } from 'react'

// import type {  ApiResponse } from '@pikzee/shared-types';
import type { ApiResponse, User } from '@pikzee/shared-types'

import Counter from '../components/counter'

export default function Index() {
  const [data, setData] = useState<User | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  async function fetchData(userId: string): Promise<ApiResponse<User>> {
    try {
      setLoading(true)
      // Simulate an API call
      const response = await fetch(`/api/users/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()
      setData(result.data || null)
      return result
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Unknown error'))
      throw error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData('123')
  }, [])
  return (
    <div>
      <h1>{data ? data.email : 'Loading...'}</h1>
      {error && <p>Error: {error.message}</p>}
      {loading && <p>Loading...</p>}
      <Counter />
    </div>
  )
}
