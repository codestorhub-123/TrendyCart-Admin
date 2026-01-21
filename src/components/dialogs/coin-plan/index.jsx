'use client'

// React Imports
import { useState, useMemo } from 'react'

// Component Imports
import { CommonDialog } from '../common'
import { createCoinPlan, updateCoinPlan } from '@/services/userService'

const CoinPlanDialog = ({ open, setOpen, onSuccess, editData }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Define form fields
  const fields = useMemo(
    () => [
      {
        name: 'name',
        label: 'Name',
        type: 'text',
        placeholder: 'Enter plan name',
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
        name: 'productId',
        label: 'Product ID',
        type: 'text',
        placeholder: 'Enter product ID',
        required: true,
        gridSize: { xs: 12 }
      },
      {
        name: 'rupees',
        label: 'Rupees',
        type: 'number',
        placeholder: 'Enter rupees',
        required: true,
        gridSize: { xs: 12 }
      },
      {
        name: 'dollars',
        label: 'Dollars',
        type: 'number',
        placeholder: 'Enter dollars',
        required: true,
        gridSize: { xs: 12 }
      },
      {
        name: 'description',
        label: 'Description',
        type: 'textarea',
        placeholder: 'Enter description',
        rows: 3,
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
    []
  )

  // Handle form submit
  const handleSubmit = async (formData, editData) => {
    setLoading(true)
    setError(null)

    try {
      // Convert formData to match API expectations
      const submitData = {
        name: formData.name,
        coins: Number(formData.coins),
        productId: formData.productId,
        rupees: Number(formData.rupees),
        dollars: Number(formData.dollars),
        description: formData.description || '',
        isActive: formData.isActive !== false
      }

      let response
      if (editData) {
        // Update existing coin plan
        response = await updateCoinPlan(editData._id, submitData)
      } else {
        // Create new coin plan
        response = await createCoinPlan(submitData)
      }

      if (response.success !== false) {
        return response
      } else {
        throw new Error(response.message || `Failed to ${editData ? 'update' : 'create'} coin plan`)
      }
    } catch (err) {
      console.error(`Error ${editData ? 'updating' : 'creating'} coin plan:`, err)
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
      title={editData ? 'Edit Coin Plan' : 'Create Coin Plan'}
      subtitle={editData ? 'Update coin plan information' : 'Add a new coin plan to the system'}
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

export default CoinPlanDialog
