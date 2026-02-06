'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'
import CustomTextField from '@core/components/mui/TextField'

// Third-party Imports
import dynamic from 'next/dynamic'
import { subDays, startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from '@/libs/Recharts'

// Component Imports
import { fetchDashboardData } from '@/services/userService'
import CardStatVertical from '@/components/card-statistics/Vertical'

// Styled Component Imports
const AppRecharts = dynamic(() => import('@/libs/styles/AppRecharts'))

// Date Range Options
const ranges = [
  { label: 'All', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Last 7 Days', value: 'last7days' },
  { label: 'Last 30 Days', value: 'last30days' },
  { label: 'This Month', value: 'thismonth' }
]

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState({
    data: {},
    chart: { totalUsers: [], totalHosts: [] }
  })
  const [loading, setLoading] = useState(true)
  const [selectedRange, setSelectedRange] = useState('all')
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)

  const getDashboard = async (startDateParam, endDateParam) => {
    try {
      setLoading(true)
      const data = await fetchDashboardData(startDateParam, endDateParam)

      console.log('Dashboard data received:', data)

      if (data) {
        setDashboardData(data)
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getDashboard('all', 'all')
  }, [])

  const handleRangeSelect = event => {
    const value = event.target.value
    setSelectedRange(value)

    let start = null
    let end = null

    switch (value) {
      case 'all':
        getDashboard('all', 'all')

        return
      case 'today':
        start = startOfDay(new Date())
        end = endOfDay(new Date())
        break
      case 'yesterday':
        start = subDays(startOfDay(new Date()), 1)
        end = subDays(endOfDay(new Date()), 1)
        break
      case 'last7days':
        start = subDays(new Date(), 6)
        end = new Date()
        break
      case 'last30days':
        start = subDays(new Date(), 29)
        end = new Date()
        break
      case 'thismonth':
        start = startOfMonth(new Date())
        end = endOfMonth(new Date())
        break
      default:
        return
    }

    if (start && end) {
      setStartDate(start)
      setEndDate(end)
      getDashboard(start.toISOString().split('T')[0], end.toISOString().split('T')[0])
    }
  }

  // Merge chart data for display
  const mergedChartData = []
  const users = dashboardData?.chart?.totalUsers || []
  const hosts = dashboardData?.chart?.totalHosts || []
  const allDates = Array.from(new Set([...users.map(u => u._id), ...hosts.map(h => h._id)])).sort()

  allDates.forEach(date => {
    const userObj = users.find(u => u._id === date)
    const hostObj = hosts.find(h => h._id === date)
    mergedChartData.push({
      totalUsers: userObj ? userObj.count : 0,
      totalHosts: hostObj ? hostObj.count : 0
    })
  })

  const stats = dashboardData?.data || {}

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

  return (
    <Grid container spacing={6}>
      {/* Header Section */}
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent>
            <div className='flex items-center gap-4'>
              <div className='flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10'>
                <i className='tabler-home text-2xl text-primary' />
              </div>
              <div>
                <Typography variant='h4'>Welcome Admin!</Typography>
                {/* <Typography variant='body2' color='text.secondary'>
                  Manage your platform with ease
                </Typography> */}
              </div>
            </div>
          </CardContent>
        </Card>
      </Grid>

      {/* Date Range Filter */}
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent>
            <CustomTextField
              select
              fullWidth
              label='Select Date Range'
              value={selectedRange}
              onChange={handleRangeSelect}
            >
              {ranges.map(range => (
                <MenuItem key={range.value} value={range.value}>
                  {range.label}
                </MenuItem>
              ))}
            </CustomTextField>
          </CardContent>
        </Card>
      </Grid>

      {/* Statistics Cards */}
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <CardStatVertical
          title='Total Users'
          subtitle='All Users'
          stats={stats.totalUsers || 0}
          avatarColor='primary'
          avatarIcon='tabler-users'
          avatarSkin='light'
          avatarSize={44}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <CardStatVertical
          title='Total Blocked Users'
          subtitle='Blocked'
          stats={stats.totalBlockedUsers || 0}
          avatarColor='error'
          avatarIcon='tabler-user-x'
          avatarSkin='light'
          avatarSize={44}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <CardStatVertical
          title='Total Disabled Agencies'
          subtitle='Disabled'
          stats={stats.totalDisableAgencies || 0}
          avatarColor='error'
          avatarIcon='tabler-building-off'
          avatarSkin='light'
          avatarSize={44}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <CardStatVertical
          title='Total Agencies'
          subtitle='All Agencies'
          stats={stats.totalAgencies || 0}
          avatarColor='info'
          avatarIcon='tabler-building'
          avatarSkin='light'
          avatarSize={44}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <CardStatVertical
          title='Pending Hosts'
          subtitle='Pending'
          stats={stats.totalPendingHosts || 0}
          avatarColor='warning'
          avatarIcon='tabler-clock'
          avatarSkin='light'
          avatarSize={44}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <CardStatVertical
          title='Total Hosts'
          subtitle='All Hosts'
          stats={stats.totalHosts || 0}
          avatarColor='success'
          avatarIcon='tabler-user-check'
          avatarSkin='light'
          avatarSize={44}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <CardStatVertical
          title='Active Hosts'
          subtitle='Active'
          stats={stats.totalActiveHosts || 0}
          avatarColor='success'
          avatarIcon='tabler-user-check'
          avatarSkin='light'
          avatarSize={44}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <CardStatVertical
          title='Total Blocked Hosts'
          subtitle='Blocked'
          stats={stats.totalBlockedHosts || 0}
          avatarColor='error'
          avatarIcon='tabler-user-off'
          avatarSkin='light'
          avatarSize={44}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <CardStatVertical
          title='Total Active Users'
          subtitle='Active'
          stats={stats.totalActiveUsers || 0}
          avatarColor='success'
          avatarIcon='tabler-user-check'
          avatarSkin='light'
          avatarSize={44}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <CardStatVertical
          title='Total Fake Hosts'
          subtitle='Fake Hosts'
          stats={stats.totalFakeHosts || 0}
          avatarColor='warning'
          avatarIcon='tabler-user-off'
          avatarSkin='light'
          avatarSize={44}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <CardStatVertical
          title='Blocked Fake Hosts'
          subtitle='Blocked'
          stats={stats.totalBlockedFakeHosts || 0}
          avatarColor='error'
          avatarIcon='tabler-user-x'
          avatarSkin='light'
          avatarSize={44}
        />
      </Grid>

      {/* Chart Section */}
      {mergedChartData.length > 0 && (
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader title='User and Host Analytics' subheader='Track user and host growth over time' />
            <CardContent>
              <AppRecharts>
                <div className='bs-[400px]'>
                  <ResponsiveContainer>
                    <AreaChart data={mergedChartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                      <defs>
                        <linearGradient id='colorUsers' x1='0' y1='0' x2='0' y2='1'>
                          <stop offset='5%' stopColor='var(--mui-palette-primary-main)' stopOpacity={0.8} />
                          <stop offset='95%' stopColor='var(--mui-palette-primary-main)' stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id='colorHosts' x1='0' y1='0' x2='0' y2='1'>
                          <stop offset='5%' stopColor='var(--mui-palette-success-main)' stopOpacity={0.6} />
                          <stop offset='95%' stopColor='var(--mui-palette-success-main)' stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray='3 3' />
                      <XAxis dataKey='date' />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area
                        type='monotone'
                        dataKey='totalUsers'
                        stroke='var(--mui-palette-primary-main)'
                        strokeWidth={3}
                        fill='url(#colorUsers)'
                        name='Total Users'
                      />
                      <Area
                        type='monotone'
                        dataKey='totalHosts'
                        stroke='var(--mui-palette-success-main)'
                        strokeWidth={3}
                        strokeDasharray='5 5'
                        fill='url(#colorHosts)'
                        name='Total Hosts'
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </AppRecharts>
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  )
}

export default DashboardPage
