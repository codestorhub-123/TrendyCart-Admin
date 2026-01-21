'use client'

// React Imports
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'

// Component Imports
import ProfileHeader from '@/components/profile/ProfileHeader'
import DetailsSection from '@/components/profile/DetailsSection'
import EditUserInfo from '@components/dialogs/edit-user-info'
import ConfirmationDialog from '@components/dialogs/confirmation-dialog'
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'
import SendNotification from '@components/dialogs/send-notification'

// Service Imports
import { getUserInfo } from '@/services/userService'

const ProfileDetails = ({
  entityType = 'user', // 'user' or 'host'
  roleLabel,
  roleColor = 'primary',
  dataMapper, // Function to map API response to component data
  fieldsConfig, // Array of field configurations for DetailsSection
  showEditButton = true,
  showNotificationButton = true,
  showSuspendButton = true
}) => {
  // States
  const [entityData, setEntityData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Get entity ID from URL query params
  const searchParams = useSearchParams()
  const entityId = searchParams.get('id')

  // Fetch entity data
  useEffect(() => {
    const fetchEntityData = async () => {
      if (!entityId) {
        setError(`${entityType} ID is required`)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const response = await getUserInfo(entityId)

        if (response.success && response.data) {
          const data = response.data
          // Use custom mapper if provided, otherwise use default mapping
          const mappedData = dataMapper ? dataMapper(data) : mapDefaultData(data, entityType)
          setEntityData(mappedData)
        } else {
          setError(`Failed to fetch ${entityType} data`)
        }
      } catch (err) {
        console.error(`Error fetching ${entityType} data:`, err)
        setError(err.message || `Failed to fetch ${entityType} data`)
      } finally {
        setLoading(false)
      }
    }

    fetchEntityData()
  }, [entityId, entityType, dataMapper])

  // Default data mapper
  const mapDefaultData = (data, type) => {
    return {
      _id: data._id,
      name: data.name,
      firstName: data.name?.split(' ')[0] || data.name,
      lastName: data.name?.split(' ').slice(1).join(' ') || '',
      userName: `@${data.uniqueId}`,
      billingEmail: data.email,
      status: data.status || 'active',
      role: type === 'host' ? 'Host' : data.isHost ? 'Host' : 'User',
      taxId: data.identity || 'N/A',
      contact: data.countryCode || 'N/A',
      language: data.hostProfile?.languages?.length > 0 ? data.hostProfile.languages : ['English'],
      country: data.country || 'N/A',
      avatar: data.avatar,
      coins: data.coins,
      followers: data.followers,
      following: data.following,
      isOnline: data.isOnline,
      isBlocked: data.isBlocked,
      loginType: data.loginType,
      age: data.age,
      gender: data.gender,
      bio: data.bio,
      currentLevel: data.currentLevel,
      totalCoinsSpent: data.totalCoinsSpent,
      ...data
    }
  }

  // Vars
  const buttonProps = (children, color, variant) => ({
    children,
    color,
    variant
  })

  // Show loading state
  if (loading) {
    return (
      <Card>
        <CardContent className='flex justify-center items-center pbs-12'>
          <CircularProgress />
        </CardContent>
      </Card>
    )
  }

  // Show error state
  if (error || !entityData) {
    return (
      <Card>
        <CardContent className='flex justify-center items-center pbs-12'>
          <Typography color='error'>{error || `${entityType} not found`}</Typography>
        </CardContent>
      </Card>
    )
  }

  // Prepare fields for DetailsSection
  const getFields = () => {
    if (fieldsConfig) {
      return fieldsConfig.map(field => ({
        ...field,
        value: field.value !== undefined ? field.value : entityData[field.key]
      }))
    }

    // Default fields based on entity type
    const baseFields = [
      { label: 'Username', value: entityData.userName },
      { label: 'Email', value: entityData.billingEmail || 'N/A' },
      { label: 'Status', value: entityData.status },
      { label: 'Role', value: entityData.role },
      { label: 'Identity', value: entityData.taxId },
      { label: 'Country Code', value: entityData.contact },
      { label: 'Age', value: entityData.age || 'N/A' },
      { label: 'Gender', value: entityData.gender || 'N/A' },
      {
        label: 'Login Type',
        value: entityData.loginType || 'N/A',
        render: value => (
          <div className='flex items-center flex-wrap gap-x-1.5'>
            <Typography className='font-medium' color='text.primary'>
              Login Type:
            </Typography>
            <Typography color='text.primary' className='capitalize'>
              {value}
            </Typography>
          </div>
        )
      },
      {
        label: 'Online Status',
        value: entityData.isOnline,
        render: value => (
          <div className='flex items-center flex-wrap gap-x-1.5'>
            <Typography className='font-medium' color='text.primary'>
              Online Status:
            </Typography>
            <Chip
              variant='tonal'
              label={value ? 'Online' : 'Offline'}
              size='small'
              color={value ? 'success' : 'secondary'}
            />
          </div>
        )
      },
      {
        label: 'Bio',
        value: entityData.bio,
        condition: !!entityData.bio,
        render: value => (
          <div className='flex items-start flex-wrap gap-x-1.5'>
            <Typography className='font-medium' color='text.primary'>
              Bio:
            </Typography>
            <Typography color='text.primary'>{value}</Typography>
          </div>
        )
      },
      {
        label: 'Language',
        value: Array.isArray(entityData.language) ? entityData.language.join(', ') : entityData.language || 'N/A'
      },
      { label: 'Country', value: entityData.country }
    ]

    // Add host-specific fields
    if (entityType === 'host') {
      baseFields.push(
        { label: 'Current Level', value: entityData.currentLevel || 0 },
        { label: 'Pending Withdraw Coins', value: entityData.pendingWithdrwCoins || 0 },
        { label: 'Withdraw Coins', value: entityData.withdrawCoins || 0 },
        { label: 'Ads View Count', value: entityData.adsViewCount || 0 },
        { label: 'Total Coins Spent', value: entityData.totalCoinsSpent || 0 },
        {
          label: 'Interests',
          value: entityData.interests,
          condition: entityData.interests && entityData.interests.length > 0,
          render: value => (
            <div className='flex items-start flex-wrap gap-x-1.5'>
              <Typography className='font-medium' color='text.primary'>
                Interests:
              </Typography>
              <Typography color='text.primary'>{Array.isArray(value) ? value.join(', ') : value}</Typography>
            </div>
          )
        },
        {
          label: 'Created At',
          value: entityData.createdAt,
          condition: !!entityData.createdAt,
          render: value => (
            <div className='flex items-center flex-wrap gap-x-1.5'>
              <Typography className='font-medium' color='text.primary'>
                Created At:
              </Typography>
              <Typography color='text.primary'>
                {new Date(value).toLocaleString('en-US', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Typography>
            </div>
          )
        },
        {
          label: 'Updated At',
          value: entityData.updatedAt,
          condition: !!entityData.updatedAt,
          render: value => (
            <div className='flex items-center flex-wrap gap-x-1.5'>
              <Typography className='font-medium' color='text.primary'>
                Updated At:
              </Typography>
              <Typography color='text.primary'>
                {new Date(value).toLocaleString('en-US', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Typography>
            </div>
          )
        }
      )
    }

    return baseFields
  }

  // Determine role label and color
  const finalRoleLabel = roleLabel || (entityData.isHost ? 'Host' : 'User')
  const finalRoleColor = roleColor || (entityData.isHost ? 'primary' : 'secondary')

  return (
    <>
      <Card>
        <CardContent className='flex flex-col pbs-12 gap-6'>
          <ProfileHeader data={entityData} roleLabel={finalRoleLabel} roleColor={finalRoleColor} />
          <DetailsSection fields={getFields()} />
          <div className='flex gap-4 justify-center'>
            {showEditButton && (
              <OpenDialogOnElementClick
                element={Button}
                elementProps={buttonProps('Edit', 'primary', 'contained')}
                dialog={EditUserInfo}
                dialogProps={{ data: entityData }}
              />
            )}

            {showSuspendButton && (
              <OpenDialogOnElementClick
                element={Button}
                elementProps={buttonProps('Suspend', 'error', 'tonal')}
                dialog={ConfirmationDialog}
                dialogProps={{ type: 'suspend-account' }}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </>
  )
}

export default ProfileDetails
