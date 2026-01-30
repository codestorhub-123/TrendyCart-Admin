import { getApiBase, getHeaders } from '@/utils/getApiBase'

// Create product by admin
export const createProductByAdmin = async (formData) => {
  const url = `${getApiBase()}/admin/product/createProductByAdmin`
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: formData
    })
    return res.json()
  } catch (error) {
    console.error('productService: createProductByAdmin failed:', error)
    return { status: false, message: error.message }
  }
}



// Create fake product by admin (uses same API as createProductByAdmin)
export const createFakeProductByAdmin = async (formData) => {
  const url = `${getApiBase()}/admin/product/createProductByAdmin`
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: formData
    })
    return res.json()
  } catch (error) {
    console.error('productService: createFakeProductByAdmin failed:', error)
    return { status: false, message: error.message }
  }
}

// Update product
export const updateProduct = async (formData, productId) => {
  const url = `${getApiBase()}/admin/product/update?productId=${productId}`
  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: getHeaders(),
      body: formData
    })
    return res.json()
  } catch (error) {
    console.error('productService: updateProduct failed:', error)
    return { status: false, message: error.message }
  }
}

// Get real products
export const getRealProducts = async (start = 1, limit = 10) => {
  const url = `${getApiBase()}/admin/product/getRealProducts?start=${start}&limit=${limit}`
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: getHeaders()
    })
    return res.json()
  } catch (error) {
    console.error('productService: getRealProducts failed:', error)
    return { status: false, message: error.message }
  }
}

// Get fake products
export const getFakeProducts = async (start = 1, limit = 10) => {
  const url = `${getApiBase()}/admin/product/getFakeProducts?start=${start}&limit=${limit}`
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: getHeaders()
    })
    return res.json()
  } catch (error) {
    console.error('productService: getFakeProducts failed:', error)
    return { status: false, message: error.message }
  }
}

// Get product details for admin
export const getProductDetailsForAdmin = async (productId) => {
  const url = `${getApiBase()}/admin/product/productDetailsForAdmin?productId=${productId}`
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: getHeaders()
    })
    return res.json()
  } catch (error) {
    console.error('productService: getProductDetailsForAdmin failed:', error)
    return { status: false, message: error.message }
  }
}

// Get products by seller
export const getProductsBySeller = async (sellerId, start = 1, limit = 10) => {
  const params = new URLSearchParams({ start, limit, page: start }) // Send both start and page for safety
  if (sellerId) params.append('sellerId', sellerId)
  
  const url = `${getApiBase()}/admin/product/getSellerWise?${params.toString()}`
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: getHeaders()
    })
    return res.json()
  } catch (error) {
    console.error('productService: getProductsBySeller failed:', error)
    return { status: false, message: error.message }
  }
}

// Get top selling products
export const getTopSellingProducts = async (limit = 10) => {
  const url = `${getApiBase()}/admin/product/topSellingProducts?limit=${limit}`
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: getHeaders()
    })
    return res.json()
  } catch (error) {
    console.error('productService: getTopSellingProducts failed:', error)
    return { status: false, message: error.message }
  }
}

// Get popular products
export const getPopularProducts = async (limit = 10) => {
  const url = `${getApiBase()}/admin/product/popularProducts?limit=${limit}`
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: getHeaders()
    })
    return res.json()
  } catch (error) {
    console.error('productService: getPopularProducts failed:', error)
    return { status: false, message: error.message }
  }
}

// Toggle out of stock status
export const toggleOutOfStock = async (productId) => {
  const url = `${getApiBase()}/admin/product/isOutOfStock?productId=${productId}`
  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: getHeaders()
    })
    return res.json()
  } catch (error) {
    console.error('productService: toggleOutOfStock failed:', error)
    return { status: false, message: error.message }
  }
}

// Toggle new collection status
export const toggleNewCollection = async (productId) => {
  const url = `${getApiBase()}/admin/product/isNewCollection?productId=${productId}`
  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: getHeaders()
    })
    return res.json()
  } catch (error) {
    console.error('productService: toggleNewCollection failed:', error)
    return { status: false, message: error.message }
  }
}

// Toggle selection status
export const toggleSelection = async (productId) => {
  const url = `${getApiBase()}/admin/product/selectOrNot?productId=${productId}`
  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: getHeaders()
    })
    return res.json()
  } catch (error) {
    console.error('productService: toggleSelection failed:', error)
    return { status: false, message: error.message }
  }
}

// Delete product
export const deleteProduct = async (productId) => {
  const url = `${getApiBase()}/admin/product/delete?productId=${productId}`
  try {
    const res = await fetch(url, {
      method: 'DELETE',
      headers: getHeaders()
    })
    return res.json()
  } catch (error) {
    console.error('productService: deleteProduct failed:', error)
    return { status: false, message: error.message }
  }
}
