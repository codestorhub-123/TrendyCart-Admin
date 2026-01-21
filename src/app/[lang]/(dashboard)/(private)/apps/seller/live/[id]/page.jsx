'use client'

import Grid from '@mui/material/Grid'
import LiveSellerProducts from '@/views/apps/seller/LiveSellerProducts'

const LiveSellerProductsPage = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <LiveSellerProducts />
      </Grid>
    </Grid>
  )
}

export default LiveSellerProductsPage
