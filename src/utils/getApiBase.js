export function getApiBase() {
  const LOCAL_API = process.env.NEXT_PUBLIC_LOCAL_API || 'http://localhost:8787/api/v1'
  const SERVER_API = process.env.NEXT_PUBLIC_SERVER_API || 'https://trendycart.codestorehub.cloud/api/v1'

  // -------------------------
  // ✔ Browser Side (Client)
  // -------------------------
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname

    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '192.168.1.18') {
      return LOCAL_API
    }

    return SERVER_API
  }

  // -------------------------
  // ✔ Server Side (Next.js server)
  // -------------------------
  if (process.env.NODE_ENV === 'development') {
    return LOCAL_API
  }

  return SERVER_API
}

export function getStorageBase() {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '192.168.1.18') {
      return 'http://localhost:8787'
    }
    return 'https://trendycart.codestorehub.cloud'
  }

  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:8787'
  }

  return 'https://trendycart.codestorehub.cloud'
}

export const getHeaders = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    
    // If token is missing or malformed, don't send the header to avoid 403/401
    if (!token || token === 'undefined' || token === 'null') {
      return {}
    }

    return {
      Authorization: `Bearer ${token}`
    }
  }

  return {}
}
