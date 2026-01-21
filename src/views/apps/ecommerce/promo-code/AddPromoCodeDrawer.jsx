'use client'

import { useState, useEffect } from 'react'
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import { useForm, Controller } from 'react-hook-form'

import CustomTextField from '@core/components/mui/TextField'
import { createPromoCode, updatePromoCode } from '@/services/promoCodeService'

const AddPromoCodeDrawer = props => {
  const { open, handleClose, onSuccess, promoCodeData } = props

  const {
    control,
    reset: resetForm,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      promoCode: '',
      discountType: 1,
      discountAmount: '',
      minOrderValue: '',
      conditions: ''
    }
  })

  useEffect(() => {
    if (promoCodeData) {
      resetForm({
        promoCode: promoCodeData.promoCode || '',
        discountType: promoCodeData.discountType || 1,
        discountAmount: promoCodeData.discountAmount || '',
        minOrderValue: promoCodeData.minOrderValue || '',
        conditions: (promoCodeData.conditions || []).join('\n')
      })
    } else {
      resetForm({
        promoCode: '',
        discountType: 1,
        discountAmount: '',
        minOrderValue: '',
        conditions: ''
      })
    }
  }, [promoCodeData, open])

  const handleFormSubmit = async (data) => {
    const payload = {
      ...data,
      discountType: Number(data.discountType),
      discountAmount: Number(data.discountAmount),
      minOrderValue: Number(data.minOrderValue),
      conditions: data.conditions.split('\n').filter(c => c.trim() !== '')
    }

    try {
      console.log('Sending PromoCode Payload:', payload)
      let res
      if (promoCodeData) {
        const promoId = promoCodeData._id || promoCodeData.promoCodeId
        res = await updatePromoCode(payload, promoId)
      } else {
        res = await createPromoCode(payload)
      }

      console.log('PromoCode Response:', res)

      if (res && (res.status === true || res.success === true)) {
        handleReset()
        if (onSuccess) onSuccess()
      } else {
        const msg = res?.message || res?.msg || 'Failed to save promo code'
        alert(msg)
      }
    } catch (error) {
      console.error('Form submit error:', error)
      alert('An error occurred while saving the promo code')
    }
  }

  const handleReset = () => {
    handleClose()
    resetForm({
      promoCode: '',
      discountType: 1,
      discountAmount: '',
      minOrderValue: '',
      conditions: ''
    })
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
        <Typography variant='h5'>{promoCodeData ? 'Edit Promo Code' : 'Add Promo Code'}</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='tabler-x text-textSecondary text-2xl' />
        </IconButton>
      </div>
      <Divider />
      <div className='p-6'>
        <form onSubmit={handleSubmit(data => handleFormSubmit(data))} className='flex flex-col gap-5'>
          <Controller
            name='promoCode'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Promo Code'
                placeholder='e.g. SUMMER50'
                {...(errors.promoCode && { error: true, helperText: 'This field is required.' })}
              />
            )}
          />

          <Controller
            name='discountType'
            control={control}
            render={({ field }) => (
              <CustomTextField
                select
                fullWidth
                label='Discount Type'
                {...field}
              >
                <MenuItem value={1}>Flat</MenuItem>
                <MenuItem value={2}>Percentage</MenuItem>
              </CustomTextField>
            )}
          />

          <Controller
            name='discountAmount'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                type='number'
                label='Discount Amount'
                placeholder='e.g. 50'
                {...(errors.discountAmount && { error: true, helperText: 'This field is required.' })}
              />
            )}
          />

          <Controller
            name='minOrderValue'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                type='number'
                label='Min Order Value'
                placeholder='e.g. 200'
              />
            )}
          />

          <Controller
            name='conditions'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                multiline
                rows={4}
                label='Conditions'
                placeholder='Enter each condition on a new line'
              />
            )}
          />

          <div className='flex items-center gap-4 mt-4'>
            <Button variant='contained' type='submit'>
              {promoCodeData ? 'Update' : 'Add'}
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

export default AddPromoCodeDrawer
