import { getApiBase, getHeaders } from '@/utils/getApiBase'

const getJsonHeaders = () => {
  return {
    ...getHeaders(),
    'Content-Type': 'application/json'
  }
}

export const getAllUsers = async (pageIndex, pageSize) => {
    const page = pageIndex + 1
    const res = await fetch(`${getApiBase()}/admin/user?page=${page}&limit=${pageSize}`, {
        headers: getHeaders()
    })
    return res.json()
}

export const getUserById = async (id) => {
    const res = await fetch(`${getApiBase()}/admin/user/getProfile?userId=${id}`, { headers: getHeaders() })
    return res.json()
}

export const getOrdersOfUser = async (id) => {
    const res = await fetch(`${getApiBase()}/admin/order/ordersOfUser?userId=${id}&status=All&start=1&limit=10`, { headers: getHeaders() })
    return res.json()
}

export const blockUnblockUser = async (userId) => {
    const res = await fetch(`${getApiBase()}/admin/user/blockUnblock?userId=${userId}`, {
        method: 'PATCH',
        headers: getHeaders()
    })
    return res
}

