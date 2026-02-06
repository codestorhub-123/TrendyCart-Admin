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

export const updateUserCoins = async (userId, coins) => {
    const res = await fetch(`${getApiBase()}/admin/user/updateCoins`, {
        method: 'PATCH',
        headers: getJsonHeaders(),
        body: JSON.stringify({ userId, coins })
    })

    return res.json()
}

export const getUserInfo = getUserById

export const getSpendingHistory = async (userId, page = 1, limit = 10) => {
    const res = await fetch(`${getApiBase()}/admin/user/spendingHistory?userId=${userId}&page=${page}&limit=${limit}`, {
        headers: getHeaders()
    })

    return res.json()
}

export const getTopUpHistory = async (userId, page = 1, limit = 10) => {
    const res = await fetch(`${getApiBase()}/admin/user/topUpHistory?userId=${userId}&page=${page}&limit=${limit}`, {
        headers: getHeaders()
    })

    return res.json()
}

export const fetchDashboardData = async () => {
    const res = await fetch(`${getApiBase()}/admin/dashboard/chart-data`, {
        headers: getHeaders()
    })

    return res.json()
}

export const getBanners = async () => {
    const res = await fetch(`${getApiBase()}/admin/banner`, { headers: getHeaders() })

    return res.json()
}

export const deleteBanner = async (id) => {
    const res = await fetch(`${getApiBase()}/admin/banner/delete?bannerId=${id}`, { method: 'DELETE', headers: getHeaders() })

    return res.json()
}

export const getAllCoinPlans = async () => {
    const res = await fetch(`${getApiBase()}/admin/coinPlan`, { headers: getHeaders() })

    return res.json()
}

export const createCoinPlan = async (data) => {
    const res = await fetch(`${getApiBase()}/admin/coinPlan/create`, {
        method: 'POST',
        headers: getJsonHeaders(),
        body: JSON.stringify(data)
    })

    return res.json()
}

export const updateCoinPlan = async (id, data) => {
     const res = await fetch(`${getApiBase()}/admin/coinPlan/update?planId=${id}`, {
        method: 'PATCH',
        headers: getJsonHeaders(),
        body: JSON.stringify(data)
    })

    return res.json()
}

export const deleteCoinPlan = async (id) => {
    const res = await fetch(`${getApiBase()}/admin/coinPlan/delete?planId=${id}`, { method: 'DELETE', headers: getHeaders() })

    return res.json()
}

export const getAllComplains = async () => {
    const res = await fetch(`${getApiBase()}/admin/complain`, { headers: getHeaders() })

    return res.json()
}

export const resolveComplaint = async (id) => {
    const res = await fetch(`${getApiBase()}/admin/complain/resolve?complainId=${id}`, { method: 'PATCH', headers: getHeaders() })

    return res.json()
}

export const getAllGift = async () => {
     const res = await fetch(`${getApiBase()}/admin/gift`, { headers: getHeaders() })

    return res.json()
}

export const getGiftCategories = async () => {
     const res = await fetch(`${getApiBase()}/admin/giftCategory`, { headers: getHeaders() })

    return res.json()
}

export const deleteGiftCategory = async (id) => {
     const res = await fetch(`${getApiBase()}/admin/giftCategory/delete?categoryId=${id}`, { method: 'DELETE', headers: getHeaders() })

    return res.json()
}

export const getHosts = async () => {
    const res = await fetch(`${getApiBase()}/admin/host`, { headers: getHeaders() })

    return res.json()
}

export const getUserInfoAndNavigate = async (userId) => {
    return getUserById(userId)
}

export const fetchHostRequests = async () => {
    const res = await fetch(`${getApiBase()}/admin/hostRequest`, { headers: getHeaders() })

    return res.json()
}

export const updateHostRequestStatus = async (id, status) => {
    const res = await fetch(`${getApiBase()}/admin/hostRequest/update?requestId=${id}`, {
        method: 'PATCH',
        headers: getJsonHeaders(),
        body: JSON.stringify({ status })
    })

    return res.json()
}

// Placeholder since exact API unknown
export const fetchAgencies = async () => {
    const res = await fetch(`${getApiBase()}/admin/agency`, { headers: getHeaders() })

    return res.json().catch(() => ({ status: true, data: [] }))
}

export const getWithdrawals = async () => {
     const res = await fetch(`${getApiBase()}/admin/withdraw`, { headers: getHeaders() })

    return res.json()
}

export const handleWithdrawAction = async (id, action) => {
     const res = await fetch(`${getApiBase()}/admin/withdraw/action?withdrawId=${id}`, {
        method: 'PATCH',
        headers: getJsonHeaders(),
        body: JSON.stringify({ action })
    })

    return res.json()
}

export const getAllLanguages = async () => {
    const res = await fetch(`${getApiBase()}/admin/language`, { headers: getHeaders() })

    return res.json()
}

export const deleteLanguage = async (id) => {
    const res = await fetch(`${getApiBase()}/admin/language/delete?languageId=${id}`, { method: 'DELETE', headers: getHeaders() })

    return res.json()
}

export const getAllLevels = async () => {
     const res = await fetch(`${getApiBase()}/admin/level`, { headers: getHeaders() })

    return res.json()
}

export const deleteLevel = async (id) => {
     const res = await fetch(`${getApiBase()}/admin/level/delete?levelId=${id}`, { method: 'DELETE', headers: getHeaders() })

    return res.json()
}
