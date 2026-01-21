'use client'

// React Imports
import { useState } from 'react'

// Component Imports
import { CommonDialog } from '../common'
import { createGiftCategory, updateGiftCategory } from '@/services/userService'

const GiftCategoryDialog = ({ open, setOpen, onSuccess, editData }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Define form fields
  const fields = [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      placeholder: 'Enter gift category name',
      required: true,
      gridSize: { xs: 12 }
    }
  ]

  // Handle form submit
  const handleSubmit = async (formData, editData) => {
    setLoading(true)
    setError(null)

    try {
      let response
      if (editData) {
        response = await updateGiftCategory(editData._id, formData)
      } else {
        response = await createGiftCategory(formData)
      }

      if (response.success) {
        return response
      } else {
        throw new Error(response.message || 'Failed to save gift category')
      }
    } catch (err) {
      console.error('Error saving gift category:', err)
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
      title={editData ? 'Edit Gift Category' : 'Create Gift Category'}
      subtitle={editData ? 'Update gift category information' : 'Add a new gift category to the system'}
      fields={fields}
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      editData={editData}
      loading={loading}
      error={error}
    />
  )
}

export default GiftCategoryDialog
