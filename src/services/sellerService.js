import { getApiBase } from '@/utils/getApiBase'

const getHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    Authorization: `Bearer ${token}`
  }
}

const getJsonHeaders = () => {
  return {
    ...getHeaders(),
    'Content-Type': 'application/json'
  }
}

// Get list of all real sellers
export const getRealSeller = async (page = 1, limit = 10) => {
  const url = `${getApiBase()}/admin/seller/getRealSeller?page=${page}&limit=${limit}`
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: getJsonHeaders()
    })
    return res.json()
  } catch (error) {
    console.error('sellerService: getRealSeller failed:', error)
    return { status: false, message: error.message }
  }
}

// Get a specific seller's profile
export const getProfileByAdmin = async (sellerId) => {
  const url = `${getApiBase()}/admin/seller/getProfileByAdmin?sellerId=${sellerId}`
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: getJsonHeaders()
    })
    return res.json()
  } catch (error) {
    console.error('sellerService: getProfileByAdmin failed:', error)
    return { status: false, message: error.message }
  }
}

// Update a real seller's profile
export const updateSellerProfile = async (sellerId, formData) => {
  const url = `${getApiBase()}/admin/seller/update?sellerId=${sellerId}`
  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: getHeaders(),
      body: formData
    })
    return res.json()
  } catch (error) {
    console.error('sellerService: updateSellerProfile failed:', error)
    return { status: false, message: error.message }
  }
}

// Block or unblock a seller
export const blockUnblockSeller = async (sellerId) => {
  const url = `${getApiBase()}/admin/seller/blockUnblock?sellerId=${sellerId}`
  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: getJsonHeaders()
    })
    return res.json()
  } catch (error) {
    console.error('sellerService: blockUnblockSeller failed:', error)
    return { status: false, message: error.message }
  }
}

// Get top sellers for the dashboard
export const getTopSellers = async (start = 1, limit = 10) => {
  const url = `${getApiBase()}/admin/seller/topSellers?start=${start}&limit=${limit}`
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: getJsonHeaders()
    })
    return res.json()
  } catch (error) {
    console.error('sellerService: getTopSellers failed:', error)
    return { status: false, message: error.message }
  }
}

// Get seller wallet information
export const getSellerWallet = async (sellerId = '') => {
  const url = `${getApiBase()}/admin/seller/sellerWallet${sellerId ? `?sellerId=${sellerId}` : ''}`
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: getJsonHeaders()
    })
    return res.json()
  } catch (error) {
    console.error('sellerService: getSellerWallet failed:', error)
    return { status: false, message: error.message }
  }
}

// Create a fake seller account
export const createFakeSeller = async (formData) => {
  const url = `${getApiBase()}/admin/seller/createFakeSeller`
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: formData
    })
    return res.json()
  } catch (error) {
    console.error('sellerService: createFakeSeller failed:', error)
    return { status: false, message: error.message }
  }
}

// Update a fake seller's profile
export const updateFakeSellerProfile = async (sellerId, formData) => {
  const url = `${getApiBase()}/admin/seller/updateFakeSellerProfile?sellerId=${sellerId}`
  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: getHeaders(),
      body: formData
    })
    return res.json()
  } catch (error) {
    console.error('sellerService: updateFakeSellerProfile failed:', error)
    return { status: false, message: error.message }
  }
}

// Toggle live status for a fake seller
export const toggleLiveOrNot = async (sellerId, productId = '') => {
  const url = `${getApiBase()}/admin/seller/liveOrNot?sellerId=${sellerId}${productId ? `&productId=${productId}` : ''}`
  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: getJsonHeaders()
    })
    return res.json()
  } catch (error) {
    console.error('sellerService: toggleLiveOrNot failed:', error)
    return { status: false, message: error.message }
  }
}

// Get list of all fake sellers
export const getFakeSeller = async (page = 1, limit = 10) => {
  const url = `${getApiBase()}/admin/seller/getFakeSeller?page=${page}&limit=${limit}`
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: getJsonHeaders()
    })
    return res.json()
  } catch (error) {
    console.error('sellerService: getFakeSeller failed:', error)
    return { status: false, message: error.message }
  }
}

// Get simple list of fake sellers
export const getFakeSellersDropdown = async () => {
  const url = `${getApiBase()}/admin/seller/fakeSellers`
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: getJsonHeaders()
    })
    return res.json()
  } catch (error) {
    console.error('sellerService: getFakeSellersDropdown failed:', error)
    return { status: false, message: error.message }
  }
}

// Delete a fake seller
export const deleteSeller = async (sellerId) => {
  const url = `${getApiBase()}/admin/seller/deleteSeller?sellerId=${sellerId}`
  try {
    const res = await fetch(url, {
      method: 'DELETE',
      headers: getJsonHeaders()
    })
    return res.json()
  } catch (error) {
    console.error('sellerService: deleteSeller failed:', error)
    return { status: false, message: error.message }
  }
}

