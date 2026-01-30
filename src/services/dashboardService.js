import { getApiBase, getHeaders } from '@/utils/getApiBase'

export const getDashboardCount = async () => {
    const res = await fetch(`${getApiBase()}/admin/dashboard`, {
        headers: getHeaders()
    })
    return res.json()
}

export const getTopSellingProducts = async (limit = 10) => {
    const res = await fetch(`${getApiBase()}/admin/product/topSellingProducts?limit=${limit}`, {
        headers: getHeaders()
    })
    return res.json()
}

export const getPopularProducts = async (limit = 10) => {
    const res = await fetch(`${getApiBase()}/admin/product/popularProducts?limit=${limit}`, {
        headers: getHeaders()
    })
    return res.json()
}

export const getTopSellers = async (start = 1, limit = 10) => {
    const res = await fetch(`${getApiBase()}/admin/seller/topSellers?start=${start}&limit=${limit}`, {
        headers: getHeaders()
    })
    return res.json()
}

export const getTopCustomers = async () => {
    const res = await fetch(`${getApiBase()}/admin/user/topCustomers`, {
        headers: getHeaders()
    })
    return res.json()
}

export const getRecentOrders = async () => {
    const res = await fetch(`${getApiBase()}/admin/order/recentOrders`, {
        headers: getHeaders()
    })
    return res.json()
}

export const getUserChartAnalytics = async (startDate = 'All', endDate = 'All') => {
    const res = await fetch(`${getApiBase()}/admin/dashboard/chartAnalyticOfUsers?startDate=${startDate}&endDate=${endDate}`, {
        headers: getHeaders()
    })
    return res.json()
}

export const getRevenueAnalytics = async (startDate, endDate) => {
    const res = await fetch(`${getApiBase()}/admin/dashboard/revenueAnalyticsChartData?startDate=${startDate}&endDate=${endDate}`, {
        headers: getHeaders()
    })
    return res.json()
}
