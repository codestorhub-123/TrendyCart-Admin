'use client'

import { useEffect, useState } from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import classnames from 'classnames'
import CustomAvatar from '@core/components/mui/Avatar'
import { getAdminOwnStats } from '@/services/orderService'

const MyStoreDashboard = () => {
  const [stats, setStats] = useState(null)
  const isBelowMdScreen = useMediaQuery(theme => theme.breakpoints.down('md'))
  const isBelowSmScreen = useMediaQuery(theme => theme.breakpoints.down('sm'))

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getAdminOwnStats()
        if (res.status) {
          setStats(res.data)
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      }
    }
    fetchStats()
  }, [])

  const data = [
    {
      value: stats?.totalOrders || 0,
      title: 'Total Store Orders',
      icon: 'tabler-shopping-cart'
    },
    {
      value: stats?.pendingOrders || 0,
      title: 'Pending Orders',
      icon: 'tabler-calendar-stats'
    },
    {
      value: stats?.totalEarnings || 0,
      title: 'Total Earnings',
      icon: 'tabler-currency-dollar'
    },
    {
      value: stats?.activeProducts || 0,
      title: 'Active Products',
      icon: 'tabler-package'
    }
  ]

  return (
    <Card>
      <CardContent>
        <Grid container spacing={6}>
          {data.map((item, index) => (
            <Grid
              size={{ xs: 12, sm: 6, md: 3 }}
              key={index}
              className={classnames({
                '[&:nth-of-type(odd)>div]:pie-6 [&:nth-of-type(odd)>div]:border-ie':
                  isBelowMdScreen && !isBelowSmScreen,
                '[&:not(:last-child)>div]:pie-6 [&:not(:last-child)>div]:border-ie': !isBelowMdScreen
              })}
            >
              <div className='flex justify-between gap-4'>
                <div className='flex flex-col items-start'>
                  <Typography variant='h4'>{item.value.toLocaleString()}</Typography>
                  <Typography>{item.title}</Typography>
                </div>
                <CustomAvatar variant='rounded' size={42} skin='light'>
                  <i className={classnames(item.icon, 'text-[26px]')} />
                </CustomAvatar>
              </div>
              {isBelowMdScreen && !isBelowSmScreen && index < data.length - 2 && (
                <Divider
                  className={classnames('mbs-6', {
                    'mie-6': index % 2 === 0
                  })}
                />
              )}
              {isBelowSmScreen && index < data.length - 1 && <Divider className='mbs-6' />}
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  )
}

export default MyStoreDashboard
