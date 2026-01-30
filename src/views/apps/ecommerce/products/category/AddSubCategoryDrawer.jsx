'use client'

// React Imports
import { useState, useRef, useEffect } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'

// Components Imports
import CustomTextField from '@core/components/mui/TextField'

// Service Imports
import { createSubCategory, updateSubCategory } from '@/services/subCategoryService'
import { getAllCategories } from '@/services/categoryService'
import { getImageUrl } from '@/utils/imageUrl'

const AddSubCategoryDrawer = props => {
  // Props
  const { open, handleClose, onSuccess, categoryId, subCategoryData } = props

  // States
  const [fileName, setFileName] = useState('')
  const [file, setFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [categories, setCategories] = useState([])
  
  // Refs
  const fileInputRef = useRef(null)

  // Hooks
  const {
    control,
    reset: resetForm,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: '',
      category: ''
    }
  })

  // Fetch categories if needed
  useEffect(() => {
    const fetchCategories = async () => {
      if (!categoryId && open) {
        try {
          const res = await getAllCategories()
          if (res && (res.status === true || res.success)) {
            setCategories(res.category || res.data || [])
          }
        } catch (error) {
          console.error("Failed to fetch categories", error)
        }
      }
    }
    fetchCategories()
  }, [categoryId, open])

  useEffect(() => {
    if (subCategoryData) {
      resetForm({ 
        name: subCategoryData.name || '',
        category: subCategoryData.category || ''
      })
      if (subCategoryData.image) {
          setImagePreview(getImageUrl(subCategoryData.image))
          setFileName('Existing Image')
      }
    } else {
      resetForm({ name: '', category: '' })
      setFileName('')
      setFile(null)
      setImagePreview('')
    }
  }, [subCategoryData, open, resetForm])

  // Handle Form Submit
  const handleFormSubmit = async (data) => {
    const formData = new FormData()
    formData.append('name', data.name)
    
    if (file) {
      formData.append('image', file)
    }

    try {
        let res
        if (subCategoryData) {
            const subId = subCategoryData._id || subCategoryData.id || subCategoryData.subCategoryId
            if (!subId) {
                alert("Cannot update: Subcategory ID not found in data.")
                return
            }
            res = await updateSubCategory(formData, subId, categoryId)
        } else {
            // Logic for Category ID
            if (categoryId) {
              formData.append('category', categoryId)
            } else if (data.category) {
              formData.append('category', data.category)
            } else {
                alert("Category is required")
                return
            }

            if (!file) {
                alert("Image is required for creation")
                return
            }

            res = await createSubCategory(formData)
        }

        if (res && (res.status === true || res.success)) {
            handleReset()
            if (onSuccess) onSuccess()
        } else {
            const errorMsg = res?.message || res?.msg || "Failed to save subcategory"
            alert(errorMsg)
        }
    } catch (error) {
        console.error("Form submit error:", error)
        alert("An error occurred while saving the subcategory")
    }
  }

  // Handle Form Reset
  const handleReset = () => {
    handleClose()
    resetForm({ name: '', category: '' })
    setFileName('')
    setFile(null)
    setImagePreview('')
  }

  // Handle File Upload
  const handleFileUpload = event => {
    const { files } = event.target
    if (files && files.length !== 0) {
      setFileName(files[0].name)
      setFile(files[0])
      setImagePreview(URL.createObjectURL(files[0]))
    }
  }

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleReset}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <div className='flex items-center justify-between pli-6 plb-5'>
        <Typography variant='h5'>{subCategoryData ? 'Edit Sub Category' : 'Add Sub Category'}</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='tabler-x text-textSecondary text-2xl' />
        </IconButton>
      </div>
      <Divider />
      <div className='p-6'>
        <form onSubmit={handleSubmit(data => handleFormSubmit(data))} className='flex flex-col gap-5'>
          <Controller
            name='name'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Sub Category Name'
                placeholder='e.g. Men Clothing'
                {...(errors.name && { error: true, helperText: 'This field is required.' })}
              />
            )}
          />
          
          {!categoryId && !subCategoryData && (
              <Controller
                name='category'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                <CustomTextField
                    {...field}
                    select
                    fullWidth
                    label='Select Category'
                    {...(errors.category && { error: true, helperText: 'Category is required.' })}
                >
                    {categories.length > 0 ? (
                        categories.map((cat) => (
                            <MenuItem key={cat.id || cat._id} value={cat.id || cat._id}>
                                {cat.name}
                            </MenuItem>
                        ))
                    ) : (
                        <MenuItem value="" disabled>No Categories Available</MenuItem>
                    )}
                </CustomTextField>
                )}
            />
          )}

          <div className='flex flex-col gap-2'>
            <Typography variant="body2">Category Image</Typography>
            <div className='flex items-end gap-4'>
                <CustomTextField
                placeholder='No file chosen'
                value={fileName || ''}
                className='flex-auto'
                slotProps={{
                    input: {
                    readOnly: true,
                    endAdornment: fileName ? (
                        <InputAdornment position='end'>
                        <IconButton size='small' edge='end' onClick={() => {
                            setFileName('')
                            setFile(null)
                            setImagePreview('')
                        }}>
                            <i className='tabler-x' />
                        </IconButton>
                        </InputAdornment>
                    ) : null
                    }
                }}
                />
                <Button component='label' variant='tonal' htmlFor='contained-button-file' className='min-is-fit'>
                Choose
                <input hidden id='contained-button-file' type='file' onChange={handleFileUpload} ref={fileInputRef} />
                </Button>
            </div>
            {imagePreview && (
                <div className='mt-2'>
                    <img src={imagePreview} alt="Preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                </div>
            )}
          </div>

          <div className='flex items-center gap-4 mt-4'>
            <Button variant='contained' type='submit'>
              {subCategoryData ? 'Update' : 'Add'}
            </Button>
            <Button variant='tonal' color='error' type='reset' onClick={handleReset}>
              Discard
            </Button>
          </div>
        </form>
      </div>
    </Drawer>
  )
}

export default AddSubCategoryDrawer
