'use client'

import Grid from '@mui/material/Grid'

import AttributeListTable from '@/views/apps/ecommerce/products/attribute/AttributeListTable'

const AttributePage = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <AttributeListTable />
      </Grid>
    </Grid>
  )
}

export default AttributePage
