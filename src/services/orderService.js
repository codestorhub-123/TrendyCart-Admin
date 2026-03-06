import axios from 'axios'
import { getApiBase } from '@/utils/getApiBase'

/**
 * Get details of a specific order
 * @param {string} orderId 
 * @returns {Promise}
 */
export const getOrderDetails = async (orderId) => {
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get(`${getApiBase()}/admin/order/orderDetails?orderId=${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return response.data
  } catch (error) {
    console.error('Error fetching order details:', error)
    throw error
  }
}

/**
 * Get all orders
 * @param {number} page 
 * @param {number} limit 
 * @param {string} search
 * @param {string} status
 * @returns {Promise}
 */
export const getOrders = async (page = 1, limit = 10, search = '', status = '') => {
  try {
    const token = localStorage.getItem('token')
    let url = `${getApiBase()}/admin/order/getOrders?page=${page}&limit=${limit}`
    
    if (search) {
      url += `&search=${search}`
    }
    
    if (status && status !== 'All') {
      url += `&status=${status}`
    }

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return response.data
  } catch (error) {
    console.error('Error fetching orders:', error)
    throw error
  }
}

/**
 * Update order status
 * @param {Object} data 
 * @param {string} data.orderId
 * @param {string} data.itemId
 * @param {string} data.status
 * @param {string} [data.deliveredServiceName]
 * @param {string} [data.trackingId]
 * @param {string} [data.trackingLink]
 * @returns {Promise}
 */
export const updateOrder = async (data) => {
  try {
    const token = localStorage.getItem('token')
    const response = await axios.patch(`${getApiBase()}/admin/order/updateOrder`, data, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return response.data
  } catch (error) {
    console.error('Error updating order:', error)
    throw error
  }
}

/**
 * Get Admin's own store stats
 * @returns {Promise}
 */
export const getAdminOwnStats = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get(`${getApiBase()}/admin/order/getAdminOwnStats`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return response.data
  } catch (error) {
    console.error('Error fetching admin own stats:', error)
    throw error
  }
}

/**
 * Get Admin's own orders
 * @param {number} page 
 * @param {number} limit 
 * @param {string} status 
 * @returns {Promise}
 */
export const getAdminOwnOrders = async (page = 1, limit = 10, status = '') => {
  try {
    const token = localStorage.getItem('token')
    let url = `${getApiBase()}/admin/order/getAdminOwnOrders?page=${page}&limit=${limit}`
    
    if (status && status !== 'All') {
      url += `&status=${status}`
    }

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return response.data
  } catch (error) {
    console.error('Error fetching admin own orders:', error)
    throw error
  }
}
