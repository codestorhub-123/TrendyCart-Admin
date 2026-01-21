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
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import DialogCloseButton from '../DialogCloseButton'

/**
 * CommonDialog - A reusable dialog component for forms
 * @param {Object} props
 * @param {boolean} props.open - Dialog open state
 * @param {Function} props.setOpen - Function to set dialog open state
 * @param {string} props.title - Dialog title
 * @param {string} props.subtitle - Dialog subtitle
 * @param {Array} props.fields - Array of field configurations
 * @param {Function} props.onSubmit - Submit handler function
 * @param {Function} props.onSuccess - Success callback
 * @param {Object} props.editData - Data for edit mode
 * @param {boolean} props.loading - Loading state
 * @param {string} props.error - Error message
 * @param {string} props.submitLabel - Submit button label (default: 'Create' or 'Update')
 * @param {string} props.cancelLabel - Cancel button label (default: 'Cancel')
 * @param {string} props.maxWidth - Dialog max width (default: 'md')
 * @param {Function} props.onClose - Custom close handler
 */
const CommonDialog = ({
  open,
  setOpen,
  title,
  subtitle,
  fields = [],
  onSubmit,
  onSuccess,
  editData = null,
  loading: externalLoading = false,
  error: externalError = null,
  submitLabel = null,
  cancelLabel = 'Cancel',
  maxWidth = 'md',
  onClose = null
}) => {
  // States
  const [formData, setFormData] = useState({})
  const [internalLoading, setInternalLoading] = useState(false)
  const [internalError, setInternalError] = useState(null)

  // Use external or internal loading/error states
  const loading = externalLoading || internalLoading
  const error = externalError || internalError

  // Initialize form data from fields
  useEffect(() => {
    if (open) {
      const initialData = {}
      fields.forEach(field => {
        if (editData && editData[field.name] !== undefined) {
          initialData[field.name] = editData[field.name]
        } else if (field.defaultValue !== undefined) {
          initialData[field.name] = field.defaultValue
        } else if (field.type === 'file' || field.type === 'file-multiple') {
          initialData[field.name] = field.type === 'file-multiple' ? [] : null
        } else if (field.type === 'switch' || field.type === 'checkbox') {
          initialData[field.name] = false
        } else {
          initialData[field.name] = ''
        }
      })
      setFormData(initialData)
      setInternalError(null)
    }
  }, [open, editData, fields])

  // Handle form input change
  const handleChange = e => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' || type === 'switch' ? checked : value
    }))
    setInternalError(null)
  }

  // Handle file change
  const handleFileChange =
    (fieldName, isMultiple = false) =>
    e => {
      const files = e.target.files
      if (files && files.length > 0) {
        if (isMultiple) {
          const fileArray = Array.from(files)
          setFormData(prev => ({
            ...prev,
            [fieldName]: [...(prev[fieldName] || []), ...fileArray]
          }))
        } else {
          setFormData(prev => ({
            ...prev,
            [fieldName]: files[0]
          }))
        }
        setInternalError(null)
      }
    }

  // Remove file
  const handleRemoveFile = (fieldName, index = null) => {
    if (index !== null) {
      // Remove specific file from array
      setFormData(prev => ({
        ...prev,
        [fieldName]: prev[fieldName].filter((_, i) => i !== index)
      }))
    } else {
      // Remove single file
      setFormData(prev => ({
        ...prev,
        [fieldName]: null
      }))
    }
  }

  // Handle form submit
  const handleSubmit = async e => {
    e.preventDefault()
    setInternalError(null)

    // Validate required fields
    const missingFields = fields
      .filter(field => {
        if (!field.required) return false
        const value = formData[field.name]
        // For file fields, check if it's a File object or array with files
        if (field.type === 'file') {
          return !(value instanceof File)
        }
        if (field.type === 'file-multiple') {
          return !(Array.isArray(value) && value.length > 0)
        }
        // For other fields, check if value exists
        return !value
      })
      .map(field => field.label || field.name)

    if (missingFields.length > 0) {
      setInternalError(`Please fill all required fields: ${missingFields.join(', ')}`)
      return
    }

    // Custom validation
    if (fields.some(field => field.validate)) {
      for (const field of fields) {
        if (field.validate) {
          const validationError = field.validate(formData[field.name], formData)
          if (validationError) {
            setInternalError(validationError)
            return
          }
        }
      }
    }

    setInternalLoading(true)

    try {
      let response
      if (onSubmit) {
        response = await onSubmit(formData, editData)
      } else {
        throw new Error('onSubmit handler is required')
      }

      if (response && response.success !== false) {
        setOpen(false)
        if (onSuccess) {
          onSuccess(response)
        }
      } else {
        setInternalError(response?.message || 'Failed to save')
      }
    } catch (err) {
      console.error('Error submitting form:', err)
      setInternalError(err.message || 'Failed to save')
    } finally {
      setInternalLoading(false)
    }
  }

  // Handle close
  const handleClose = () => {
    if (!loading) {
      if (onClose) {
        onClose()
      } else {
        setOpen(false)
      }
    }
  }

  // Render field based on type
  const renderField = field => {
    const { name, label, type, placeholder, required, options, gridSize = { xs: 12 }, ...fieldProps } = field

    switch (type) {
      case 'text':
      case 'email':
      case 'number':
      case 'password':
      case 'url':
        return (
          <Grid key={name} size={gridSize}>
            <CustomTextField
              fullWidth
              label={label + (required ? ' *' : '')}
              name={name}
              type={type}
              placeholder={placeholder}
              value={formData[name] || ''}
              onChange={handleChange}
              required={required}
              {...fieldProps}
            />
          </Grid>
        )

      case 'textarea':
        return (
          <Grid key={name} size={gridSize}>
            <CustomTextField
              fullWidth
              multiline
              rows={field.rows || 3}
              label={label + (required ? ' *' : '')}
              name={name}
              placeholder={placeholder}
              value={formData[name] || ''}
              onChange={handleChange}
              required={required}
              {...fieldProps}
            />
          </Grid>
        )

      case 'select':
        return (
          <Grid key={name} size={gridSize}>
            <CustomTextField
              fullWidth
              select
              label={label + (required ? ' *' : '')}
              name={name}
              value={formData[name] || ''}
              onChange={handleChange}
              required={required}
              {...fieldProps}
            >
              {options?.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </CustomTextField>
          </Grid>
        )

      case 'file':
        return (
          <Grid key={name} size={gridSize}>
            <Box>
              <CustomTextField
                fullWidth
                type='file'
                label={label + (required ? ' *' : '')}
                onChange={handleFileChange(name, false)}
                inputProps={{ accept: field.accept }}
                {...fieldProps}
              />
              {formData[name] && (
                <Box className='mt-2 flex items-center gap-2'>
                  <Typography variant='body2'>{formData[name].name || 'File selected'}</Typography>
                  <IconButton size='small' onClick={() => handleRemoveFile(name)}>
                    <i className='tabler-x' />
                  </IconButton>
                </Box>
              )}
            </Box>
          </Grid>
        )

      case 'file-multiple':
        return (
          <Grid key={name} size={gridSize}>
            <Box>
              <CustomTextField
                fullWidth
                type='file'
                label={label + (required ? ' *' : '')}
                onChange={handleFileChange(name, true)}
                inputProps={{ accept: field.accept, multiple: true }}
                {...fieldProps}
              />
              {formData[name] && formData[name].length > 0 && (
                <Box className='mt-2'>
                  {formData[name].map((file, index) => (
                    <Box key={index} className='flex items-center gap-2 mb-1'>
                      <Typography variant='body2'>{file.name}</Typography>
                      <IconButton size='small' onClick={() => handleRemoveFile(name, index)}>
                        <i className='tabler-x' />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Grid>
        )

      case 'switch':
        return (
          <Grid key={name} size={gridSize}>
            <FormControlLabel
              control={<Switch name={name} checked={formData[name] || false} onChange={handleChange} {...fieldProps} />}
              label={label}
            />
          </Grid>
        )

      default:
        return (
          <Grid key={name} size={gridSize}>
            <CustomTextField
              fullWidth
              label={label + (required ? ' *' : '')}
              name={name}
              placeholder={placeholder}
              value={formData[name] || ''}
              onChange={handleChange}
              required={required}
              {...fieldProps}
            />
          </Grid>
        )
    }
  }

  // Determine submit label
  const getSubmitLabel = () => {
    if (submitLabel) return submitLabel
    return editData ? 'Update' : 'Create'
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={maxWidth}
      fullWidth
      scroll='body'
      closeAfterTransition={false}
      sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
    >
      <DialogTitle variant='h4' className='flex gap-2 flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
        {title}
        {subtitle && (
          <Typography component='span' className='flex flex-col text-center'>
            {subtitle}
          </Typography>
        )}
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
            {fields.map(field => renderField(field))}
          </Grid>
        </DialogContent>
        <DialogActions className='justify-center pbs-6 sm:pbe-16 sm:pli-16'>
          <Button variant='outlined' color='secondary' onClick={handleClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button type='submit' variant='contained' disabled={loading}>
            {loading ? <CircularProgress size={20} /> : getSubmitLabel()}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default CommonDialog
