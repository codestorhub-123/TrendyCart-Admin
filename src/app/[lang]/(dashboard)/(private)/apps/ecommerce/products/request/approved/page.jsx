'use client'

import Grid from '@mui/material/Grid'
import ProductRequestTable from '@/views/apps/ecommerce/products/request/ProductRequestTable'

const ApprovedRequestsPage = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <ProductRequestTable status="Approved" />
      </Grid>
    </Grid>
  )
}

export default ApprovedRequestsPage
