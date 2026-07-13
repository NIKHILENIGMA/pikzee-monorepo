import { useAuth } from '@clerk/nextjs'
import axios from 'axios'

import { env } from './config'

export function useApiClient() {
  const { getToken } = useAuth()

  const client = axios.create({
    baseURL: env.NEXT_PUBLIC_API_URL,
  })

  client.interceptors.request.use(async (config) => {
    try {
      const token = await getToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch (e) {
      console.error('Failed to get auth token', e)
    }
    return config
  })

  return client
}
