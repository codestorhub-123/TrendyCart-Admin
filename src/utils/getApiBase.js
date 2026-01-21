export function getApiBase() {
  // -------------------------
  // ✔ Browser Side (Client)
  // -------------------------
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname

    if (hostname === 'localhost' || hostname === '192.168.1.18') {
      return process.env.NEXT_PUBLIC_LOCAL_API // Local API
    }

    return process.env.NEXT_PUBLIC_SERVER_API // Live API
  }

  // -------------------------
  // ✔ Server Side (Next.js server)
  // -------------------------
  if (process.env.NODE_ENV === 'development') {
    return process.env.NEXT_PUBLIC_LOCAL_API // Local when dev
  }

  return process.env.NEXT_PUBLIC_SERVER_API // Production
}

export const getHeaders = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    return {
      Authorization: `Bearer ${token}`
    }
  }
  return {}
}
