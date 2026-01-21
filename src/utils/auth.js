/**
 * Auth utility functions for localStorage token management
 */

/**
 * Get the authentication token from localStorage
 * @returns {string|null} The auth token or null if not found
 */
export const getAuthToken = () => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('authToken')
}

/**
 * Set the authentication token in localStorage
 * @param {string} token - The auth token to store
 */
export const setAuthToken = token => {
  if (typeof window === 'undefined') return
  if (token) {
    localStorage.setItem('authToken', token)
  } else {
    localStorage.removeItem('authToken')
  }
}

/**
 * Get user data from localStorage
 * @returns {object|null} The user object or null if not found
 */
export const getUserData = () => {
  if (typeof window === 'undefined') return null
  const userStr = localStorage.getItem('user')
  if (!userStr) return null
  try {
    return JSON.parse(userStr)
  } catch (error) {
    console.error('Error parsing user data from localStorage:', error)
    return null
  }
}

/**
 * Set user data in localStorage
 * @param {object} userData - The user object to store
 */
export const setUserData = userData => {
  if (typeof window === 'undefined') return
  if (userData) {
    localStorage.setItem('user', JSON.stringify(userData))
  } else {
    localStorage.removeItem('user')
  }
}

/**
 * Clear all authentication data from localStorage
 */
export const clearAuthData = () => {
  if (typeof window === 'undefined') return
  localStorage.removeItem('authToken')
  localStorage.removeItem('user')
}

/**
 * Check if user is authenticated (has token in localStorage)
 * @returns {boolean} True if token exists, false otherwise
 */
export const isAuthenticated = () => {
  return !!getAuthToken()
}

