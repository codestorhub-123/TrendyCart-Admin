// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import OrderListTable from './OrderListTable'

const OverViewTab = ({ orderData }) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <OrderListTable orderData={orderData} />
      </Grid>
    </Grid>
  )
}

export default OverViewTab
