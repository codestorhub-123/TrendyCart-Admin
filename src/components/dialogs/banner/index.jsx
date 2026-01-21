'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid2'
import CircularProgress from '@mui/material/CircularProgress'
import MenuItem from '@mui/material/MenuItem'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import DialogCloseButton from '../DialogCloseButton'
import { createBanner, updateBanner } from '@/services/userService'

const BannerDialog = ({ open, setOpen, onSuccess, editData }) => {
  // States
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: null,
    imageUrl: '',
    link: '',
    isForHost: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  // Reset form when dialog opens/closes or editData changes
  useEffect(() => {
    if (open) {
      if (editData) {
        setFormData({
          title: editData.title || '',
          description: editData.description || '',
          image: null,
          imageUrl: editData.image || '',
          link: editData.link || '',
          isForHost: editData.isForHost || false
        })
        setImagePreview(editData.image ? `${process.env.NEXT_PUBLIC_API_BASE}/${editData.image}` : null)
      } else {
        setFormData({
          title: '',
          description: '',
          image: null,
          imageUrl: '',
          link: '',
          isForHost: false
        })
        setImagePreview(null)
      }
      setError(null)
    }
  }, [open, editData])

  // Handle form input change
  const handleChange = e => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    setError(null)
  }

  // Handle file change
  const handleFileChange = e => {
    const file = e.target.files[0]
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file,
        imageUrl: ''
      }))
      setImagePreview(URL.createObjectURL(file))
      setError(null)
    }
  }

  // Remove image
  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      image: null,
      imageUrl: ''
    }))
    setImagePreview(null)
  }

  // Handle form submit
  const handleSubmit = async e => {
    e.preventDefault()
    setError(null)

    // Validate required fields
    if (!formData.title || !formData.description) {
      setError('Please fill all required fields')
      return
    }

    // Validate image
    if (!formData.image && !formData.imageUrl) {
      setError('Please select an image or enter image URL')
      return
    }

    setLoading(true)

    try {
      const submitData = {
        title: formData.title,
        description: formData.description,
        link: formData.link || '',
        isForHost: formData.isForHost
      }

      // Add image file or URL
      if (formData.image) {
        submitData.image = formData.image
      } else if (formData.imageUrl) {
        submitData.image = formData.imageUrl
      }

      let response
      if (editData) {
        response = await updateBanner(editData._id, submitData)
      } else {
        response = await createBanner(submitData)
      }

      if (response.success) {
        setOpen(false)
        if (onSuccess) {
          onSuccess()
        }
      } else {
        setError(response.message || 'Failed to save banner')
      }
    } catch (err) {
      console.error('Error saving banner:', err)
      setError(err.message || 'Failed to save banner')
    } finally {
      setLoading(false)
    }
  }

  // Handle close
  const handleClose = () => {
    if (!loading) {
      setOpen(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth='md'
      fullWidth
      scroll='body'
      closeAfterTransition={false}
      sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
    >
      <DialogTitle variant='h4' className='flex gap-2 flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
        {editData ? 'Edit Banner' : 'Create Banner'}
        <Typography component='span' className='flex flex-col text-center'>
          {editData ? 'Update banner information' : 'Add a new banner to the system'}
        </Typography>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent className='pbs-0 sm:pli-16'>
          <DialogCloseButton onClick={handleClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
          {error && (
            <div className='mb-4 p-3 bg-error/10 border border-error/20 rounded'>
              <Typography color='error'>{error}</Typography>
            </div>
          )}
          <Grid container spacing={6}>
            <Grid size={{ xs: 12 }}>
              <CustomTextField
                fullWidth
                label='Title *'
                name='title'
                placeholder='Enter banner title'
                value={formData.title}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CustomTextField
                fullWidth
                multiline
                rows={3}
                label='Description *'
                name='description'
                placeholder='Enter banner description'
                value={formData.description}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CustomTextField
                fullWidth
                label='Link'
                name='link'
                placeholder='Enter banner link URL'
                value={formData.link}
                onChange={handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CustomTextField
                fullWidth
                type='file'
                label='Image *'
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  accept: 'image/*'
                }}
                onChange={handleFileChange}
              />
            </Grid>
            {imagePreview && (
              <Grid size={{ xs: 12 }}>
                <Box className='relative inline-block'>
                  <img
                    src={imagePreview}
                    alt='Banner preview'
                    className='max-w-full h-auto max-h-48 rounded border border-divider'
                  />
                  <IconButton
                    size='small'
                    onClick={handleRemoveImage}
                    className='absolute top-2 right-2'
                    sx={{
                      bgcolor: 'error.main',
                      color: 'error.contrastText',
                      '&:hover': {
                        bgcolor: 'error.dark'
                      }
                    }}
                  >
                    <i className='tabler-x text-sm' />
                  </IconButton>
                </Box>
              </Grid>
            )}
            {!formData.image && (
              <Grid size={{ xs: 12 }}>
                <CustomTextField
                  fullWidth
                  label='Image URL'
                  name='imageUrl'
                  placeholder='Or enter image URL'
                  value={formData.imageUrl}
                  onChange={handleChange}
                />
              </Grid>
            )}
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch checked={formData.isForHost} onChange={handleChange} name='isForHost' color='primary' />
                }
                label='Is For Host?'
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions className='justify-center pbs-6 sm:pbe-16 sm:pli-16'>
          <Button variant='outlined' color='secondary' onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type='submit' variant='contained' disabled={loading}>
            {loading ? <CircularProgress size={20} /> : editData ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default BannerDialog
