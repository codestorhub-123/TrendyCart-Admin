import { getStorageBase } from './getApiBase'

export const getImageUrl = (path) => {
  if (!path || path.includes('erashopUser.png')) return ''
  if (path.startsWith('http') || path.startsWith('https')) return path
  
  // Get base and remove any trailing slash
  const base = getStorageBase().replace(/\/$/, '')
  
  // Normalize path separators and remove any double forward slashes
  const normalizedPath = path.replace(/\\/g, '/').replace(/\/+/g, '/')
  
  // Ensure path starts with / if it doesn't
  const cleanPath = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`
  
  return `${base}${cleanPath}`
}
