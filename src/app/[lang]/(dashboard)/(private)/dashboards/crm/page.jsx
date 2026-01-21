// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import DashboardSummary from '@views/apps/ecommerce/dashboard/DashboardSummary'
import DistributedBarChartOrder from '@views/dashboards/crm/DistributedBarChartOrder'
import LineAreaYearlySalesChart from '@views/dashboards/crm/LineAreaYearlySalesChart'
import CardStatVertical from '@/components/card-statistics/Vertical'
import BarChartRevenueGrowth from '@views/dashboards/crm/BarChartRevenueGrowth'
// import EarningReportsWithTabs from '@views/dashboards/crm/EarningReportsWithTabs'
// import RadarSalesChart from '@views/dashboards/crm/RadarSalesChart'
import UserAnalyticsChart from '@views/dashboards/crm/UserAnalyticsChart'
import RevenueAnalyticsChart from '@views/dashboards/crm/RevenueAnalyticsChart'
import TopProductsSellersTabs from '@views/dashboards/crm/TopProductsSellersTabs'
import RecentOrderTable from '@views/dashboards/crm/RecentOrderTable'
import SalesByCountries from '@views/dashboards/crm/SalesByCountries'
import ProjectStatus from '@views/dashboards/crm/ProjectStatus'
import ActiveProjects from '@views/dashboards/crm/ActiveProjects'
import LastTransaction from '@views/dashboards/crm/LastTransaction'
import ActivityTimeline from '@views/dashboards/crm/ActivityTimeline'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

const DashboardCRM = async () => {
  // Vars
  const serverMode = await getServerMode()

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <DashboardSummary />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TopProductsSellersTabs />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <RecentOrderTable />
      </Grid>
      {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
        <DistributedBarChartOrder />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
        <LineAreaYearlySalesChart />
      </Grid> */}
      {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
        <CardStatVertical
          title='Total Profit'
          subtitle='Last Week'
          stats='1.28k'
          avatarColor='error'
          avatarIcon='tabler-credit-card'
          avatarSkin='light'
          avatarSize={44}
          chipText='-12.2%'
          chipColor='error'
          chipVariant='tonal'
        />
      </Grid> */}
      {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
        <CardStatVertical
          title='Total Sales'
          subtitle='Last Week'
          stats='24.67k'
          avatarColor='success'
          avatarIcon='tabler-currency-dollar'
          avatarSkin='light'
          avatarSize={44}
          chipText='+24.67%'
          chipColor='success'
          chipVariant='tonal'
        />
      </Grid> */}
      {/* <Grid size={{ xs: 12, md: 8, lg: 4 }}>
        <BarChartRevenueGrowth />
      </Grid> */}
      <Grid size={{ xs: 12, lg: 8 }}>
        <RevenueAnalyticsChart />
      </Grid>
      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <UserAnalyticsChart />
      </Grid>

      {/* <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <SalesByCountries />
      </Grid> */}
      {/* <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <ProjectStatus />
      </Grid> */}
      {/* <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <ActiveProjects />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <LastTransaction serverMode={serverMode} />
      </Grid> */}
      {/* <Grid size={{ xs: 12, md: 6 }}>
        <ActivityTimeline />
      </Grid> */}
    </Grid>
  )
}

export default DashboardCRM
