'use client'

import Grid from '@mui/material/Grid'
import ProductRequestTable from '@/views/apps/ecommerce/products/request/ProductRequestTable'

const RejectedRequestsPage = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <ProductRequestTable status="Rejected" />
      </Grid>
    </Grid>
  )
}

export default RejectedRequestsPage
