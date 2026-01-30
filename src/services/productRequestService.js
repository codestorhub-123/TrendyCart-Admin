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

export const acceptOrRejectRequest = async (requestId, type) => {
  const url = `${getApiBase()}/admin/productRequest/acceptUpdateRequest?requestId=${requestId}&type=${type}`
  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: getHeaders()
    })
    return res.json()
  } catch (error) {
    console.error('productRequestService: acceptOrRejectRequest failed:', error)
    return { status: false, message: error.message }
  }
}

export const acceptCreateRequest = async (productId, type) => {
  const url = `${getApiBase()}/admin/productRequest/acceptCreateRequest?productId=${productId}&type=${type}`
  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: getHeaders()
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
