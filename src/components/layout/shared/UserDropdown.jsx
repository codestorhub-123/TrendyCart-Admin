'use client'

// React Imports
import { useRef, useState, useEffect } from 'react'

// Next Imports
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import { styled } from '@mui/material/styles'
import Badge from '@mui/material/Badge'
import Avatar from '@mui/material/Avatar'

// Third-party Imports
import { signOut, useSession } from 'next-auth/react'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'
import { getProfile } from '@/services/adminService'

// Styled component for badge content
const BadgeContentSpan = styled('span')({
  width: 8,
  height: 8,
  borderRadius: '50%',
  cursor: 'pointer',
  backgroundColor: 'var(--mui-palette-success-main)',
  boxShadow: '0 0 0 2px var(--mui-palette-background-paper)'
})

const UserDropdown = () => {
  // States
  const [profileImage, setProfileImage] = useState('')

  // Refs
  const anchorRef = useRef(null)

  // Hooks
  const router = useRouter()
  const { data: session } = useSession()
  const { lang: locale } = useParams()

  useEffect(() => {
    const fetchProfileData = async () => {
      const res = await getProfile()
      if (res && res.status) {
        const data = res.data || res.admin || res.user || {}
        setProfileImage(data.image || '')
      }
    }

    fetchProfileData()

    const handleProfileUpdate = () => fetchProfileData()
    window.addEventListener('user-profile-updated', handleProfileUpdate)

    return () => {
      window.removeEventListener('user-profile-updated', handleProfileUpdate)
    }
  }, [])

  const handleProfileNavigation = () => {
    router.push(getLocalizedUrl('/pages/admin-profile', locale))
  }

  const handleUserLogout = async () => {
    try {
      // Remove token from local storage
      localStorage.removeItem('token')
      
      // Sign out from the app and redirect to login
      await signOut({ callbackUrl: '/login' })
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <>
      <Badge
        ref={anchorRef}
        overlap='circular'
        badgeContent={<BadgeContentSpan onClick={handleProfileNavigation} />}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        className='mis-2'
      >
        <Avatar
          ref={anchorRef}
          alt={session?.user?.name || 'Admin'}
          src={profileImage || session?.user?.image || '/images/avatars/1.png'}
          onClick={handleProfileNavigation}
          className='cursor-pointer bs-[38px] is-[38px]'
        />
      </Badge>
    </>
  )
}

export default UserDropdown
