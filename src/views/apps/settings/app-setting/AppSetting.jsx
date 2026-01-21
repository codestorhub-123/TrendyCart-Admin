'use client'

import { useEffect, useState } from 'react'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import { toast } from 'react-hot-toast'

import CustomTextField from '@core/components/mui/TextField'
import { getSetting, updateSetting, handleSwitch, handleFieldSwitch } from '@/services/settingService'

const AppSetting = () => {
  const [settingData, setSettingData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitLoading, setIsSubmitLoading] = useState(false)

  // Local state for form fields to handle inputs before submit
  const [formData, setFormData] = useState({
    zegoAppId: '',
    zegoAppSignIn: '',
    cancelOrderCharges: 0,
    adminCommissionCharges: 0,
    resendApiKey: '',
    minWithdrawalAmount: 0,
    openAiKey: '',
    firebaseKey: ''
  })

  const fetchData = async () => {
    setIsLoading(true)
    const res = await getSetting()
    if (res && res.status === true && res.setting) {
      setSettingData(res.setting)
      setFormData({
        zegoAppId: res.setting.zegoAppId || '',
        zegoAppSignIn: res.setting.zegoAppSignIn || '',
        cancelOrderCharges: res.setting.cancelOrderCharges || 0,
        adminCommissionCharges: res.setting.adminCommissionCharges || 0,
        resendApiKey: res.setting.resendApiKey || '',
        minWithdrawalAmount: res.setting.withdrawLimit || 0,
        openAiKey: res.setting.openaiApiKey || '',
        firebaseKey: typeof res.setting.privateKey === 'object' ? JSON.stringify(res.setting.privateKey) : (res.setting.privateKey || '')
      })
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleTextChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleToggle = async (type) => {
    // Determine the property name in local state vs the type enum for API
    let stateKey = type
    if (type === 'productRequest') stateKey = 'isAddProductRequest'
    if (type === 'updateProductRequest') stateKey = 'isUpdateProductRequest'

    // Optimistic update
    const oldValue = settingData[stateKey]
    setSettingData(prev => ({ ...prev, [stateKey]: !oldValue }))

    const res = await handleSwitch(settingData._id, type)
    if (res && res.status === true) {
      toast.success(res.message || 'Updated successfully')
      // Update with server response
      if(res.setting) setSettingData(res.setting)
    } else {
      toast.error(res.message || 'Update failed')
      // Revert on failure
      setSettingData(prev => ({ ...prev, [stateKey]: oldValue }))
    }
  }

  const handleFieldToggle = async (field, toggleType) => {
     // Optimistic update nested field
     const oldFieldData = settingData[field]
     const oldValue = oldFieldData ? oldFieldData[toggleType] : false

     setSettingData(prev => ({
         ...prev,
         [field]: {
             ...prev[field],
             [toggleType]: !oldValue
         }
     }))

     const res = await handleFieldSwitch(settingData._id, field, toggleType)
     if (res && res.status === true) {
         toast.success(res.message || 'Updated successfully')
          if(res.data) setSettingData(prev => ({ ...prev, ...res.data }))
     } else {
         toast.error(res.message || 'Update failed')
         // Revert
         setSettingData(prev => ({
            ...prev,
            [field]: {
                ...prev[field],
                [toggleType]: oldValue
            }
        }))
     }
  }

  const handleSubmit = async () => {
    setIsSubmitLoading(true)
    // Construct payload
    const payload = {
        zegoAppId: formData.zegoAppId,
        zegoAppSignIn: formData.zegoAppSignIn,
        cancelOrderCharges: Number(formData.cancelOrderCharges),
        commissionPercent: Number(formData.adminCommissionCharges),
        resendApiKey: formData.resendApiKey,
        minValueForWithdrawal: Number(formData.minWithdrawalAmount),
        openAiKey: formData.openAiKey,
        firebaseKey: formData.firebaseKey // Assuming string for now, validation might be needed if backend expects object
    }

    const res = await updateSetting(settingData._id, payload)
    if (res && res.status === true) {
        toast.success(res.message || 'Settings saved successfully')
        if(res.data) setSettingData(res.data)
    } else {
        toast.error(res.message || 'Failed to save settings')
    }
    setIsSubmitLoading(false)
  }

  if (isLoading) return <Typography>Loading Settings...</Typography>

  if (!settingData) return <Typography>No Settings Found</Typography>

  return (
    <Grid container spacing={6}>
      {/* Define page title if needed, or rely on breadcrumbs */}
      <Grid item xs={12}>
          <Typography variant='h4' className='mb-4'>App Setting</Typography>
      </Grid>

      {/* Row 1 */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title='Zegocloud Setting' />
          <CardContent className='flex flex-col gap-6'>
            <CustomTextField 
                label='Zegocloud App Id' 
                value={formData.zegoAppId} 
                onChange={e => handleTextChange('zegoAppId', e.target.value)} 
                fullWidth 
            />
            <CustomTextField 
                label='Zegocloud App Sign In' 
                value={formData.zegoAppSignIn} 
                onChange={e => handleTextChange('zegoAppSignIn', e.target.value)} 
                fullWidth 
            />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
            <CardHeader title='Become Seller Setting' />
            <CardContent>
                <div className='flex flex-col gap-6'>
                    <div className='flex items-center justify-between'>
                        <Typography className='font-medium' style={{ minWidth: '150px' }}> </Typography>
                        <Typography className='font-medium'>Require</Typography>
                        <Typography className='font-medium'>Active</Typography>
                    </div>
                    {/* Address Proof */}
                    <div className='flex items-center justify-between'>
                        <Typography style={{ minWidth: '150px' }}>Address Proof</Typography>
                        <Switch 
                            checked={settingData?.addressProof?.isRequired || false} 
                            onChange={() => handleFieldToggle('addressProof', 'isRequired')} 
                        />
                        <Switch 
                            checked={settingData?.addressProof?.isActive || false}
                            onChange={() => handleFieldToggle('addressProof', 'isActive')}
                        />
                    </div>
                    {/* Government ID */}
                    <div className='flex items-center justify-between'>
                        <Typography style={{ minWidth: '150px' }}>Government ID</Typography>
                        <Switch 
                            checked={settingData?.govId?.isRequired || false}
                            onChange={() => handleFieldToggle('govId', 'isRequired')}
                        />
                         <Switch 
                            checked={settingData?.govId?.isActive || false}
                            onChange={() => handleFieldToggle('govId', 'isActive')}
                        />
                    </div>
                    {/* Registration Certificate */}
                    <div className='flex items-center justify-between'>
                        <Typography style={{ minWidth: '150px' }}>Registration Certificate</Typography>
                         <Switch 
                            checked={settingData?.registrationCert?.isRequired || false}
                            onChange={() => handleFieldToggle('registrationCert', 'isRequired')}
                        />
                         <Switch 
                            checked={settingData?.registrationCert?.isActive || false}
                            onChange={() => handleFieldToggle('registrationCert', 'isActive')}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
      </Grid>

      {/* Row 2 */}
      <Grid item xs={12} md={6}>
        <Card>
            <CardHeader 
                title='Add Product Request' 
                action={
                    <Switch 
                        checked={settingData?.isAddProductRequest || false}
                        onChange={() => handleToggle('productRequest')}
                    />
                }
            />
            <CardContent>
                <Typography color='text.secondary'>New product request enable/disable for seller</Typography>
            </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
         <Card>
            <CardHeader 
                title='Update Product Request' 
                action={
                    <Switch 
                        checked={settingData?.isUpdateProductRequest || false}
                        onChange={() => handleToggle('updateProductRequest')}
                    />
                }
            />
            <CardContent>
                <Typography color='text.secondary'>Enable/disable product request update for seller</Typography>
            </CardContent>
        </Card>
      </Grid>

      {/* Row 3 */}
      <Grid item xs={12} md={6}>
        <Card>
            <CardHeader title='Charges Setting' />
            <CardContent className='flex gap-6'>
                <CustomTextField 
                    label='Cancel Order Charges (%)' 
                    type='number'
                    value={formData.cancelOrderCharges} 
                    onChange={e => handleTextChange('cancelOrderCharges', e.target.value)}
                    fullWidth 
                />
                 <CustomTextField 
                    label='Admin Commission Charges (%)' 
                    type='number'
                    value={formData.adminCommissionCharges} 
                    onChange={e => handleTextChange('adminCommissionCharges', e.target.value)}
                    fullWidth 
                />
            </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
         <Card>
            <CardHeader title='Resend API Setting' />
            <CardContent>
                <CustomTextField 
                    label='Resend Api Key' 
                    value={formData.resendApiKey} 
                    onChange={e => handleTextChange('resendApiKey', e.target.value)}
                    fullWidth 
                />
            </CardContent>
        </Card>
      </Grid>

      {/* Row 4 */}
      <Grid item xs={12} md={6}>
        <Card>
            <CardHeader title='Minimum Withdrawal Limit (Seller)' />
            <CardContent>
                <CustomTextField 
                    label='Minimum Withdrawal Amount' 
                    type='number'
                    value={formData.minWithdrawalAmount} 
                    onChange={e => handleTextChange('minWithdrawalAmount', e.target.value)}
                    fullWidth 
                />
            </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
         <Card>
            <CardHeader title='Open AI Key Setting' />
            <CardContent>
                 <CustomTextField 
                    label='Open AI Key' 
                    placeholder='Enter You Open AI Key here'
                    value={formData.openAiKey} 
                    onChange={e => handleTextChange('openAiKey', e.target.value)}
                    fullWidth 
                />
            </CardContent>
        </Card>
      </Grid>

      {/* Row 5 - Firebase */}
      <Grid item xs={12}>
        <Card>
            <CardHeader title='Firebase Notification Setting' />
            <CardContent>
                <CustomTextField 
                    label='Private Key JSON ( To handle firebase push notification )'
                    placeholder='Paste your service account private key JSON here...'
                    multiline
                    rows={8}
                    value={formData.firebaseKey} 
                    onChange={e => handleTextChange('firebaseKey', e.target.value)}
                    fullWidth 
                />
            </CardContent>
        </Card>
      </Grid>

      {/* Row 6 - Fake Data & Submit */}
      <Grid item xs={12} className='flex items-center justify-between'>
          <Card className='w-full'>
              <CardContent className='flex items-center justify-between'>
                  <div>
                      <Typography variant='h6'>Fake Data</Typography>
                      <Typography variant='body2' color='text.secondary'>Disable/Enable fake data in app</Typography>
                  </div>
                  <Switch 
                        checked={settingData?.isFakeData || false}
                        onChange={() => handleToggle('isFakeData')}
                  />
              </CardContent>
          </Card>
      </Grid>

      <Grid item xs={12} className='flex justify-end'>
        <Button variant='contained' onClick={handleSubmit} disabled={isSubmitLoading}>
            Submit
        </Button>
      </Grid>

    </Grid>
  )
}

export default AppSetting
