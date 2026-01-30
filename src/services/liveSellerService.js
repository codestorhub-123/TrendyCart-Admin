import { getApiBase, getHeaders } from '@/utils/getApiBase'

const getJsonHeaders = () => {
  return {
    ...getHeaders(),
    'Content-Type': 'application/json'
  }
}

// Get list of all live sellers
export const getLiveSellerList = async (page = 1, limit = 20) => {
  const url = `${getApiBase()}/admin/liveSeller/liveSellerList?page=${page}&limit=${limit}`
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: getJsonHeaders()
    })
    return res.json()
  } catch (error) {
    console.error('liveSellerService: getLiveSellerList failed:', error)
    return { status: false, message: error.message }
  }
}
