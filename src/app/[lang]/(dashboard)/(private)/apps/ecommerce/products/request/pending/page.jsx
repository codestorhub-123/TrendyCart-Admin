'use client'

import Grid from '@mui/material/Grid'

import ProductRequestTable from '@/views/apps/ecommerce/products/request/ProductRequestTable'

const PendingRequestsPage = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <ProductRequestTable status="Pending" />
      </Grid>
    </Grid>
  )
}

export default PendingRequestsPage
