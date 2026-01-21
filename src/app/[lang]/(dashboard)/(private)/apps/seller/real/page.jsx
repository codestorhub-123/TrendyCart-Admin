import Grid from '@mui/material/Grid'
import RealSellerTable from '@/views/apps/seller/RealSellerTable'

const RealSellerPage = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <RealSellerTable />
      </Grid>
    </Grid>
  )
}

export default RealSellerPage
