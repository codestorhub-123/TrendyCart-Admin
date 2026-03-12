'use client'

// Third-party Imports
import { toast } from 'react-hot-toast'

if (typeof window !== 'undefined') {
  // Store the original fetch only once
  if (!window._originalFetch) {
    window._originalFetch = window.fetch
  }

  // Override fetch
  window.fetch = async (...args) => {
    const url = typeof args[0] === 'string' ? args[0] : args[0]?.url
    
    try {
      const response = await window._originalFetch.apply(window, args)
      
      const currentPath = window.location.pathname
      // Prevent infinite redirect loop if already on login page
      if (currentPath.includes('/login')) {
         return response
      }

      // Check for 401 (Unauthorized)
      if (response.status === 401) {
          console.warn('[FetchInterceptor] 401 Unauthorized detected. Initiating logout...')
          await handleLogout(currentPath, '401 Unauthorized')
          // Halt execution correctly by returning a never-resolving promise
          return new Promise(() => {}) 
      } 
      // Check for 403 (Forbidden) - Demo Mode Handling
      else if (response.status === 403) {
          try {
            const clone = response.clone()
            const errorData = await clone.json()
            const message = errorData.message || ''

            if (message.toLowerCase().includes('demo')) {
                toast.error('Ye action demo account me allowed nahi hai.', {
                    duration: 4000,
                    position: 'top-center'
                })
            } else {
                toast.error(message || 'Access Forbidden')
            }
          } catch (err) {
            toast.error('Access Forbidden')
          }
      }
      // Check for 500 (Internal Server Error)
      else if (response.status === 500) {
          try {
            const clone = response.clone()
            const errorText = await clone.text()
            const lowerError = errorText.toLowerCase()
            
            if (lowerError.includes('expire') || 
                lowerError.includes('unauthorized') || 
                lowerError.includes('token') || 
                lowerError.includes('jwt') ||
                lowerError.includes('auth')) {
                
                console.warn('[FetchInterceptor] 500 Auth Error detected. Initiating logout...')
                await handleLogout(currentPath, `500 Error: ${errorText}`)
                return new Promise(() => {}) 
            }
          } catch (err) {
            console.error('[FetchInterceptor] Failed to inspect 500 response', err)
          }
      }

      return response
    } catch (error) {
      console.error(`[FetchInterceptor] Network Error attempting to fetch: ${url}`, error)
      throw error
    }
  }
}

async function handleLogout(currentPath, reason) {
  console.warn(`[FetchInterceptor] Logging out. Reason: ${reason}`)
  
  // Clear auth data
  localStorage.removeItem('token')
  localStorage.removeItem('admin')
  localStorage.removeItem('userData') 
  
  // Determine language from URL (default to 'en')
  const pathSegments = currentPath.split('/')
  const lang = (pathSegments[1] && pathSegments[1].length === 2) ? pathSegments[1] : 'en'
  
  const targetUrl = `/${lang}/login`
  
  console.log(`[FetchInterceptor] Redirecting to: ${targetUrl}`)
  
  // Force hard redirect
  window.location.href = targetUrl
  
  // Wait a bit to ensure browser starts navigation
  await new Promise(resolve => setTimeout(resolve, 10000))
}

const FetchInterceptor = () => {
  return null
}

export default FetchInterceptor
