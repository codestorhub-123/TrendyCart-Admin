'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

// Component Imports
import { toast } from 'react-toastify'

import { getProfile } from '@/services/adminService'

const MyProfilePage = () => {
  // States
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState(null)

  // Load profile data
  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const result = await getProfile()

      if (result?.success && result?.data) {
        setProfileData(result.data)
      } else {
        toast.error('Failed to load profile data')
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      toast.error('Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
        <CircularProgress />
      </Box>
    )
  }

  if (!profileData) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
        <Typography color='error'>No profile data available</Typography>
      </Box>
    )
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Card className='p-6'>
          <div className='flex flex-col items-center gap-4 mb-6'>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                fontSize: '3rem',
                bgcolor: 'primary.main'
              }}
            >
              {profileData.username?.charAt(0).toUpperCase() || 'A'}
            </Avatar>
            <div className='text-center'>
              <Typography variant='h4' className='mb-2'>
                {profileData.username || 'Admin'}
              </Typography>
              <Typography variant='body1' color='text.secondary'>
                {profileData.email || ''}
              </Typography>
            </div>
          </div>

          <div className='space-y-4'>
            <div className='p-4 border rounded-lg'>
              <Typography variant='caption' color='text.secondary' className='mb-1 block'>
                Username
              </Typography>
              <Typography variant='body1' className='font-medium'>
                {profileData.username || '-'}
              </Typography>
            </div>

            <div className='p-4 border rounded-lg'>
              <Typography variant='caption' color='text.secondary' className='mb-1 block'>
                Email
              </Typography>
              <Typography variant='body1' className='font-medium'>
                {profileData.email || '-'}
              </Typography>
            </div>

            <div className='p-4 border rounded-lg'>
              <Typography variant='caption' color='text.secondary' className='mb-1 block'>
                Created At
              </Typography>
              <Typography variant='body1' className='font-medium'>
                {profileData.createdAt
                  ? new Date(profileData.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : '-'}
              </Typography>
            </div>

            <div className='p-4 border rounded-lg'>
              <Typography variant='caption' color='text.secondary' className='mb-1 block'>
                Last Updated
              </Typography>
              <Typography variant='body1' className='font-medium'>
                {profileData.updatedAt
                  ? new Date(profileData.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : '-'}
              </Typography>
            </div>
          </div>
        </Card>
      </Grid>
    </Grid>
  )
}

export default MyProfilePage
