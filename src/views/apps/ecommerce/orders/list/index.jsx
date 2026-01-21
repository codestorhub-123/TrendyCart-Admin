'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import OrderListTable from './OrderListTable'

const OrderList = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <OrderListTable />
      </Grid>
    </Grid>
  )
}

export default OrderList
