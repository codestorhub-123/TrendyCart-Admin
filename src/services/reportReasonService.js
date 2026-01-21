
import { getApiBase, getHeaders } from '@/utils/getApiBase'

export const getReportReasons = async (start = 0, limit = 10) => {
  try {
    const response = await fetch(`${getApiBase()}/admin/reportReason/getReportreason?start=${start}&limit=${limit}`, {
      method: 'GET',
      headers: getHeaders()
    })
    return await response.json()
  } catch (error) {
    console.error('Error fetching report reasons:', error)
    return { status: false, message: error.message }
  }
}

export const createReportReason = async (data) => {
  try {
    const response = await fetch(`${getApiBase()}/admin/reportReason/createReportreason`, {
      method: 'POST',
      headers: {
        ...getHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    return await response.json()
  } catch (error) {
    console.error('Error creating report reason:', error)
    return { status: false, message: error.message }
  }
}

export const updateReportReason = async (id, data) => {
  try {
    const response = await fetch(`${getApiBase()}/admin/reportReason/updateReportreason?reportReasonId=${id}`, {
      method: 'PATCH',
      headers: {
        ...getHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    return await response.json()
  } catch (error) {
    console.error('Error updating report reason:', error)
    return { status: false, message: error.message }
  }
}

export const deleteReportReason = async (id) => {
  try {
    const response = await fetch(`${getApiBase()}/admin/reportReason/deleteReportreason?reportReasonId=${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    return await response.json()
  } catch (error) {
    console.error('Error deleting report reason:', error)
    return { status: false, message: error.message }
  }
}
