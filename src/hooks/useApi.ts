import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'

export function useApi<T>(
  endpoint: string,
  options?: {
    dependencies?: any[]
    enabled?: boolean
  }
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (options?.enabled === false) return

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await apiClient.request(endpoint)
        setData(result)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, options?.dependencies || [])

  return { data, loading, error, refetch: () => {
    // Trigger refetch logic here
  }}
}