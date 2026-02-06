'use client'

import Grid from '@mui/material/Grid'

import RealProductsTable from '@/views/apps/ecommerce/products/RealProductsTable'

const RealProductsPage = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <RealProductsTable />
      </Grid>
    </Grid>
  )
}

export default RealProductsPage
