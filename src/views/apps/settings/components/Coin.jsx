'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'

// Component Imports
import InputCard from './InputCard'

const Coin = ({ settings, onChange }) => {
  return (
    <Card>
      <CardHeader title='Coin Conversion' />
      <CardContent>
        <Grid container spacing={6}>
          <Grid size={{ xs: 12, md: 6 }}>
            <InputCard
              title='Coins for Rs'
              value={settings.coinsForRs}
              onChange={val => onChange('coinsForRs', val)}
              type='number'
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <InputCard
              title='Rs for Coins'
              value={settings.rsForCoins}
              onChange={val => onChange('rsForCoins', val)}
              type='number'
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default Coin
