import { getApiBase } from '@/utils/getApiBase'

/**
 * Login Service - API functions for authentication
 */

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} Login response
 */
export const login = async (email, password) => {
  try {
    const res = await fetch(`${getApiBase()}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    })

    const result = await res.json()
    return { ok: res.ok, result }
  } catch (error) {
    console.error('Login error:', error)
    throw error
  }
}
