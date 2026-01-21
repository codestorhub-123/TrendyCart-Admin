import { getApiBase } from '@/utils/getApiBase'

const getHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
}

// Get list of all live sellers
export const getLiveSellerList = async (page = 1, limit = 20) => {
  const url = `${getApiBase()}/admin/liveSeller/liveSellerList?page=${page}&limit=${limit}`
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: getHeaders()
    })
    return res.json()
  } catch (error) {
    console.error('liveSellerService: getLiveSellerList failed:', error)
    return { status: false, message: error.message }
  }
}
