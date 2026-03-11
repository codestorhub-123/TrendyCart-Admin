import { getApiBase, getHeaders } from '@/utils/getApiBase'

export const getProductRequestsByStatus = async (status) => {
  const url = `${getApiBase()}/admin/productRequest/updateProductRequestStatusWise?status=${status}`
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: getHeaders()
    })
    return res.json()
  } catch (error) {
    console.error('productRequestService: getProductRequestsByStatus failed:', error)
    return { status: false, message: error.message }
  }
}

export const acceptOrRejectRequest = async (requestId, type, rejectionReason) => {
  const url = `${getApiBase()}/admin/productRequest/acceptUpdateRequest?requestId=${requestId}`
  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        ...getHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ type, rejectionReason })
    })
    return res.json()
  } catch (error) {
    console.error('productRequestService: acceptOrRejectRequest failed:', error)
    return { status: false, message: error.message }
  }
}

export const acceptCreateRequest = async (productId, type, rejectionReason) => {
  const url = `${getApiBase()}/admin/productRequest/acceptCreateRequest?productId=${productId}`
  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        ...getHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ type, rejectionReason })
    })
    return res.json()
  } catch (error) {
    console.error('productRequestService: acceptCreateRequest failed:', error)
    return { status: false, message: error.message }
  }
}

export const getCreateProductRequestsByStatus = async (status) => {
  const url = `${getApiBase()}/admin/productRequest/createProductRequestStatusWise?status=${status}`
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: getHeaders()
    })
    return res.json()
  } catch (error) {
    console.error('productRequestService: getCreateProductRequestsByStatus failed:', error)
    return { status: false, message: error.message }
  }
}
