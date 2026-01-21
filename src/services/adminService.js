import { getApiBase, getHeaders } from '@/utils/getApiBase'

/**
 * Admin Service - API functions for logged-in admin profile management
 */

const getJsonHeaders = () => {
  return {
    ...getHeaders(),
    'Content-Type': 'application/json'
  }
}

const getMultipartHeaders = () => {
    // Content-Type is set automatically by browser for FormData
    // We only need the Authorization header
    return {
        ...getHeaders()
    }
}

/**
 * Retrieve the logged-in admin's profile
 * @returns {Promise<Object>}
 */
export const getProfile = async () => {
  try {
    const res = await fetch(`${getApiBase()}/admin/profile`, {
      method: 'GET',
      headers: getJsonHeaders()
    })
    return res.json()
  } catch (error) {
    console.error('adminService: getProfile error:', error)
    return { status: false, message: error.message }
  }
}

/**
 * Update admin name and email
 * @param {Object} data - { username, email }
 * @returns {Promise<Object>}
 */
export const updateProfile = async (data) => {
  try {
    const res = await fetch(`${getApiBase()}/admin/updateProfile`, {
      method: 'PATCH',
      headers: getJsonHeaders(),
      body: JSON.stringify(data)
    })
    return res.json()
  } catch (error) {
    console.error('adminService: updateProfile error:', error)
    return { status: false, message: error.message }
  }
}

/**
 * Update admin profile image
 * @param {FormData} formData - FormData object containing 'image' file
 * @returns {Promise<Object>}
 */
export const updateImage = async (formData) => {
  try {
    const res = await fetch(`${getApiBase()}/admin/updateImage`, {
      method: 'PATCH',
      headers: getMultipartHeaders(),
      body: formData
    })
    return res.json()
  } catch (error) {
    console.error('adminService: updateImage error:', error)
    return { status: false, message: error.message }
  }
}

/**
 * Send a forgot password email
 * @param {string} email
 * @returns {Promise<Object>}
 */
export const forgotPassword = async (email) => {
  try {
    const res = await fetch(`${getApiBase()}/admin/forgotPassword`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json' // Likely no auth needed for this one, but user didn't specify. 
                                           // Usually forgot password is public. But the swagger desc says "Admin Auth" tag, security is not listed in snippet.
                                           // Let's assume public.
      },
      body: JSON.stringify({ email })
    })
    return res.json()
  } catch (error) {
    console.error('adminService: forgotPassword error:', error)
    return { status: false, message: error.message }
  }
}

/**
 * Update the logged-in admin's password
 * @param {Object} data - { oldPassword, newPassword }
 * @returns {Promise<Object>}
 */
export const updatePassword = async (data) => {
  try {
    const res = await fetch(`${getApiBase()}/admin/updatePassword`, {
      method: 'PATCH',
      headers: getJsonHeaders(),
      body: JSON.stringify(data)
    })
    return res.json()
  } catch (error) {
    console.error('adminService: updatePassword error:', error)
    return { status: false, message: error.message }
  }
}
