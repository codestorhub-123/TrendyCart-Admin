import { getApiBase } from '@/utils/getApiBase'

const getHeaders = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    return {
      Authorization: `Bearer ${token}`
    }
  }
  return {}
}

// Send notification to a specific seller
export const sendNotificationToSeller = async (formData) => {
  const url = `${getApiBase()}/admin/notification/particularSeller`
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: getHeaders(), 
      body: formData
    })
    return res.json()
  } catch (error) {
    console.error('notificationService: sendNotificationToSeller failed:', error)
    return { status: false, message: error.message }
  }
}

// Send notification to all users/sellers/both
export const sendNotification = async (formData) => {
  const url = `${getApiBase()}/admin/notification/send`
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: formData
    })
    return res.json()
  } catch (error) {
    console.error('notificationService: sendNotification failed:', error)
    return { status: false, message: error.message }
  }
}
