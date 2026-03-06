'use client'

import Grid from '@mui/material/Grid2'
import MyStoreOrderListTable from './MyStoreOrderListTable'

const MyStoreOrderListView = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <MyStoreOrderListTable />
      </Grid>
    </Grid>
  )
}

export default MyStoreOrderListView
