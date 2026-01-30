import { getApiBase, getHeaders } from '@/utils/getApiBase'

export const listAllAttributes = async (subCategoryId = '', fieldType = '') => {
  let url = `${getApiBase()}/admin/attributes/listAllAttributes`
  const params = new URLSearchParams()
  if (subCategoryId) params.append('subCategoryId', subCategoryId)
  if (fieldType) params.append('fieldType', fieldType)
  
  if (params.toString()) {
    url += `?${params.toString()}`
  }

  try {
    const res = await fetch(url, { headers: getHeaders() })
    if (!res.ok) {
        const text = await res.text()
        console.error(`attributeService: listAllAttributes failed with status ${res.status}. Response: ${text.substring(0, 100)}`)
        return { status: false, message: `Server error: ${res.status}` }
    }
    return res.json()
  } catch (error) {
    console.error('attributeService: fetch failed:', error)
    return { status: false, message: error.message }
  }
}

export const insertAttributes = async (formData) => {
  const url = `${getApiBase()}/admin/attributes/insertAttributes`
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: formData
    })
    const contentType = res.headers.get('content-type')
    if (!res.ok || (contentType && !contentType.includes('application/json'))) {
      const text = await res.text()
      console.error(`attributeService: insertAttributes failed. URL: ${url}, Status: ${res.status}. Response: ${text.substring(0, 100)}`)
      return { status: false, message: `Server error (${res.status})` }
    }
    return res.json()
  } catch (error) {
    console.error('attributeService: insertAttributes failed:', error)
    return { status: false, message: error.message }
  }
}

export const updateAttributes = async (formData) => {
  const url = `${getApiBase()}/admin/attributes/updateAttributes`
  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: getHeaders(),
      body: formData
    })
    const contentType = res.headers.get('content-type')
    if (!res.ok || (contentType && !contentType.includes('application/json'))) {
      const text = await res.text()
      console.error(`attributeService: updateAttributes failed. URL: ${url}, Status: ${res.status}. Response: ${text.substring(0, 100)}`)
      return { status: false, message: `Server error (${res.status})` }
    }
    return res.json()
  } catch (error) {
    console.error('attributeService: updateAttributes failed:', error)
    return { status: false, message: error.message }
  }
}

export const destroyAttribute = async (attributeId) => {
  const url = `${getApiBase()}/admin/attributes/destroyAttribute?attributeId=${attributeId}`
  try {
    const res = await fetch(url, {
      method: 'DELETE',
      headers: getHeaders()
    })
    const contentType = res.headers.get('content-type')
    if (!res.ok || (contentType && !contentType.includes('application/json'))) {
      const text = await res.text()
      console.error(`attributeService: destroyAttribute failed. URL: ${url}, Status: ${res.status}. Response: ${text.substring(0, 100)}`)
      return { status: false, message: `Server error (${res.status})` }
    }
    return res.json()
  } catch (error) {
    console.error('attributeService: destroyAttribute failed:', error)
    return { status: false, message: error.message }
  }
}


