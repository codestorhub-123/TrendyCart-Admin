import { getApiBase, getHeaders } from '@/utils/getApiBase'

const getJsonHeaders = () => {
  return {
    ...getHeaders(),
    'Content-Type': 'application/json'
  }
}

// Get total admin earnings and history
export const fetchAdminEarnings = async (start = 1, limit = 10, startDate = 'All', endDate = 'All') => {
  const url = `${getApiBase()}/admin/sellerWallet/fetchAdminEarnings?start=${start}&limit=${limit}&startDate=${startDate}&endDate=${endDate}`
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: getJsonHeaders()
    })
    return res.json()
  } catch (error) {
    console.error('earningService: fetchAdminEarnings failed:', error)
    return { status: false, message: error.message }
  }
}

// Get wallet transactions for a specific seller
export const retrieveSellerTransactions = async (sellerId, type, start = 1, limit = 10, startDate = 'All', endDate = 'All') => {
  let url = `${getApiBase()}/admin/sellerWallet/retrieveSellerTransactions?sellerId=${sellerId}&start=${start}&limit=${limit}&startDate=${startDate}&endDate=${endDate}`
  if (type) {
    url += `&type=${type}`
  }
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: getJsonHeaders()
    })
    return res.json()
  } catch (error) {
    console.error('earningService: retrieveSellerTransactions failed:', error)
    return { status: false, message: error.message }
  }
}
