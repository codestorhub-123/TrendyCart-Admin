import { getApiBase } from '@/utils/getApiBase'

const getHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  }
}

export const getAllPromoCodes = async () => {
  const url = `${getApiBase()}/admin/promoCode/getAll`
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: getHeaders()
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
      headers: getHeaders(),
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
      headers: getHeaders(),
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
      headers: getHeaders()
    })
    return res.json()
  } catch (error) {
    console.error('promoCodeService: deletePromoCode failed:', error)
    return { status: false, message: error.message }
  }
}
