import { getApiBase } from '@/utils/getApiBase'

const getHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    Authorization: `Bearer ${token}`
  }
}

export const listAllSubCategories = async () => {
  const url = `${getApiBase()}/admin/subCategory/categoryWiseSubCategory`
  try {
    const res = await fetch(url, { headers: getHeaders() })
    const contentType = res.headers.get('content-type')
    
    if (!res.ok || (contentType && !contentType.includes('application/json'))) {
      return { status: false, message: `Invalid response from server (${res.status})` }
    }
    return res.json()
  } catch (error) {
    console.error('categoryService: fetch failed:', error)
    return { status: false, message: error.message }
  }
}

export const getAllCategories = async () => {
  const url = `${getApiBase()}/admin/category/getCategory`
  try {
    const res = await fetch(url, { headers: getHeaders() })
    const contentType = res.headers.get('content-type')

    if (!res.ok || (contentType && !contentType.includes('application/json'))) {
        return { status: false, message: `Invalid response from server (${res.status})` }
    }
    return res.json()
  } catch (error) {
    console.error('categoryService: getAllCategories failed:', error)
    return { status: false, message: error.message }
  }
}

export const createCategory = async (formData) => {
  const url = `${getApiBase()}/admin/category/create`
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: getHeaders(), 
      body: formData
    })
    return res.json()
  } catch (error) {
    console.error('categoryService: createCategory failed:', error)
    return { status: false, message: error.message }
  }
}

export const updateCategory = async (formData, categoryId) => {
  const url = `${getApiBase()}/admin/category/update?categoryId=${categoryId}`
  
  // Also add to formData for robustness if backend expects it there
  if (!formData.has('categoryId')) {
    formData.append('categoryId', categoryId)
  }

  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: getHeaders(),
      body: formData
    })
    
    const contentType = res.headers.get('content-type')
    if (!res.ok || (contentType && !contentType.includes('application/json'))) {
        const text = await res.text()
        return { status: false, message: `Server error (${res.status}): ${text.substring(0, 100)}` }
    }
    
    return res.json()
  } catch (error) {
    console.error('categoryService: updateCategory failed:', error)
    return { status: false, message: error.message }
  }
}

export const deleteCategory = async (categoryId) => {
  const url = `${getApiBase()}/admin/category/delete?categoryId=${categoryId}`
  try {
    const res = await fetch(url, {
      method: 'DELETE',
      headers: getHeaders()
    })
    return res.json()
  } catch (error) {
    console.error('categoryService: deleteCategory failed:', error)
    return { status: false, message: error.message }
  }
}
