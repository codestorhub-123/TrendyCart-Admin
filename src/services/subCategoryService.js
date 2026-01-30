import { getApiBase, getHeaders } from '@/utils/getApiBase'

export const createSubCategory = async (formData) => {
  const url = `${getApiBase()}/admin/subCategory/create`
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: formData
    })
    return res.json()
  } catch (error) {
    console.error('subCategoryService: createSubCategory failed:', error)
    return { status: false, message: error.message }
  }
}

export const updateSubCategory = async (formData, subCategoryId, categoryId) => {
  if (!subCategoryId || subCategoryId === 'undefined' || subCategoryId === 'null') {
    return { status: false, message: 'Subcategory ID is missing' }
  }

  const url = `${getApiBase()}/admin/subCategory/update?subCategoryId=${subCategoryId}`

  // Ensure ID is in formData as well
  if (!formData.has('subCategoryId')) {
     formData.append('subCategoryId', subCategoryId)
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
    console.error('subCategoryService: updateSubCategory failed:', error)
    return { status: false, message: error.message }
  }
}

export const deleteSubCategory = async (subCategoryId) => {
  const url = `${getApiBase()}/admin/subCategory/delete?subCategoryId=${subCategoryId}`
  try {
    const res = await fetch(url, {
      method: 'DELETE',
      headers: getHeaders()
    })
    return res.json()
  } catch (error) {
    console.error('subCategoryService: deleteSubCategory failed:', error)
    return { status: false, message: error.message }
  }
}

export const listAllSubCategories = async (categoryId) => {
  const url = `${getApiBase()}/admin/subCategory/categoryWiseSubCategory?categoryId=${categoryId}`
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: getHeaders()
    })
    return res.json()
  } catch (error) {
    console.error('subCategoryService: listAllSubCategories failed:', error)
    return { status: false, message: error.message }
  }
}
export const fetchActiveSubCategories = async () => {
  const url = `${getApiBase()}/admin/subCategory/fetchActiveSubCategories`
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: getHeaders()
    })
    return res.json()
  } catch (error) {
    console.error('subCategoryService: fetchActiveSubCategories failed:', error)
    return { status: false, message: error.message }
  }
}
