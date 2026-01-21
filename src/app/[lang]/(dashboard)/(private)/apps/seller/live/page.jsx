'use client'

import Grid from '@mui/material/Grid'
import LiveSellerTable from '@/views/apps/seller/LiveSellerTable'

const LiveSellerPage = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <LiveSellerTable />
      </Grid>
    </Grid>
  )
}

export default LiveSellerPage
