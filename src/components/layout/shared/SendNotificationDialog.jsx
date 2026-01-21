'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import MenuItem from '@mui/material/MenuItem'
import Grid from '@mui/material/Grid2'
import { styled } from '@mui/material/styles'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'react-hot-toast'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

// Service Imports
import { sendNotification } from '@/services/notificationService'

const CloseButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.grey[500],
  padding: 0
}))

const SendNotificationDialog = ({ open, handleClose }) => {
  // States
  const [selectedFile, setSelectedFile] = useState(null)
  const [loading, setLoading] = useState(false)

  // Hooks
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      type: '',
      title: '',
      message: ''
    }
  })

  // Handle file input changes
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const onSubmit = async (data) => {
    setLoading(true)
    const formData = new FormData()
    formData.append('title', data.title)
    formData.append('message', data.message)
    formData.append('type', data.type)
    if (selectedFile) {
      formData.append('image', selectedFile)
    }

    try {
      const res = await sendNotification(formData)
      if (res.status) {
        toast.success(res.message || 'Notification sent successfully')
        reset()
        setSelectedFile(null)
        handleClose()
      } else {
        toast.error(res.message || 'Failed to send notification')
      }
    } catch (error) {
      toast.error('An error occurred while sending notification')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth scroll='body'>
      <DialogTitle component='div' className='flex items-center justify-between pb-2'>
        <Typography variant='h5' className='font-bold'>Notification</Typography>
        <IconButton onClick={handleClose} size='small' className='text-primary border border-primary rounded-full p-0.5'>
          <i className='tabler-x text-sm' />
        </IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={5}>
            <Grid size={{ xs: 12 }}>
              <Controller
                name='type'
                control={control}
                rules={{ required: 'Notification type is required' }}
                render={({ field }) => (
                  <CustomTextField
                    select
                    fullWidth
                    label='Notification Type'
                    placeholder='Select Type'
                    {...field}
                    error={Boolean(errors.type)}
                    helperText={errors.type?.message}
                  >
                    <MenuItem value=''>Select Type</MenuItem>
                    <MenuItem value='1'>Users</MenuItem>
                    <MenuItem value='2'>Sellers</MenuItem>
                    <MenuItem value='3'>Both</MenuItem>
                  </CustomTextField>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name='title'
                control={control}
                rules={{ required: 'Title is required' }}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    label='Title'
                    placeholder='Enter Title'
                    {...field}
                    error={Boolean(errors.title)}
                    helperText={errors.title?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name='message'
                control={control}
                rules={{ required: 'Description is required' }}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    rows={2}
                    multiline
                    label='Description'
                    placeholder='Enter Description'
                    {...field}
                    error={Boolean(errors.message)}
                    helperText={errors.message?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant='body2' className='font-medium mbe-1'>Image (Optional)</Typography>
              <div className='flex items-center gap-4 border rounded p-1.5'>
                <Button component='label' variant='contained' size='small' color='primary' className='whitespace-nowrap'>
                  Choose File
                  <input type='file' hidden accept='image/*' onChange={handleFileChange} />
                </Button>
                <Typography variant='body2' className='truncate text-textSecondary'>
                  {selectedFile ? selectedFile.name : 'No file chosen'}
                </Typography>
              </div>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions className='justify-end gap-2 pb-6 px-6'>
          <Button variant='contained' type='submit' disabled={loading}>
            {loading ? 'Sending...' : 'Submit'}
          </Button>
          <Button variant='outlined' onClick={handleClose} color='secondary'>
            Close
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default SendNotificationDialog
