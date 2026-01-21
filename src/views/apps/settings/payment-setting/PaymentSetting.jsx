'use client'

import { useEffect, useState } from 'react'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Switch from '@mui/material/Switch'
import { toast } from 'react-hot-toast'

import CustomTextField from '@core/components/mui/TextField'
import { getSetting, updateSetting, handleSwitch } from '@/services/settingService'

const PaymentSetting = () => {
    const [settingData, setSettingData] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitLoading, setIsSubmitLoading] = useState(false)

    const [formData, setFormData] = useState({
        razorPayId: '',
        razorSecretKey: '',
        stripePublishableKey: '',
        stripeSecretKey: '',
        flutterWaveId: ''
    })

    const fetchData = async () => {
        setIsLoading(true)
        const res = await getSetting()
        if (res && res.status === true && res.setting) {
            setSettingData(res.setting)
            setFormData({
                razorPayId: res.setting.razorPayId || '',
                razorSecretKey: res.setting.razorSecretKey || '',
                stripePublishableKey: res.setting.stripePublishableKey || '',
                stripeSecretKey: res.setting.stripeSecretKey || '',
                flutterWaveId: res.setting.flutterWaveId || ''
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
        // Map API enum types to local state keys
        let stateKey = type
        if (type === 'razorPay') stateKey = 'razorPaySwitch'
        if (type === 'stripe') stateKey = 'stripeSwitch'
        if (type === 'flutterWave') stateKey = 'flutterWaveSwitch'
        // isCashOnDelivery matches both

        const oldValue = settingData[stateKey]
        setSettingData(prev => ({ ...prev, [stateKey]: !oldValue }))

        const res = await handleSwitch(settingData._id, type)
        if (res && res.status === true) {
            toast.success(res.message || 'Updated successfully')
            if (res.setting) setSettingData(res.setting)
        } else {
            toast.error(res.message || 'Update failed')
            setSettingData(prev => ({ ...prev, [stateKey]: oldValue }))
        }
    }

    const handleSubmit = async () => {
        setIsSubmitLoading(true)
        const payload = { ...formData }
        
        const res = await updateSetting(settingData._id, payload)
        if (res && res.status === true) {
            toast.success(res.message || 'Settings saved successfully')
            if (res.setting) setSettingData(res.setting)
        } else {
            toast.error(res.message || 'Failed to save settings')
        }
        setIsSubmitLoading(false)
    }

    if (isLoading) return <Typography>Loading...</Typography>
    if (!settingData) return <Typography>No Settings Found</Typography>

    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <Typography variant='h4'>Payment Setting</Typography>
            </Grid>

            {/* RazorPay */}
            <Grid item xs={12} md={6}>
                <Card>
                    <CardHeader 
                        title='Razor Payment Setting' 
                        action={
                            <div className='flex items-center gap-2'>
                                <Typography variant='body2' className='font-medium'>RazorPay</Typography>
                                <Switch 
                                    checked={settingData.razorPaySwitch || false} 
                                    onChange={() => handleToggle('razorPay')} 
                                />
                            </div>
                        }
                    />
                    <CardContent className='flex flex-col gap-6'>
                        <CustomTextField 
                            label='RazorPay Id' 
                            value={formData.razorPayId} 
                            onChange={e => handleTextChange('razorPayId', e.target.value)}
                            fullWidth 
                        />
                        <CustomTextField 
                            label='Razor Secret Key' 
                            value={formData.razorSecretKey} 
                            onChange={e => handleTextChange('razorSecretKey', e.target.value)}
                            fullWidth 
                        />
                    </CardContent>
                </Card>
            </Grid>

            {/* Stripe */}
            <Grid item xs={12} md={6}>
                <Card>
                    <CardHeader 
                        title='Stripe Payment Setting' 
                        action={
                            <div className='flex items-center gap-2'>
                                <Typography variant='body2' className='font-medium'>Stripe</Typography>
                                <Switch 
                                    checked={settingData.stripeSwitch || false} 
                                    onChange={() => handleToggle('stripe')} 
                                />
                            </div>
                        }
                    />
                    <CardContent className='flex flex-col gap-6'>
                        <CustomTextField 
                            label='Stripe Publishable Key' 
                            value={formData.stripePublishableKey} 
                            onChange={e => handleTextChange('stripePublishableKey', e.target.value)}
                            fullWidth 
                        />
                        <CustomTextField 
                            label='Stripe Secret Key' 
                            value={formData.stripeSecretKey} 
                            onChange={e => handleTextChange('stripeSecretKey', e.target.value)}
                            fullWidth 
                        />
                    </CardContent>
                </Card>
            </Grid>

            {/* FlutterWave */}
            <Grid item xs={12} md={6}>
                <Card>
                    <CardHeader 
                        title='Flutter Wave Setting' 
                        action={
                            <div className='flex items-center gap-2'>
                                <Typography variant='body2' className='font-medium'>FlutterWave</Typography>
                                <Switch 
                                    checked={settingData.flutterWaveSwitch || false} 
                                    onChange={() => handleToggle('flutterWave')} 
                                />
                            </div>
                        }
                    />
                    <CardContent>
                        <CustomTextField 
                            label='FlutterWave Id' 
                            value={formData.flutterWaveId} 
                            onChange={e => handleTextChange('flutterWaveId', e.target.value)}
                            fullWidth 
                        />
                    </CardContent>
                </Card>
            </Grid>

            {/* COD */}
            <Grid item xs={12} md={6}>
                <Card className='h-full'>
                    <CardHeader 
                        title='Cash On Delivery' 
                        action={
                            <div className='flex items-center gap-2'>
                                <Typography variant='body2' className='font-medium'>COD</Typography>
                                <Switch 
                                    checked={settingData.isCashOnDelivery || false} 
                                    onChange={() => handleToggle('isCashOnDelivery')} 
                                />
                            </div>
                        }
                    />
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

export default PaymentSetting
