/**
 * Custom hook for API calls with standardized error handling
 * Follows React best practices and reduces code duplication
 */
import { useState, useCallback } from 'react'
import { getToken } from '@/lib/auth'
import { getApiBase } from '@/lib/api'

interface UseApiOptions {
  requireAuth?: boolean
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
}

interface ApiState<T = any> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useApi<T = any>(options: UseApiOptions = {}) {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const API = getApiBase()

  const request = useCallback(async (
    endpoint: string,
    config: RequestInit = {}
  ): Promise<T | null> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      // Add authentication header if required
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...config.headers,
      }

      if (options.requireAuth) {
        const token = getToken()
        if (!token) {
          throw new Error('Authentication required')
        }
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(`${API}${endpoint}`, {
        ...config,
        headers,
      })

      if (!response.ok) {
        let errorMessage = `Request failed with status ${response.status}`
        
        try {
          const errorData = await response.json()
          errorMessage = errorData.detail || errorMessage
        } catch {
          // If we can't parse JSON, use status text
          errorMessage = response.statusText || errorMessage
        }
        
        throw new Error(errorMessage)
      }

      const data = await response.json()
      setState(prev => ({ ...prev, data, loading: false }))
      
      if (options.onSuccess) {
        options.onSuccess(data)
      }
      
      return data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setState(prev => ({ ...prev, error: errorMessage, loading: false }))
      
      if (options.onError) {
        options.onError(errorMessage)
      }
      
      return null
    }
  }, [API, options])

  const get = useCallback((endpoint: string) => 
    request(endpoint, { method: 'GET' }), [request])

  const post = useCallback((endpoint: string, data?: any) =>
    request(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }), [request])

  const patch = useCallback((endpoint: string, data?: any) =>
    request(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }), [request])

  const del = useCallback((endpoint: string) =>
    request(endpoint, { method: 'DELETE' }), [request])

  const upload = useCallback((endpoint: string, file: File) =>
    request(endpoint, {
      method: 'POST',
      headers: {}, // Don't set Content-Type for file uploads
      body: (() => {
        const formData = new FormData()
        formData.append('file', file)
        return formData
      })(),
    }), [request])

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  return {
    ...state,
    request,
    get,
    post,
    patch,
    delete: del,
    upload,
    clearError,
  }
}