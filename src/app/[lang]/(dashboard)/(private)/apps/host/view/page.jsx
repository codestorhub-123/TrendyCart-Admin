// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import HostLeftOverview from '@views/apps/host/view/host-left-overview'
import HostRight from '@views/apps/host/view/host-right'

const TopUpHistoryTab = dynamic(() => import('@views/apps/host/view/host-right/top-up-history'))
const SpendingHistoryTab = dynamic(() => import('@views/apps/host/view/host-right/spending-history'))
const HistoryTabs = dynamic(() => import('@views/apps/host/view/host-right/history-tabs'))

// Vars
const tabContentList = () => ({
  'top-up-history': <TopUpHistoryTab />,
  'spending-history': <SpendingHistoryTab />,
  history: <HistoryTabs />
})

const HostViewTab = async () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, lg: 4, md: 5 }}>
        <HostLeftOverview />
      </Grid>
      <Grid size={{ xs: 12, lg: 8, md: 7 }}>
        <HostRight tabContentList={tabContentList()} />
      </Grid>
    </Grid>
  )
}

export default HostViewTab

