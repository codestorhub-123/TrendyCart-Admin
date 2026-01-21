'use client'

// React Imports
import { useState, useMemo } from 'react'

// Component Imports
import { CommonDialog } from '../common'
import { createLevel, updateLevel } from '@/services/userService'

const LevelDialog = ({ open, setOpen, onSuccess, editData }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Define form fields
  const fields = useMemo(
    () => [
      {
        name: 'image',
        label: 'Image',
        type: 'file',
        accept: 'image/*',
        required: !editData, // Required only for create
        gridSize: { xs: 12 }
      },
      {
        name: 'level',
        label: 'Level',
        type: 'number',
        placeholder: 'Enter level number',
        required: true,
        gridSize: { xs: 12 }
      },
      {
        name: 'coinRequirement',
        label: 'Coin Requirement',
        type: 'number',
        placeholder: 'Enter coin requirement',
        required: true,
        gridSize: { xs: 12 }
      },
      {
        name: 'isActive',
        label: 'Active Status',
        type: 'switch',
        defaultValue: true,
        gridSize: { xs: 12 }
      }
    ],
    [editData]
  )

  // Handle form submit
  const handleSubmit = async (formData, editData) => {
    setLoading(true)
    setError(null)

    try {
      // Validate required fields
      if (!formData.level || Number(formData.level) <= 0) {
        throw new Error('Level must be greater than 0')
      }
      if (!formData.coinRequirement || Number(formData.coinRequirement) <= 0) {
        throw new Error('Coin requirement must be greater than 0')
      }
      if (!editData && (!formData.image || !(formData.image instanceof File))) {
        throw new Error('Image is required for creating a level')
      }

      // Prepare data object - buildLevelFormData will convert it to FormData
      const submitData = {
        level: Number(formData.level),
        coinRequirement: Number(formData.coinRequirement),
        isActive: formData.isActive !== false
      }

      // Add image only if it's a File (new upload)
      if (formData.image && formData.image instanceof File) {
        submitData.image = formData.image
      }

      console.log('Submitting level data:', {
        level: submitData.level,
        coinRequirement: submitData.coinRequirement,
        isActive: submitData.isActive,
        hasImage: !!submitData.image
      })

      let response
      if (editData) {
        // Update existing level
        response = await updateLevel(editData._id, submitData)
      } else {
        // Create new level
        response = await createLevel(submitData)
      }

      if (response && response.success !== false) {
        return response
      } else {
        throw new Error(response?.message || `Failed to ${editData ? 'update' : 'create'} level`)
      }
    } catch (err) {
      console.error(`Error ${editData ? 'updating' : 'creating'} level:`, err)
      const errorMessage = err.message || `Failed to ${editData ? 'update' : 'create'} level`
      setError(errorMessage)
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
      title={editData ? 'Edit Level' : 'Create Level'}
      subtitle={editData ? 'Update level information' : 'Add a new level to the system'}
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

export default LevelDialog
