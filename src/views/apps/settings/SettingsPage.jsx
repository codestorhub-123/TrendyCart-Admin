'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid2'

// Component Imports
import ToggleCard from './components/ToggleCard'
import InputCard from './components/InputCard'
import CoinSettingsCard from './components/CoinSettingsCard'
import Coin from './components/Coin'
import WithdrawPayment from './components/WithdrawPayment'

// Service Imports
import { fetchSettings, updateSettings } from '@/services/userService'

// Toast Imports
import { toast } from 'react-toastify'

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('settings')
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)

  // Fetch settings from API
  const loadSettings = async () => {
    try {
      setLoading(true)
      const data = await fetchSettings()
      console.log('Fetched settings:', data)
      if (data) {
        setSettings(data)
      }
    } catch (err) {
      console.error('Error fetching settings:', err)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = async (key, value) => {
    try {
      // Optimistic update
      setSettings(prev => ({ ...prev, [key]: value }))

      const id = settings._id || settings.id
      if (!id) {
        console.warn('Settings ID not found')
        toast.error('Settings ID not found')
        // Reload settings to revert
        loadSettings()
        return
      }

      await updateSettings(id, { [key]: value })
      toast.success('Setting updated successfully')
    } catch (err) {
      console.error('Error updating setting:', err)
      toast.error(err.message || 'Failed to update setting')
      // Reload settings to revert on error
      loadSettings()
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  return (
    <div className='flex flex-col gap-6'>
      {/* Title Section */}
      <Card>
        <CardContent>
          <div className='flex items-center gap-4'>
            <div className='flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10'>
              <i className='tabler-settings text-2xl text-primary' />
            </div>
            <div>
              <Typography variant='h4'>Settings</Typography>
              <Typography variant='body2' color='text.secondary'>
                Manage application settings and configurations
              </Typography>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tab Content */}
      {loading ? (
        <div className='flex justify-center items-center py-20'>
          <CircularProgress />
        </div>
      ) : (
        activeTab === 'settings' && (
          <Grid container spacing={6}>
            {/* Toggle Cards */}
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <ToggleCard
                title='Fake Data Setting'
                value={settings.isFake}
                onChange={val => updateSetting('isFake', val)}
                onLabel='Show All Hosts'
                offLabel='Show Only Real Hosts'
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <ToggleCard
                title='App Status'
                value={settings.appActive}
                onChange={val => updateSetting('appActive', val)}
                onLabel='App is Active'
                offLabel='App is Inactive'
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <ToggleCard
                title='Agency Status'
                value={settings.isAgency}
                onChange={val => updateSetting('isAgency', val)}
                onLabel='Agency Unblocked'
                offLabel='Agency Blocked'
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <ToggleCard
                title='Ads Key Status'
                value={settings.addsKey}
                onChange={val => updateSetting('addsKey', val)}
                onLabel='Ads Key Enabled'
                offLabel='Ads Key Disabled'
              />
            </Grid>

            {/* Input Cards */}
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <InputCard
                title='Login Bonus'
                value={settings.loginBonus}
                onChange={val => updateSetting('loginBonus', val)}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <InputCard title='App Version' value={settings.version} onChange={val => updateSetting('version', val)} />
            </Grid>

            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <InputCard
                title='App Link'
                value={settings.link}
                onChange={val => updateSetting('link', val)}
                type='text'
              />
            </Grid>

            {/* Privacy & Terms Links */}
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <InputCard
                title='Privacy Policy Link'
                value={settings.privacyPolicyLink}
                onChange={val => updateSetting('privacyPolicyLink', val)}
                type='text'
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <InputCard
                title='Terms & Conditions Link'
                value={settings.termsAndConditionsLink}
                onChange={val => updateSetting('termsAndConditionsLink', val)}
                type='text'
              />
            </Grid>

            {/* Coin Settings */}
            <Grid size={{ xs: 12 }}>
              <CoinSettingsCard settings={settings} onChange={(key, value) => updateSetting(key, value)} />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Coin settings={settings} onChange={(key, value) => updateSetting(key, value)} />
            </Grid>

            {/* API Keys & Credentials Section */}
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardHeader title='API Keys & Credentials' />
                <CardContent>
                  <Grid container spacing={6}>
                    <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                      <InputCard
                        title='Razorpay Key'
                        value={settings.razorPayKey}
                        onChange={val => updateSetting('razorPayKey', val)}
                        type='text'
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                      <InputCard
                        title='Agora App ID'
                        value={settings.agorakey}
                        onChange={val => updateSetting('agorakey', val)}
                        type='text'
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                      <InputCard
                        title='Agora Certificate'
                        value={settings.agoraCertificate}
                        onChange={val => updateSetting('agoraCertificate', val)}
                        type='text'
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                      <ToggleCard
                        title='Razorpay Status'
                        value={settings.razorPayEnable}
                        onChange={val => updateSetting('razorPayEnable', val)}
                        onLabel='Razorpay Enabled'
                        offLabel='Razorpay Disabled'
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                      <ToggleCard
                        title='Google Pay Status'
                        value={settings.googlePayEnable}
                        onChange={val => updateSetting('googlePayEnable', val)}
                        onLabel='Google Pay Enabled'
                        offLabel='Google Pay Disabled'
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Ads Settings Section */}
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardHeader title='Ads Settings' />
                <CardContent>
                  <Grid container spacing={6}>
                    <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                      <InputCard
                        title='Ads Coins'
                        value={settings.adsCoins}
                        onChange={val => updateSetting('adsCoins', val)}
                        type='number'
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                      <InputCard
                        title='Ads Count'
                        value={settings.adsCount}
                        onChange={val => updateSetting('adsCount', val)}
                        type='number'
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                      <InputCard
                        title='Ads ID'
                        value={settings.adsId}
                        onChange={val => updateSetting('adsId', val)}
                        type='text'
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                      <InputCard
                        title='Interstitial Ads Count'
                        value={settings.interstialAdsCount}
                        onChange={val => updateSetting('interstialAdsCount', val)}
                        type='number'
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Withdraw Settings Section */}
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardHeader title='Withdraw Settings' />
                <CardContent>
                  <Grid container spacing={6}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <InputCard
                        title='Min Agency Coins Withdraw'
                        value={settings.minAgencyCoinsWithdraw}
                        onChange={val => updateSetting('minAgencyCoinsWithdraw', val)}
                        type='number'
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <InputCard
                        title='Min Host Coins Withdraw'
                        value={settings.minHostCoinsWithdraw}
                        onChange={val => updateSetting('minHostCoinsWithdraw', val)}
                        type='number'
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )
      )}

      {activeTab === 'withdraw' && (
        <Grid size={{ xs: 12 }}>
          <WithdrawPayment />
        </Grid>
      )}
    </div>
  )
}

export default SettingsPage
