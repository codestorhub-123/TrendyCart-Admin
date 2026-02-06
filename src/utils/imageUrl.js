import { getStorageBase } from './getApiBase'

export const getImageUrl = (path) => {
  if (!path || path.includes('erashopUser.png')) return ''
  
  // Fix: If path contains localhost but we are on production, strip it.
  // We effectively treat localhost URLs as relative paths.
  const cleanLocal = path.replace('http://localhost:8787', '').replace('http://localhost:3000', '')
  
  if (cleanLocal.startsWith('http') || cleanLocal.startsWith('https')) return cleanLocal
  
  // Get base and remove any trailing slash
  const base = getStorageBase().replace(/\/$/, '')
  
  // Normalize path separators and remove any double forward slashes
  const normalizedPath = cleanLocal.replace(/\\/g, '/').replace(/\/+/g, '/')
  
  // Ensure path starts with / if it doesn't
  const cleanPath = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`
  
  return `${base}${cleanPath}`
}
