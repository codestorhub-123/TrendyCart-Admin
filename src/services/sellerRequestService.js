import { getApiBase, getHeaders } from '@/utils/getApiBase'

const getJsonHeaders = () => {
  return {
    ...getHeaders(),
    'Content-Type': 'application/json'
  }
}

// Get all seller requests
export const getAllSellerRequests = async (page = 1, limit = 20) => {
  const url = `${getApiBase()}/admin/sellerRequest/?page=${page}&limit=${limit}`
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: getJsonHeaders()
    })
    return res.json()
  } catch (error) {
    console.error('sellerRequestService: getAllSellerRequests failed:', error)
    return { status: false, message: error.message }
  }
}

// Accept or decline a seller request
export const acceptOrNotSellerRequest = async (requestId, action) => {
  const url = `${getApiBase()}/admin/sellerRequest/acceptOrNot?requestId=${requestId}&action=${action}`
  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: getJsonHeaders()
    })
    return res.json()
  } catch (error) {
    console.error('sellerRequestService: acceptOrNotSellerRequest failed:', error)
    return { status: false, message: error.message }
  }
}
