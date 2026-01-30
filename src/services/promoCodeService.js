import { getApiBase, getHeaders } from '@/utils/getApiBase'

const getJsonHeaders = () => {
  return {
    ...getHeaders(),
    'Content-Type': 'application/json'
  }
}

export const getAllPromoCodes = async () => {
  const url = `${getApiBase()}/admin/promoCode/getAll`
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: getJsonHeaders()
    })
    return res.json()
  } catch (error) {
    console.error('promoCodeService: getAllPromoCodes failed:', error)
    return { status: false, message: error.message }
  }
}

export const createPromoCode = async (data) => {
  const url = `${getApiBase()}/admin/promoCode/create`
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: getJsonHeaders(),
      body: JSON.stringify(data)
    })
    return res.json()
  } catch (error) {
    console.error('promoCodeService: createPromoCode failed:', error)
    return { status: false, message: error.message }
  }
}

export const updatePromoCode = async (data, promoCodeId) => {
  const url = `${getApiBase()}/admin/promoCode/update?promoCodeId=${promoCodeId}`
  try {
    const res = await fetch(url, {
      method: 'POST', // Based on the user provided swagger/route
      headers: getJsonHeaders(),
      body: JSON.stringify(data)
    })
    return res.json()
  } catch (error) {
    console.error('promoCodeService: updatePromoCode failed:', error)
    return { status: false, message: error.message }
  }
}

export const deletePromoCode = async (promoCodeId) => {
  const url = `${getApiBase()}/admin/promoCode/delete?promoCodeId=${promoCodeId}`
  try {
    const res = await fetch(url, {
      method: 'DELETE',
      headers: getJsonHeaders()
    })
    return res.json()
  } catch (error) {
    console.error('promoCodeService: deletePromoCode failed:', error)
    return { status: false, message: error.message }
  }
}
