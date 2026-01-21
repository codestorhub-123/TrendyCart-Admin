import Grid from '@mui/material/Grid'
import FakeSellerTable from '@/views/apps/seller/FakeSellerTable'

const FakeSellerPage = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <FakeSellerTable />
      </Grid>
    </Grid>
  )
}

export default FakeSellerPage
