'use client'

// MUI Imports
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import CustomAvatar from '@core/components/mui/Avatar'

// Util Imports
import { getInitials } from '@/utils/getInitials'

const ProfileHeader = ({ data, roleLabel, roleColor = 'primary' }) => {
  const getAvatarSrc = avatar => {
    if (!avatar) return null
    if (avatar.startsWith('http')) return avatar
    return `${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080'}/${avatar.replace(/^\/+/, '')}`
  }

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex items-center justify-center flex-col gap-4'>
        <div className='flex flex-col items-center gap-4'>
          {data?.avatar ? (
            <CustomAvatar alt={`${roleLabel}-profile`} src={getAvatarSrc(data.avatar)} variant='rounded' size={120} />
          ) : (
            <CustomAvatar alt={`${roleLabel}-profile`} variant='rounded' size={120}>
              {getInitials(data?.name || '')}
            </CustomAvatar>
          )}
          <Typography variant='h5'>{data?.name}</Typography>
        </div>
        {roleLabel && <Chip label={roleLabel} color={roleColor} size='small' variant='tonal' />}
      </div>
      <div className='flex items-center justify-around flex-wrap gap-4'>
        <div className='flex items-center gap-4'>
          <CustomAvatar variant='rounded' color='primary' skin='light'>
            <i className='tabler-users' />
          </CustomAvatar>
          <div>
            <Typography variant='h5'>{data?.followers || 0}</Typography>
            <Typography>Followers</Typography>
          </div>
        </div>
        <div className='flex items-center gap-4'>
          <CustomAvatar variant='rounded' color='primary' skin='light'>
            <i className='tabler-user-plus' />
          </CustomAvatar>
          <div>
            <Typography variant='h5'>{data?.following || 0}</Typography>
            <Typography>Following</Typography>
          </div>
        </div>
        <div className='flex items-center gap-4'>
          <CustomAvatar variant='rounded' color='primary' skin='light'>
            <i className='tabler-coins' />
          </CustomAvatar>
          <div>
            <Typography variant='h5'>{data?.coins || 0}</Typography>
            <Typography>Coins</Typography>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileHeader
