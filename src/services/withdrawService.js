import { getApiBase, getHeaders } from '@/utils/getApiBase'

const getJsonHeaders = () => {
  return {
    ...getHeaders(),
    'Content-Type': 'application/json'
  }
}

// Create withdrawal method
export const createWithdrawMethod = async (formData) => {
  const url = `${getApiBase()}/admin/withdraw/create`
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: getHeaders(), // No Content-Type for FormData
      body: formData
    })
    return res.json()
  } catch (error) {
    console.error('withdrawService: createWithdrawMethod failed:', error)
    return { status: false, message: error.message }
  }
}

// Update withdrawal method
export const updateWithdrawMethod = async (withdrawId, formData) => {
  const url = `${getApiBase()}/admin/withdraw/update?withdrawId=${withdrawId}`
  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: getHeaders(), // No Content-Type for FormData
      body: formData
    })
    return res.json()
  } catch (error) {
    console.error('withdrawService: updateWithdrawMethod failed:', error)
    return { status: false, message: error.message }
  }
}

// Get withdrawal methods
export const getWithdrawMethods = async () => {
  const url = `${getApiBase()}/admin/withdraw/`
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: getJsonHeaders()
    })
    return res.json()
  } catch (error) {
    console.error('withdrawService: getWithdrawMethods failed:', error)
    return { status: false, message: error.message }
  }
}

// Delete withdrawal method
export const deleteWithdrawMethod = async (withdrawId) => {
  const url = `${getApiBase()}/admin/withdraw/?withdrawId=${withdrawId}`
  try {
    const res = await fetch(url, {
      method: 'DELETE',
      headers: getJsonHeaders()
    })
    return res.json()
  } catch (error) {
    console.error('withdrawService: deleteWithdrawMethod failed:', error)
    return { status: false, message: error.message }
  }
}

// Enable/Disable withdrawal method
export const toggleWithdrawMethod = async (withdrawId) => {
  const url = `${getApiBase()}/admin/withdraw/handleSwitch?withdrawId=${withdrawId}`
  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: getJsonHeaders()
    })
    return res.json()
  } catch (error) {
    console.error('withdrawService: toggleWithdrawMethod failed:', error)
    return { status: false, message: error.message }
  }
}

// Get active withdrawal methods
export const getActiveWithdrawMethods = async () => {
  const url = `${getApiBase()}/admin/withdraw/withdrawalList`
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: getJsonHeaders()
    })
    return res.json()
  } catch (error) {
    console.error('withdrawService: getActiveWithdrawMethods failed:', error)
    return { status: false, message: error.message }
  }
}
