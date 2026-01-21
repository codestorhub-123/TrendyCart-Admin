// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import HostDetails from './HostDetails'
import UpdateCoins from './UpdateCoins'

const HostLeftOverview = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <HostDetails />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <UpdateCoins />
      </Grid>
    </Grid>
  )
}

export default HostLeftOverview

