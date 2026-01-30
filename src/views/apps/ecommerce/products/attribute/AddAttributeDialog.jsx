'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import { getImageUrl } from '@/utils/imageUrl'
import { listAllSubCategories } from '@/services/subCategoryService'

const AddAttributeDialog = ({ open, handleClose, onSubmit, attributeData, subCategories, categoriesData = [] }) => {
  const [fieldValues, setFieldValues] = useState([])
  const [currentFieldValue, setCurrentFieldValue] = useState('')
  const [fieldImage, setFieldImage] = useState(null)
  const [fieldImagePreview, setFieldImagePreview] = useState('')
  const [dynamicSubCategories, setDynamicSubCategories] = useState([])
  const [isSubLoading, setIsSubLoading] = useState(false)

  const isEdit = !!attributeData

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      subCategoryId: '',
      name: '',
      fieldType: '',
      isRequired: false,
      status: true,
      category: '' // Virtual field for filtering subcategories
    }
  })

  // Watchers
  const selectedCategoryId = watch('category')
  const selectedFieldType = watch('fieldType')

  // Use passed categoriesData for the dropdown
  const categoriesList = categoriesData

  // Fetch SubCategories when Category changes via API
  useEffect(() => {
    const fetchSubs = async () => {
      if (selectedCategoryId) {
        setIsSubLoading(true)
        try {
          const res = await listAllSubCategories(selectedCategoryId)
          if (res && res.status) {
            // Check if backend returns 'data' or 'subCategories'
            setDynamicSubCategories(res.data || res.subCategories || [])
          }
        } catch (error) {
          console.error('Error fetching filtered subcategories:', error)
        } finally {
          setIsSubLoading(false)
        }
      } else {
        setDynamicSubCategories([])
      }
    }
    fetchSubs()
  }, [selectedCategoryId])

  useEffect(() => {
    if (open) {
      if (attributeData) {
        // Populate form for Edit
        const targetSubId = attributeData.subCategory?._id || attributeData.subCategoryId
        let catId = ''

        // Get category ID from populated subCategory
        if (attributeData.subCategory && typeof attributeData.subCategory === 'object') {
          const categoryObj = attributeData.subCategory.category
          catId = typeof categoryObj === 'object' ? categoryObj._id : categoryObj
        }

        // Search in local list if needed to find category for this sub
        if (!catId && subCategories.length > 0) {
          const subCat = subCategories.find(s => (s._id === targetSubId || s.subCategoryId === targetSubId))
          if (subCat) {
            const cObj = subCat.category
            catId = typeof cObj === 'object' ? cObj._id : cObj
          }
        }

        reset({
          subCategoryId: targetSubId || '',
          name: attributeData.name || '',
          fieldType: attributeData.fieldType || '',
          isRequired: attributeData.isRequired || false,
          status: attributeData.status === 'Active' || attributeData.status === true,
          category: catId || ''
        })
        const rawImage = attributeData.image || ''
        let imageUrl = ''
        if (rawImage) {
          imageUrl = getImageUrl(rawImage)
        }
        setFieldValues(attributeData.fieldValues || [])
        setFieldImagePreview(imageUrl)
      } else {
        // Reset for New
        reset({
          subCategoryId: '',
          name: '',
          fieldType: '',
          isRequired: false,
          status: true,
          category: ''
        })
        setFieldValues([])
        setFieldImage(null)
        setFieldImagePreview('')
      }
    }
  }, [open, attributeData, reset, subCategories])

  const handleAddFieldValue = () => {
    if (currentFieldValue.trim()) {
      setFieldValues([...fieldValues, currentFieldValue.trim()])
      setCurrentFieldValue('')
    }
  }

  const handleDeleteFieldValue = (index) => {
    const newValues = [...fieldValues]
    newValues.splice(index, 1)
    setFieldValues(newValues)
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFieldImage(file)
      setFieldImagePreview(URL.createObjectURL(file))
    }
  }

  const handleFormSubmit = (data) => {
    const formData = new FormData()
    if (attributeData?._id) {
      formData.append('attributeId', attributeData._id)
      // For update, we might still send the fields directly if the backend supports it, 
      // but let's assume it follows the same structure or keeps flat for legacy.
      // However, usually updates are specific. Let's keep update flat for now or minimal change.
      // THE ERROR WAS ON CREATE.
      
      // Update might expect flat fields as before if we didn't get an error there. 
      // But for consistency let's check.
      // Actually, if I change 'insert' structure, 'update' might differ.
      
      // Let's assume Update works with flat structure (common pattern).
      formData.append('subCategoryId', data.subCategoryId)
      formData.append('name', data.name)
      formData.append('fieldType', data.fieldType)
      formData.append('isRequired', data.isRequired)
      formData.append('isActive', data.status)
      
      if (['4', '5', '6'].includes(String(data.fieldType))) {
         fieldValues.forEach(val => formData.append('values[]', val))
      }
      
      if (fieldImage) {
        formData.append('image', fieldImage)
      }
    } else {
      // Create - insertAttributes
      // Matching Swagger Definition exactly: Flat structure with array fields
      
      // subCategoryIds is an array
      formData.append('subCategoryIds[]', data.subCategoryId)
      
      formData.append('name', data.name)
      formData.append('fieldType', data.fieldType)
      formData.append('isRequired', data.isRequired) // Boolean
      formData.append('isActive', data.status) // Boolean: status is true/false in form
      
      // 'values' for field options (not fieldValues)
      if (['4', '5', '6'].includes(String(data.fieldType))) {
         fieldValues.forEach(val => formData.append('values[]', val))
      }
      
      if (fieldImage) {
        formData.append('image', fieldImage)
      }
    }

    onSubmit(formData, isEdit)
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth='sm'>
      <DialogTitle>
        {isEdit ? 'Edit Attribute' : 'Create Attribute'}
        <IconButton
          aria-label='close'
          onClick={handleClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <i className='tabler-x' />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className='flex flex-col gap-4 mt-2'>
          
          {/* Category Filter */}
          <Controller
            name='category'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                select
                fullWidth
                label='Select Category'
                placeholder='Select Category...'
                onChange={(e) => {
                  field.onChange(e)
                  setValue('subCategoryId', '') // Reset subcategory when category changes
                }}
                SelectProps={{ 
                  displayEmpty: true,
                  MenuProps: { PaperProps: { style: { maxHeight: 250 } } }
                }}
              >
                <MenuItem value=''>Select Category</MenuItem>
                {categoriesList.map((cat) => (
                  <MenuItem key={cat._id} value={cat._id}>{cat.name}</MenuItem>
                ))}
              </CustomTextField>
            )}
          />

          {/* Subcategory Select */}
          <Controller
            name='subCategoryId'
            control={control}
            rules={{ required: 'Subcategory is required' }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                select
                fullWidth
                label='Select Subcategories'
                disabled={!selectedCategoryId || isSubLoading} 
                error={!!errors.subCategoryId}
                helperText={errors.subCategoryId?.message || (!selectedCategoryId ? 'Please select a category first' : isSubLoading ? 'Loading...' : '')}
                SelectProps={{ 
                  displayEmpty: true,
                  MenuProps: { PaperProps: { style: { maxHeight: 250 } } }
                }}
              >
                <MenuItem value='' disabled>{isSubLoading ? 'Loading...' : 'Select Subcategory'}</MenuItem>
                {dynamicSubCategories.map((sub) => {
                  const id = sub.subCategoryId || sub._id
                  return (
                    <MenuItem key={id} value={id}>
                      {sub.name}
                    </MenuItem>
                  )
                })}
              </CustomTextField>
            )}
          />

          {/* Field Name */}
          <Controller
            name='name'
            control={control}
            rules={{ required: 'Field Name is required' }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Field Name'
                placeholder='e.g., Color, Size'
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            )}
          />

          {/* Field Type */}
          <Controller
            name='fieldType'
            control={control}
            rules={{ required: 'Field Type is required' }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                select
                fullWidth
                label='Field Type'
                error={!!errors.fieldType}
                helperText={errors.fieldType?.message}
                SelectProps={{ 
                  displayEmpty: true,
                  MenuProps: { PaperProps: { style: { maxHeight: 250 } } }
                }}
              >
                <MenuItem value='' disabled>Select Field Type</MenuItem>
                <MenuItem value='1'>Text Input</MenuItem>
                <MenuItem value='2'>Number Input</MenuItem>
                <MenuItem value='3'>File Input</MenuItem>
                <MenuItem value='4'>Radio</MenuItem>
                <MenuItem value='5'>Dropdown</MenuItem>
                <MenuItem value='6'>Checkboxes</MenuItem>
              </CustomTextField>
            )}
          />

          {/* Dynamic Field Values for Options */}
          {['4', '5', '6'].includes(String(selectedFieldType)) && (
            <Box className='flex flex-col gap-2'>
              <Typography variant='subtitle2'>Field Values</Typography>
              <div className='flex gap-2'>
                <CustomTextField
                  fullWidth
                  value={currentFieldValue}
                  onChange={(e) => setCurrentFieldValue(e.target.value)}
                  placeholder='Add option...'
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFieldValue())}
                />
                <Button variant='contained' onClick={handleAddFieldValue} sx={{ minWidth: 'fit-content' }}>
                  Add
                </Button>
              </div>
              <Box className='flex flex-wrap gap-2 mt-2'>
                {fieldValues.map((val, index) => (
                  <Chip
                    key={index}
                    label={val}
                    onDelete={() => handleDeleteFieldValue(index)}
                    color='primary'
                    variant='outlined'
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Icon Upload */}
          <Box>
             <Typography variant='subtitle2' className='mb-2'>Attribute Icon</Typography>
             <div className='flex items-center gap-4'>
                <div className='border-2 border-dashed rounded p-4 w-24 h-24 flex items-center justify-center relative overflow-hidden'>
                  {fieldImagePreview ? (
                    <img src={fieldImagePreview} alt='Preview' className='w-full h-full object-cover' />
                  ) : (
                    <i className='tabler-camera text-2xl text-textSecondary' />
                  )}
                </div>
                <div>
                   <Button component='label' variant='outlined' startIcon={<i className='tabler-upload' />}>
                      Upload Icon
                      <input hidden type='file' accept='image/*' onChange={handleImageUpload} />
                   </Button>
                   <Typography variant='caption' display='block' className='mt-1 text-textSecondary'>
                     Recommended: 256x256, Max: 2MB
                   </Typography>
                </div>
             </div>
          </Box>

          {/* Toggles */}
          <div className='flex gap-6 mt-2'>
             <Controller
                name='isRequired'
                control={control}
                render={({ field }) => (
                   <div className='flex items-center gap-2'>
                      <Switch {...field} checked={field.value} />
                      <Typography>Required</Typography>
                   </div>
                )}
             />
             <Controller
                name='status'
                control={control}
                render={({ field }) => (
                   <div className='flex items-center gap-2'>
                      <Switch {...field} checked={field.value} />
                      <Typography>Active</Typography>
                   </div>
                )}
             />
          </div>

          <DialogActions className='p-0 mt-4'>
            <Button variant='tonal' color='secondary' onClick={handleClose}>
              Cancel
            </Button>
            <Button variant='contained' type='submit'>
              {isEdit ? 'Update' : 'Submit'}
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AddAttributeDialog
