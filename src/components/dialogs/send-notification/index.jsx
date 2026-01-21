'use client'

// React Imports
import { useState } from 'react'

// Component Imports
import { CommonDialog } from '../common'
import { sendNotification } from '@/services/userService'
import { toast } from 'react-toastify'

const SendNotification = ({ open, setOpen, userId }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Define form fields
  const fields = [
    {
      name: 'title',
      label: 'Title',
      type: 'text',
      placeholder: 'Enter notification title',
      required: true,
      gridSize: { xs: 12 }
    },
    {
      name: 'message',
      label: 'Message',
      type: 'textarea',
      placeholder: 'Enter notification message',
      required: true,
      rows: 4,
      gridSize: { xs: 12 }
    },
    {
      name: 'image',
      label: 'Image (Optional)',
      type: 'file',
      accept: 'image/*',
      gridSize: { xs: 12 }
    }
  ]

  // Handle form submit
  const handleSubmit = async (formData, editData) => {
    setLoading(true)
    setError(null)

    try {
      if (!formData.title?.trim()) {
        throw new Error('Title is required')
      }
      if (!formData.message?.trim()) {
        throw new Error('Message is required')
      }

      const response = await sendNotification({
        id: userId,
        title: formData.title.trim(),
        message: formData.message.trim(),
        image: formData.image
      })

      if (response && response.success !== false) {
        toast.success('Notification sent successfully')
        return response
      } else {
        throw new Error(response?.message || 'Failed to send notification')
      }
    } catch (err) {
      console.error('Error sending notification:', err)
      setError(err.message || 'Failed to send notification')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Handle success
  const handleSuccess = () => {
    // Dialog will close automatically
  }

  return (
    <CommonDialog
      open={open}
      setOpen={setOpen}
      title='Send Notification'
      subtitle='Send a notification to the user'
      fields={fields}
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      loading={loading}
      error={error}
      submitLabel='Send Notification'
      maxWidth='md'
    />
  )
}

export default SendNotification
