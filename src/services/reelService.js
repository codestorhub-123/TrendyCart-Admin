
import { getApiBase, getHeaders } from '@/utils/getApiBase'

export const getReels = async (queryParams = {}) => {
  const params = new URLSearchParams(queryParams).toString()
  try {
    const response = await fetch(`${getApiBase()}/admin/reel/getReels?${params}`, {
      method: 'GET',
      headers: getHeaders()
    })
    return await response.json()
  } catch (error) {
    console.error('Error fetching reels:', error)
    return { status: false, message: error.message }
  }
}

export const getRealReels = async (queryParams = {}) => {
  const params = new URLSearchParams(queryParams).toString()
  try {
    const response = await fetch(`${getApiBase()}/admin/reel/getRealReels?${params}`, {
      method: 'GET',
      headers: getHeaders()
    })
    return await response.json()
  } catch (error) {
    console.error('Error fetching real reels:', error)
    return { status: false, message: error.message }
  }
}

export const detailsOfReel = async (reelId) => {
  try {
    const response = await fetch(`${getApiBase()}/admin/reel/detailsOfReel?reelId=${reelId}`, {
      method: 'GET',
      headers: getHeaders()
    })
    if (!response.ok) throw new Error(response.statusText || 'Failed to fetch details')
    return await response.json()
  } catch (error) {
    console.error('Error fetching reel details:', error)
    return { status: false, message: error.message }
  }
}

export const likeHistoryOfReel = async (reelId) => {
  try {
    const response = await fetch(`${getApiBase()}/admin/reel/likeHistoryOfReel?reelId=${reelId}`, {
      method: 'GET',
      headers: getHeaders()
    })
    if (!response.ok) throw new Error(response.statusText || 'Failed to fetch like history')
    return await response.json()
  } catch (error) {
    console.error('Error fetching reel like history:', error)
    return { status: false, message: error.message }
  }
}

export const deleteReel = async (reelId) => {
  try {
    const response = await fetch(`${getApiBase()}/admin/reel/deleteReel?reelId=${reelId}`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    if (!response.ok) throw new Error(response.statusText || 'Failed to delete reel')
    return await response.json()
  } catch (error) {
    console.error('Error deleting reel:', error)
    return { status: false, message: error.message }
  }
}

export const createReel = async (formData) => {
  try {
    const response = await fetch(`${getApiBase()}/admin/reel/uploadReelByAdmin`, {
      method: 'POST',
      headers: {
        ...getHeaders(),
      },
      body: formData
    })
    if (!response.ok) throw new Error(response.statusText || 'Failed to create reel')
    return await response.json()
  } catch (error) {
    console.error('Error creating reel:', error)
    return { status: false, message: error.message }
  }
}

export const updateReel = async (formData, reelId, sellerId) => {
  try {
    const url = `${getApiBase()}/admin/reel/updateReelByAdmin?reelId=${reelId}&sellerId=${sellerId}`
    console.log('Update Reel URL:', url)
    const response = await fetch(url, {
      method: 'PATCH', 
      headers: {
         ...getHeaders()
      },
      body: formData
    })
    if (!response.ok) throw new Error(response.statusText || 'Failed to update reel')
    return await response.json()
  } catch (error) {
    console.error('Error updating reel:', error)
    return { status: false, message: error.message }
  }
}

export const reportsOfReel = async (queryParams = {}) => {
  const params = new URLSearchParams(queryParams).toString()
  try {
    const response = await fetch(`${getApiBase()}/admin/reportoReel/reportsOfReel?${params}`, {
      method: 'GET',
      headers: getHeaders()
    })
    return await response.json()
  } catch (error) {
    console.error('Error fetching reports:', error)
    return { status: false, message: error.message }
  }
}

export const resolveReport = async (reportId) => {
  try {
    const response = await fetch(`${getApiBase()}/admin/reportoReel/resolveReport?reportId=${reportId}`, {
      method: 'PATCH',
      headers: getHeaders()
    })
    return await response.json()
  } catch (error) {
    console.error('Error resolving report:', error)
    return { status: false, message: error.message }
  }
}

export const deleteReport = async (reportId) => {
  try {
    const url = `${getApiBase()}/admin/reportoReel/deleteReport?reportId=${reportId}`
    const response = await fetch(url, {
      method: 'DELETE',
      headers: getHeaders()
    })
    return await response.json()
  } catch (error) {
    console.error('Error deleting report:', error)
    return { status: false, message: error.message }
  }
}

