import Grid from '@mui/material/Grid'
import SellerRequestTable from '@/views/apps/seller/SellerRequestTable'

const SellerRequestPage = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <SellerRequestTable />
      </Grid>
    </Grid>
  )
}

export default SellerRequestPage
