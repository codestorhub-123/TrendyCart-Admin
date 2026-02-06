'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'

// Component Imports
import CardStatVertical from '@/components/card-statistics/Vertical'
import { fetchDashboardData } from '@/services/userService'

const DashboardStats = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)
        const data = await fetchDashboardData()

        console.log('DashboardStats - Received data:', data)

        if (data?.data) {
          setDashboardData(data.data)
        } else if (data) {
          // If data is directly the stats object
          setDashboardData(data)
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  if (loading) {
    return (
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent className='flex justify-center items-center py-20'>
              <CircularProgress />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    )
  }

  if (!dashboardData) {
    return (
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography color='error'>
                Unable to load dashboard data. Please check your connection and try again.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    )
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
        <CardStatVertical
          title='Total Users'
          subtitle='All Users'
          stats={dashboardData.totalUsers || 0}
          avatarColor='primary'
          avatarIcon='tabler-users'
          avatarSkin='light'
          avatarSize={44}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
        <CardStatVertical
          title='Total Hosts'
          subtitle='All Hosts'
          stats={dashboardData.totalHosts || 0}
          avatarColor='success'
          avatarIcon='tabler-user-check'
          avatarSkin='light'
          avatarSize={44}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
        <CardStatVertical
          title='Fake Hosts'
          subtitle='Fake Hosts'
          stats={dashboardData.totalFakeHosts || 0}
          avatarColor='warning'
          avatarIcon='tabler-user-off'
          avatarSkin='light'
          avatarSize={44}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
        <CardStatVertical
          title='Blocked Users'
          subtitle='Blocked'
          stats={dashboardData.totalBlockedUsers || 0}
          avatarColor='error'
          avatarIcon='tabler-user-x'
          avatarSkin='light'
          avatarSize={44}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
        <CardStatVertical
          title='Blocked Hosts'
          subtitle='Blocked'
          stats={dashboardData.totalBlockedHosts || 0}
          avatarColor='error'
          avatarIcon='tabler-user-off'
          avatarSkin='light'
          avatarSize={44}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
        <CardStatVertical
          title='Blocked Fake Hosts'
          subtitle='Blocked'
          stats={dashboardData.totalBlockedFakeHosts || 0}
          avatarColor='error'
          avatarIcon='tabler-user-x'
          avatarSkin='light'
          avatarSize={44}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
        <CardStatVertical
          title='Active Users'
          subtitle='Active'
          stats={dashboardData.totalActiveUsers || 0}
          avatarColor='success'
          avatarIcon='tabler-user-check'
          avatarSkin='light'
          avatarSize={44}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
        <CardStatVertical
          title='Active Hosts'
          subtitle='Active'
          stats={dashboardData.totalActiveHosts || 0}
          avatarColor='success'
          avatarIcon='tabler-user-check'
          avatarSkin='light'
          avatarSize={44}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
        <CardStatVertical
          title='Total Agencies'
          subtitle='All Agencies'
          stats={dashboardData.totalAgencies || 0}
          avatarColor='info'
          avatarIcon='tabler-building'
          avatarSkin='light'
          avatarSize={44}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
        <CardStatVertical
          title='Disabled Agencies'
          subtitle='Disabled'
          stats={dashboardData.totalDisableAgencies || 0}
          avatarColor='error'
          avatarIcon='tabler-building-off'
          avatarSkin='light'
          avatarSize={44}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
        <CardStatVertical
          title='Pending Hosts'
          subtitle='Pending'
          stats={dashboardData.totalPendingHosts || 0}
          avatarColor='warning'
          avatarIcon='tabler-clock'
          avatarSkin='light'
          avatarSize={44}
        />
      </Grid>
    </Grid>
  )
}

export default DashboardStats
