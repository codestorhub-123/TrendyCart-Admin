'use client'

import Grid from '@mui/material/Grid'

import PromoCodeTable from '@/views/apps/ecommerce/promo-code/PromoCodeTable'

const PromoCodePage = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
         <PromoCodeTable />
      </Grid>
    </Grid>
  )
}

export default PromoCodePage
