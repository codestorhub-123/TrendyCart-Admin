'use client'

// React Imports
import { useState } from 'react'

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

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import DialogCloseButton from '../DialogCloseButton'
import { createFakeHost } from '@/services/userService'

const CreateFakeHost = ({ open, setOpen, onSuccess }) => {
  // States
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    bio: '',
    imageType: 'upload', // 'upload' or 'url'
    images: [],
    imageUrl: '',
    videoType: 'upload', // 'upload' or 'url'
    video: null,
    videoUrl: '',
    country: '',
    countryCode: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Handle form input change
  const handleChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError(null)
  }

  // Handle multiple image file change
  const handleImageFileChange = e => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...files]
      }))
      setError(null)
    }
  }

  // Handle video file change
  const handleVideoFileChange = e => {
    const file = e.target.files[0]
    if (file) {
      setFormData(prev => ({
        ...prev,
        video: file
      }))
      setError(null)
    }
  }

  // Remove image from list
  const handleRemoveImage = index => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  // Handle form submit
  const handleSubmit = async e => {
    e.preventDefault()
    setError(null)

    // Validate required fields
    if (!formData.name || !formData.email || !formData.age || !formData.bio) {
      setError('Please fill all required fields')
      return
    }

    // Validate images (required)
    if (formData.imageType === 1 && formData.images.length === 0) {
      setError('Please select at least one image')
      return
    }
    if (formData.imageType === 2 && !formData.imageUrl) {
      setError('Please enter image URL')
      return
    }

    // Validate video (required)
    if (formData.videoType === 1 && !formData.video) {
      setError('Please select a video file')
      return
    }
    if (formData.videoType === 2 && !formData.videoUrl) {
      setError('Please enter video URL')
      return
    }

    setLoading(true)

    try {
      // Create FormData
      const submitData = new FormData()
      submitData.append('name', formData.name)
      submitData.append('email', formData.email)
      submitData.append('age', formData.age)
      submitData.append('bio', formData.bio)
      submitData.append('country', formData.country)
      submitData.append('countryCode', formData.countryCode)
      submitData.append('imageType', formData.imageType)

      // Handle images - backend expects 'image' (singular) for multiple files
      if (formData.imageType === 1) {
        formData.images.forEach((image, index) => {
          // Multiple files with same field name 'image'
          submitData.append('image', image)
        })
      } else {
        submitData.append('avatar', formData.imageUrl)
      }

      submitData.append('videoType', formData.videoType)

      // Handle video
      if (formData.videoType === 1) {
        submitData.append('video', formData.video)
      } else {
        submitData.append('video', formData.videoUrl)
      }

      const response = await createFakeHost(submitData)

      if (response.success) {
        // Reset form
        setFormData({
          name: '',
          email: '',
          age: '',
          bio: '',
          country: '',
          countryCode: '',
          imageType: 1,
          images: [],
          imageUrl: '',
          videoType: 1,
          video: null,
          videoUrl: ''
        })
        setOpen(false)
        if (onSuccess) {
          onSuccess()
        }
      } else {
        setError(response.message || 'Failed to create fake host')
      }
    } catch (err) {
      console.error('Error creating fake host:', err)
      setError(err.message || 'Failed to create fake host')
    } finally {
      setLoading(false)
    }
  }

  // Handle close
  const handleClose = () => {
    if (!loading) {
      setFormData({
        name: '',
        email: '',
        age: '',
        bio: '',
        country: '',
        countryCode: '',
        imageType: 1,
        images: [],
        imageUrl: '',
        videoType: 1,
        video: null,
        videoUrl: ''
      })
      setError(null)
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
        Create Fake Host
        <Typography component='span' className='flex flex-col text-center'>
          Add or update fake host information
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
                label='Name *'
                name='name'
                placeholder='Enter host name'
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CustomTextField
                fullWidth
                label='Email *'
                name='email'
                type='email'
                placeholder='Enter email address'
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CustomTextField
                fullWidth
                label='Age *'
                name='age'
                type='number'
                placeholder='Enter age'
                value={formData.age}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CustomTextField
                fullWidth
                multiline
                rows={3}
                label='Bio *'
                name='bio'
                placeholder='Enter bio'
                value={formData.bio}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CustomTextField
                fullWidth
                label='Country *'
                name='country'
                placeholder='Enter country'
                value={formData.country}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CustomTextField
                fullWidth
                label='Country Code *'
                name='countryCode'
                placeholder='Enter country code'
                value={formData.countryCode}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CustomTextField
                fullWidth
                select
                label='Images *'
                name='imageType'
                value={formData.imageType}
                onChange={e => setFormData({ ...formData, imageType: Number(e.target.value) })}
                required
              >
                <MenuItem value={1}>Upload Images</MenuItem>
                <MenuItem value={2}>Image URL</MenuItem>
              </CustomTextField>
            </Grid>
            {formData.imageType === 1 && (
              <>
                <Grid size={{ xs: 12 }}>
                  <CustomTextField
                    fullWidth
                    type='file'
                    label='Select Images'
                    InputLabelProps={{ shrink: true }}
                    inputProps={{
                      accept: 'image/*',
                      multiple: true
                    }}
                    onChange={handleImageFileChange}
                  />
                </Grid>
                {formData.images.length > 0 && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant='body2' className='mb-2' color='text.secondary'>
                      Selected Images ({formData.images.length}):
                    </Typography>
                    <Box className='flex flex-wrap gap-3'>
                      {formData.images.map((image, index) => (
                        <Box
                          key={index}
                          className='relative border border-divider rounded p-2'
                          sx={{ width: 100, height: 100 }}
                        >
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Preview ${index + 1}`}
                            className='w-full h-full object-cover rounded'
                          />
                          <IconButton
                            size='small'
                            onClick={() => handleRemoveImage(index)}
                            className='absolute top-0 right-0'
                            sx={{
                              bgcolor: 'error.main',
                              color: 'error.contrastText',
                              width: 24,
                              height: 24,
                              '&:hover': {
                                bgcolor: 'error.dark'
                              }
                            }}
                          >
                            <i className='tabler-x text-sm' />
                          </IconButton>
                          <Typography
                            variant='caption'
                            className='absolute bottom-0 left-0 right-0 text-center bg-black/50 text-white text-xs p-0.5'
                          >
                            {image.name}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Grid>
                )}
              </>
            )}
            {formData.imageType === 2 && (
              <Grid size={{ xs: 12 }}>
                <CustomTextField
                  fullWidth
                  label='Image URL *'
                  name='imageUrl'
                  placeholder='Enter image URL'
                  value={formData.imageUrl}
                  onChange={handleChange}
                  required
                />
              </Grid>
            )}
            <Grid size={{ xs: 12 }}>
              <CustomTextField
                fullWidth
                select
                label='Video Type *'
                name='videoType'
                value={formData.videoType}
                onChange={e => setFormData({ ...formData, videoType: Number(e.target.value) })}
                required
              >
                <MenuItem value={1}>Upload Video</MenuItem>
                <MenuItem value={2}>Video URL</MenuItem>
              </CustomTextField>
            </Grid>
            {formData.videoType === 1 && (
              <Grid size={{ xs: 12 }}>
                <CustomTextField
                  fullWidth
                  type='file'
                  label='Select Video'
                  InputLabelProps={{ shrink: true }}
                  inputProps={{
                    accept: 'video/*'
                  }}
                  onChange={handleVideoFileChange}
                />
                {formData.video && (
                  <Typography variant='body2' className='mt-2' color='text.secondary'>
                    Selected: {formData.video.name}
                  </Typography>
                )}
              </Grid>
            )}
            {formData.videoType === 2 && (
              <Grid size={{ xs: 12 }}>
                <CustomTextField
                  fullWidth
                  label='Video URL *'
                  name='videoUrl'
                  placeholder='Enter video URL'
                  value={formData.videoUrl}
                  onChange={handleChange}
                  required
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions className='justify-center pbs-6 sm:pbe-16 sm:pli-16'>
          <Button variant='outlined' color='secondary' onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type='submit' variant='contained' disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default CreateFakeHost
