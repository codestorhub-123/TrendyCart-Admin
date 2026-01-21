// React Imports
'use client'

import { useState, useEffect } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import HorizontalWithSubtitle from '@components/card-statistics/HorizontalWithSubtitle'

// Service Imports
import { getHosts } from '@/services/userService'

const HostListCards = ({ isFake = false }) => {
  // States
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  // Load hosts and calculate statistics
  const loadHostStats = async () => {
    try {
      setLoading(true)

      // Load real hosts
      const realHostsResult = await getHosts(1, 1000, '', '', false)
      const realHosts = realHostsResult.data?.hosts || realHostsResult.data?.users || []

      // Load fake hosts
      const fakeHostsResult = await getHosts(1, 1000, '', '', true)
      const fakeHosts = fakeHostsResult.data?.hosts || fakeHostsResult.data?.users || []

      // Calculate real hosts statistics
      const realTotalHosts = realHosts.length
      const realOnlineHosts = realHosts.filter(host => host.isOnline).length
      const realBlockedHosts = realHosts.filter(host => host.isBlocked).length
      const realActiveHosts = realHosts.filter(host => host.status === 'available').length

      // Calculate fake hosts statistics (fake hosts are always offline)
      const fakeTotalHosts = fakeHosts.length
      const fakeOnlineHosts = 0 // Fake hosts are always offline
      const fakeBlockedHosts = fakeHosts.filter(host => host.isBlocked).length
      const fakeActiveHosts = fakeHosts.filter(host => host.status === 'available').length

      // Show cards based on isFake prop
      const statsData = isFake
        ? [
            // Fake Hosts Cards
            {
              title: 'Total Fake Hosts',
              stats: fakeTotalHosts.toString(),
              avatarIcon: 'tabler-users-group',
              avatarColor: 'info',
              trend: 'positive',
              trendNumber: '0%',
              subtitle: 'All fake hosts'
            },
            {
              title: 'Online Fake Hosts',
              stats: fakeOnlineHosts.toString(),
              avatarIcon: 'tabler-user-off',
              avatarColor: 'secondary',
              trend: 'neutral',
              trendNumber: '0%',
              subtitle: 'Currently online (always 0)'
            },
            {
              title: 'Blocked Fake Hosts',
              stats: fakeBlockedHosts.toString(),
              avatarIcon: 'tabler-user-x',
              avatarColor: 'error',
              trend: 'negative',
              trendNumber: '0%',
              subtitle: 'Blocked fake accounts'
            },
            {
              title: 'Available Fake Hosts',
              stats: fakeActiveHosts.toString(),
              avatarIcon: 'tabler-user-plus',
              avatarColor: 'warning',
              trend: 'positive',
              trendNumber: '0%',
              subtitle: 'Available status fake hosts'
            }
          ]
        : [
            // Real Hosts Cards
            {
              title: 'Total Hosts',
              stats: realTotalHosts.toString(),
              avatarIcon: 'tabler-users',
              avatarColor: 'primary',
              trend: 'positive',
              trendNumber: '29%',
              subtitle: 'All registered hosts'
            },
            {
              title: 'Online Hosts',
              stats: realOnlineHosts.toString(),
              avatarIcon: 'tabler-user-check',
              avatarColor: 'success',
              trend: 'positive',
              trendNumber: '18%',
              subtitle: 'Currently online'
            },
            {
              title: 'Blocked Hosts',
              stats: realBlockedHosts.toString(),
              avatarIcon: 'tabler-user-x',
              avatarColor: 'error',
              trend: 'negative',
              trendNumber: '14%',
              subtitle: 'Blocked accounts'
            },
            {
              title: 'Available Hosts',
              stats: realActiveHosts.toString(),
              avatarIcon: 'tabler-user-plus',
              avatarColor: 'warning',
              trend: 'positive',
              trendNumber: '42%',
              subtitle: 'Available status hosts'
            }
          ]

      setData(statsData)
    } catch (error) {
      console.error('Error loading host stats:', error)
      // Fallback to default data if API fails
      setData(
        isFake
          ? [
              {
                title: 'Total Fake Hosts',
                stats: '0',
                avatarIcon: 'tabler-users-group',
                avatarColor: 'info',
                trend: 'positive',
                subtitle: 'All fake hosts'
              },
              {
                title: 'Online Fake Hosts',
                stats: '0',
                avatarIcon: 'tabler-user-off',
                avatarColor: 'secondary',
                trend: 'neutral',
                subtitle: 'Currently online (always 0)'
              },
              {
                title: 'Blocked Fake Hosts',
                stats: '0',
                avatarIcon: 'tabler-user-x',
                avatarColor: 'error',
                trend: 'negative',
                subtitle: 'Blocked fake accounts'
              },
              {
                title: 'Available Fake Hosts',
                stats: '0',
                avatarIcon: 'tabler-user-plus',
                avatarColor: 'warning',
                trend: 'positive',
                subtitle: 'Available status fake hosts'
              }
            ]
          : [
              {
                title: 'Total Hosts',
                stats: '0',
                avatarIcon: 'tabler-users',
                avatarColor: 'primary',
                trend: 'positive',
                subtitle: 'All registered hosts'
              },
              {
                title: 'Online Hosts',
                stats: '0',
                avatarIcon: 'tabler-user-check',
                avatarColor: 'success',
                trend: 'positive',
                subtitle: 'Currently online'
              },
              {
                title: 'Blocked Hosts',
                stats: '0',
                avatarIcon: 'tabler-user-x',
                avatarColor: 'error',
                trend: 'negative',
                subtitle: 'Blocked accounts'
              },
              {
                title: 'Available Hosts',
                stats: '0',
                avatarIcon: 'tabler-user-plus',
                avatarColor: 'warning',
                trend: 'positive',
                trendNumber: '0%',
                subtitle: 'Available status hosts'
              }
            ]
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHostStats()
  }, [isFake])

  if (loading) {
    return (
      <Grid container spacing={6}>
        {[1, 2, 3, 4].map(i => (
          <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
            <div className='animate-pulse bg-gray-200 h-24 rounded-lg'></div>
          </Grid>
        ))}
      </Grid>
    )
  }

  return (
    <Grid container spacing={6}>
      {data.map((item, i) => (
        <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
          <HorizontalWithSubtitle {...item} />
        </Grid>
      ))}
    </Grid>
  )
}

export default HostListCards
