'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'

// Component Imports
import InputCard from './InputCard'

const CoinSettingsCard = ({ settings, onChange }) => {
  return (
    <Card>
      <CardHeader title='Coin Settings' />
      <CardContent>
        <Grid container spacing={6}>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <InputCard
              title='Call Tax'
              value={settings.callTax}
              onChange={val => onChange('callTax', val)}
              type='number'
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <InputCard
              title='Gift Tax'
              value={settings.giftTax}
              onChange={val => onChange('giftTax', val)}
              type='number'
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <InputCard
              title='Chat Tax'
              value={settings.chatTax}
              onChange={val => onChange('chatTax', val)}
              type='number'
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <InputCard
              title='Min Chat Charge'
              value={settings.minChatCharge}
              onChange={val => onChange('minChatCharge', val)}
              type='number'
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <InputCard
              title='Min Video Call Charge'
              value={settings.minVideoCallCharge}
              onChange={val => onChange('minVideoCallCharge', val)}
              type='number'
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <InputCard
              title='Min Audio Call Charge'
              value={settings.minAudioCallCharge}
              onChange={val => onChange('minAudioCallCharge', val)}
              type='number'
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <InputCard
              title='Random Match Screen Time'
              value={settings.randomMatchScreenTime}
              onChange={val => onChange('randomMatchScreenTime', val)}
              type='number'
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <InputCard
              title='Fake Host Gift Max Random Count'
              value={settings.fakeHostGiftMaxRandomCount}
              onChange={val => onChange('fakeHostGiftMaxRandomCount', val)}
              type='number'
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default CoinSettingsCard
