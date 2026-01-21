'use client'

// React Imports
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

// MUI Imports
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import MenuItem from '@mui/material/MenuItem'
import { sendNotification, getAdminProfile } from '@/services/userService'
import { toast } from 'react-toastify'

const SendNotificationAdmin = ({ open, setOpen }) => {
  // States
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    notificationType: 'user',
    image: null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setFormData({
        title: '',
        message: '',
        notificationType: 'user',
        image: null
      })
      setError(null)
    }
  }, [open])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [open])

  const handleChange = e => {
    const { name, value, files } = e.target
    if (files) {
      setFormData(prev => ({ ...prev, [name]: files[0] }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
    setError(null)
  }

  const handleSubmit = async e => {
    e.preventDefault()

    if (!formData.title.trim()) {
      setError('Title is required')
      return
    }
    if (!formData.message.trim()) {
      setError('Message is required')
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Convert 'both' to 'user-host' for API
      const apiNotificationType = formData.notificationType === 'both' ? 'user-host' : formData.notificationType

      await sendNotification({
        title: formData.title.trim(),
        message: formData.message.trim(),
        notificationType: apiNotificationType,
        image: formData.image
      })

      toast.success('Notification sent successfully!')
      setOpen(false)
    } catch (err) {
      console.error('Error sending notification:', err)
      setError(err.message || 'Failed to send notification')
      toast.error(err.message || 'Failed to send notification')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setOpen(false)
    }
  }

  if (!open) return null

  return typeof window !== 'undefined'
    ? createPortal(
        <div
          className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm'
          onClick={e => {
            // Only close if clicking directly on backdrop, not on modal content
            if (e.target === e.currentTarget) {
              handleClose()
            }
          }}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <div
            className='bg-white dark:bg-[#111111] rounded-2xl shadow-2xl w-[90%] max-w-md relative border border-gray-200 dark:border-[#606060]/30 m-4'
            onClick={e => e.stopPropagation()}
            onMouseDown={e => e.stopPropagation()}
            style={{
              maxHeight: '90vh',
              overflowY: 'visible',
              overflowX: 'hidden',
              position: 'relative',
              zIndex: 10000
            }}
          >
            <button
              onClick={handleClose}
              className='absolute top-4 right-4 text-gray-500 dark:text-[#606060] hover:text-primary dark:hover:text-[#FD2B7B] text-2xl font-bold transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-[#000000]'
              disabled={loading}
            >
              &times;
            </button>

            <div className='p-6' style={{ overflow: 'visible' }}>
              <div className='mb-6'>
                <div className='w-12 h-12 bg-primary dark:bg-[#FD2B7B] rounded-xl flex items-center justify-center mb-3'>
                  <i className='tabler-bell text-white text-xl' />
                </div>
                <Typography variant='h4' className='mb-1'>
                  Send Notification
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Send a notification to users or hosts
                </Typography>
              </div>

              <form onSubmit={handleSubmit} className='flex flex-col gap-4' onClick={e => e.stopPropagation()}>
                {error && (
                  <div className='p-3 bg-error/10 border border-error/20 rounded'>
                    <Typography color='error' variant='body2'>
                      {error}
                    </Typography>
                  </div>
                )}

                <div>
                  <CustomTextField
                    fullWidth
                    label='Title *'
                    name='title'
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder='Enter notification title'
                  />
                </div>

                <div>
                  <CustomTextField
                    fullWidth
                    label='Message *'
                    name='message'
                    value={formData.message}
                    onChange={handleChange}
                    required
                    multiline
                    rows={3}
                    placeholder='Enter notification message'
                  />
                </div>

                <div>
                  <CustomTextField
                    fullWidth
                    label='Image (Optional)'
                    name='image'
                    type='file'
                    inputProps={{
                      accept: 'image/*'
                    }}
                    onChange={handleChange}
                  />
                  {formData.image && (
                    <Typography variant='body2' color='text.secondary' className='mt-2'>
                      Selected: {formData.image.name}
                    </Typography>
                  )}
                </div>

                <div style={{ position: 'relative', zIndex: 10001 }}>
                  <CustomTextField
                    fullWidth
                    select
                    label='Notification Type *'
                    name='notificationType'
                    value={formData.notificationType}
                    onChange={handleChange}
                    required
                    slotProps={{
                      select: {
                        MenuProps: {
                          PaperProps: {
                            sx: {
                              maxHeight: 200,
                              zIndex: 10001
                            }
                          },
                          disablePortal: true,
                          anchorOrigin: {
                            vertical: 'bottom',
                            horizontal: 'left'
                          },
                          transformOrigin: {
                            vertical: 'top',
                            horizontal: 'left'
                          }
                        }
                      }
                    }}
                  >
                    <MenuItem value='user'>User</MenuItem>
                    <MenuItem value='host'>Host</MenuItem>
                    <MenuItem value='both'>User & Host</MenuItem>
                  </CustomTextField>
                </div>

                <div className='flex justify-end gap-3 mt-4'>
                  <button
                    type='button'
                    onClick={handleClose}
                    disabled={loading}
                    className='px-6 py-3 bg-gray-200 dark:bg-[#000000] text-gray-700 dark:text-[#FFFFFF] rounded-xl hover:bg-gray-300 dark:hover:bg-[#606060] text-sm font-semibold transition-all duration-200 disabled:opacity-50'
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    disabled={loading || !formData.title.trim() || !formData.message.trim()}
                    className='px-6 py-3 bg-primary dark:bg-[#FD2B7B] text-white rounded-xl hover:bg-primary/90 dark:hover:bg-[#C707F2] text-sm font-semibold transition-all duration-200 disabled:opacity-50 flex items-center gap-2'
                  >
                    {loading ? (
                      <>
                        <CircularProgress size={16} color='inherit' />
                        Sending...
                      </>
                    ) : (
                      'Send'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )
    : null
}

export default SendNotificationAdmin
