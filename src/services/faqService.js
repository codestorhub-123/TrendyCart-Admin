import { getApiBase, getHeaders } from '@/utils/getApiBase'

const getJsonHeaders = () => {
  return {
    ...getHeaders(),
    'Content-Type': 'application/json'
  }
}

// Get all FAQs
export const getFAQs = async () => {
  const url = `${getApiBase()}/admin/FAQ/`
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: getJsonHeaders()
    })
    return res.json()
  } catch (error) {
    console.error('faqService: getFAQs failed:', error)
    return { status: false, message: error.message }
  }
}

// Create a new FAQ
export const createFAQ = async (data) => {
  const url = `${getApiBase()}/admin/FAQ/create`
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: getJsonHeaders(),
      body: JSON.stringify(data)
    })
    return res.json()
  } catch (error) {
    console.error('faqService: createFAQ failed:', error)
    return { status: false, message: error.message }
  }
}

// Update an existing FAQ
export const updateFAQ = async (faqId, data) => {
  const url = `${getApiBase()}/admin/FAQ/update?faqId=${faqId}`
  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: getJsonHeaders(),
      body: JSON.stringify(data)
    })
    return res.json()
  } catch (error) {
    console.error('faqService: updateFAQ failed:', error)
    return { status: false, message: error.message }
  }
}

// Delete an FAQ
export const deleteFAQ = async (faqId) => {
  const url = `${getApiBase()}/admin/FAQ/delete?faqId=${faqId}`
  try {
    const res = await fetch(url, {
      method: 'DELETE',
      headers: getJsonHeaders()
    })
    return res.json()
  } catch (error) {
    console.error('faqService: deleteFAQ failed:', error)
    return { status: false, message: error.message }
  }
}
