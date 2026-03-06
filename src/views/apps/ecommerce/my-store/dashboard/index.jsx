'use client'

import Grid from '@mui/material/Grid2'
import MyStoreDashboard from './MyStoreDashboard'

const MyStoreDashboardView = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <MyStoreDashboard />
      </Grid>
    </Grid>
  )
}

export default MyStoreDashboardView
