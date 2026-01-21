'use client'

// React Imports
import { useState, useEffect, useMemo } from 'react'

// Component Imports
import { CommonDialog } from '../common'
import { createGift, updateGift, getGiftCategories } from '@/services/userService'

const GiftDialog = ({ open, setOpen, onSuccess, editData }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [categories, setCategories] = useState([])

  // Load categories
  useEffect(() => {
    if (open) {
      loadCategories()
    }
  }, [open])

  const loadCategories = async () => {
    try {
      const result = await getGiftCategories()
      setCategories(result || [])
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  // Define form fields - use useMemo to update when categories change
  const fields = useMemo(
    () => [
      {
        name: 'categoryId',
        label: 'Category',
        type: 'select',
        placeholder: 'Select category',
        required: true,
        options: categories.map(cat => ({
          value: cat._id,
          label: cat.name
        })),
        gridSize: { xs: 12 }
      },
      {
        name: 'name',
        label: 'Name',
        type: 'text',
        placeholder: 'Enter gift name',
        required: true,
        gridSize: { xs: 12 }
      },
      {
        name: 'coins',
        label: 'Coins',
        type: 'number',
        placeholder: 'Enter coins',
        required: true,
        gridSize: { xs: 12 }
      },
      {
        name: 'image',
        label: 'Image',
        type: 'file',
        accept: 'image/*',
        required: !editData, // Required only for create
        gridSize: { xs: 12 }
      }
    ],
    [categories, editData]
  )

  // Handle form submit
  const handleSubmit = async (formData, editData) => {
    setLoading(true)
    setError(null)

    try {
      // Create FormData for file upload
      const submitData = new FormData()

      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
          if (key === 'image' && formData[key] instanceof File) {
            submitData.append(key, formData[key])
          } else if (key === 'isActive') {
            submitData.append(key, String(!!formData[key]))
          } else {
            submitData.append(key, formData[key])
          }
        }
      })

      let response
      if (editData) {
        // Update existing gift
        response = await updateGift(editData._id, submitData)
      } else {
        // Create new gift
        response = await createGift(submitData)
      }

      if (response.success !== false) {
        return response
      } else {
        throw new Error(response.message || `Failed to ${editData ? 'update' : 'create'} gift`)
      }
    } catch (err) {
      console.error(`Error ${editData ? 'updating' : 'creating'} gift:`, err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Handle success
  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess()
    }
  }

  return (
    <CommonDialog
      open={open}
      setOpen={setOpen}
      title={editData ? 'Edit Gift' : 'Create Gift'}
      subtitle={editData ? 'Update gift information' : 'Add a new gift to the system'}
      fields={fields}
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      editData={editData}
      loading={loading}
      error={error}
      submitLabel={editData ? 'Update' : 'Create'}
    />
  )
}

export default GiftDialog
