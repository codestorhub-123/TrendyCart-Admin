'use client'

// React Imports
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import InputAdornment from '@mui/material/InputAdornment'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

// Service Imports
import { updateUserCoins, getUserInfo } from '@/services/userService'

const UserPlan = () => {
  // States
  const [coinsInput, setCoinsInput] = useState('')
  const [updatingCoins, setUpdatingCoins] = useState(false)
  const [currentCoins, setCurrentCoins] = useState(null)
  const [loadingCurrentCoins, setLoadingCurrentCoins] = useState(true)

  // Get user ID from URL query params
  const searchParams = useSearchParams()
  const userId = searchParams.get('id')

  // Fetch current coins on mount
  useEffect(() => {
    const fetchCurrentCoins = async () => {
      if (!userId) {
        setLoadingCurrentCoins(false)
        return
      }

      try {
        const response = await getUserInfo(userId)
        if (response.success && response.data) {
          setCurrentCoins(response.data.coins || 0)
        }
      } catch (err) {
        console.error('Error fetching current coins:', err)
      } finally {
        setLoadingCurrentCoins(false)
      }
    }

    fetchCurrentCoins()
  }, [userId])

  // Handle update coins - add input amount to current coins
  const handleUpdateCoins = async () => {
    if (!userId) {
      alert('User ID is required')
      return
    }

    if (!coinsInput || isNaN(coinsInput) || parseFloat(coinsInput) <= 0) {
      alert('Please enter a valid coins amount to add')
      return
    }

    if (currentCoins === null) {
      alert('Please wait while we fetch current coins...')
      return
    }

    try {
      setUpdatingCoins(true)
      // Calculate total: current coins + input amount
      const coinsToAdd = parseFloat(coinsInput)
      const newTotalCoins = currentCoins + coinsToAdd

      const response = await updateUserCoins(userId, newTotalCoins)

      if (response.success) {
        setCoinsInput('')
        setCurrentCoins(newTotalCoins) // Update current coins display
        alert(`Coins updated successfully! Added ${coinsToAdd} coins. New total: ${newTotalCoins}`)
        // Optionally refresh the page or trigger a data refresh
        window.location.reload()
      } else {
        alert(response.message || 'Failed to update coins')
      }
    } catch (err) {
      console.error('Error updating coins:', err)
      alert(err.message || 'Failed to update coins')
    } finally {
      setUpdatingCoins(false)
    }
  }

  return (
    <Card>
      <CardContent className='flex flex-col gap-6'>
        <div>
          <Typography variant='h5'>Update Coins</Typography>
          <Divider className='mlb-4' />
        </div>
        {loadingCurrentCoins ? (
          <div className='flex justify-center items-center p-4'>
            <CircularProgress size={24} />
          </div>
        ) : (
          <div className='flex flex-col gap-4'>
            {currentCoins !== null && (
              <div className='flex items-center justify-between p-4 bg-action-hover rounded'>
                <Typography variant='body2' color='text.secondary'>
                  Current Coins:
                </Typography>
                <Typography variant='h6' color='primary'>
                  {currentCoins}
                </Typography>
              </div>
            )}
            <CustomTextField
              fullWidth
              type='number'
              label='Coins to Add'
              placeholder='Enter coins amount to add'
              value={coinsInput}
              onChange={e => setCoinsInput(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='tabler-coins' />
                    </InputAdornment>
                  )
                }
              }}
            />
            {coinsInput && currentCoins !== null && !isNaN(coinsInput) && parseFloat(coinsInput) > 0 && (
              <div className='flex items-center justify-between p-4 bg-primary-lightOpacity rounded'>
                <Typography variant='body2' color='text.secondary'>
                  New Total:
                </Typography>
                <Typography variant='h6' color='primary'>
                  {currentCoins + parseFloat(coinsInput)}
                </Typography>
              </div>
            )}
            <Button
              variant='contained'
              color='primary'
              onClick={handleUpdateCoins}
              disabled={updatingCoins || !coinsInput || loadingCurrentCoins}
              startIcon={updatingCoins ? <CircularProgress size={16} /> : <i className='tabler-check' />}
              fullWidth
            >
              {updatingCoins ? 'Updating...' : 'Add Coins'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default UserPlan
