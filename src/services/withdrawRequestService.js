import { getApiBase, getHeaders } from '@/utils/getApiBase'

const getJsonHeaders = () => {
  return {
    ...getHeaders(),
    'Content-Type': 'application/json'
  }
}

// List all withdrawal requests
export const listWithdrawalRequests = async (start = 1, limit = 10, type = '', startDate = 'All', endDate = 'All') => {
  const url = `${getApiBase()}/admin/withdrawRequest/listWithdrawalRequests?start=${start}&limit=${limit}${type ? `&type=${type}` : ''}&startDate=${startDate}&endDate=${endDate}`
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: getJsonHeaders()
    })
    return res.json()
  } catch (error) {
    console.error('withdrawRequestService: listWithdrawalRequests failed:', error)
    return { status: false, message: error.message }
  }
}

// Approve a withdrawal request
export const approveWithdrawalRequest = async (requestId) => {
  const url = `${getApiBase()}/admin/withdrawRequest/approveWithdrawalRequest`
  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: getJsonHeaders(),
      body: JSON.stringify({ requestId })
    })
    return res.json()
  } catch (error) {
    console.error('withdrawRequestService: approveWithdrawalRequest failed:', error)
    return { status: false, message: error.message }
  }
}

// Reject a withdrawal request
export const rejectWithdrawalRequest = async (requestId, reason) => {
  const url = `${getApiBase()}/admin/withdrawRequest/rejectWithdrawalRequest`
  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: getJsonHeaders(),
      body: JSON.stringify({ requestId, reason })
    })
    return res.json()
  } catch (error) {
    console.error('withdrawRequestService: rejectWithdrawalRequest failed:', error)
    return { status: false, message: error.message }
  }
}
