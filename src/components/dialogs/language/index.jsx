'use client'

// React Imports
import { useState } from 'react'

// Component Imports
import { CommonDialog } from '../common'
import { createLanguage } from '@/services/userService'

const LanguageDialog = ({ open, setOpen, onSuccess, editData }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Define form fields
  const fields = [
    {
      name: 'language',
      label: 'Language',
      type: 'text',
      placeholder: 'Enter language name',
      required: true,
      gridSize: { xs: 12 }
    }
  ]

  // Handle form submit
  const handleSubmit = async (formData, editData) => {
    setLoading(true)
    setError(null)

    try {
      // Map formData to API expected format
      const apiData = {
        language: formData.language
      }

      // Note: API only has create, no update endpoint
      const response = await createLanguage(apiData)

      if (response.success !== false) {
        return response
      } else {
        throw new Error(response.message || 'Failed to save language')
      }
    } catch (err) {
      console.error('Error saving language:', err)
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
      title={editData ? 'Edit Language' : 'Create Language'}
      subtitle={editData ? 'Update language information' : 'Add a new language to the system'}
      fields={fields}
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      editData={editData}
      loading={loading}
      error={error}
    />
  )
}

export default LanguageDialog
