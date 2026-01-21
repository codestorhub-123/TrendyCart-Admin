'use client'

// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import { useParams } from 'next/navigation'

// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import DashboardSummaryCard from './DashboardSummaryCard'

// Service Imports
import { getDashboardCount } from '@/services/dashboardService'

const DashboardSummary = () => {
  // Hooks
  const { lang: locale } = useParams()

  // States
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getDashboardCount()
        if (res.status) {
          setData(res.dashboard)
        }
      } catch (error) {
        console.error('DashboardSummary: Failed to fetch dashboard statistics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const statsData = [
    {
      title: 'Total Users',
      stats: data?.totalUsers || 0,
      avatarIcon: 'tabler-users',
      avatarColor: 'primary',
      href: `/${locale}/apps/user/list`
    },
    {
      title: 'Total Orders',
      stats: data?.totalOrders || 0,
      avatarIcon: 'tabler-shopping-cart',
      avatarColor: 'warning',
      href: `/${locale}/apps/ecommerce/orders/list`
    },
    {
      title: 'Live Sellers',
      stats: data?.totalLiveSeller || 0,
      avatarIcon: 'tabler-broadcast',
      avatarColor: 'error',
      href: `/${locale}/apps/seller/live`
    },
    {
      title: 'Total Products',
      stats: data?.totalProducts || 0,
      avatarIcon: 'tabler-package',
      avatarColor: 'success',
      href: `/${locale}/apps/ecommerce/products/real`
    },
 
    {
      title: 'Total Categories',
      stats: data?.totalCategory || 0,
      avatarIcon: 'tabler-category',
      avatarColor: 'info',
      href: `/${locale}/apps/ecommerce/products/category`
    },
    {
      title: 'Total Sub Categories',
      stats: data?.totalSubCategory || 0,
      avatarIcon: 'tabler-category-2',
      avatarColor: 'success',
      href: `/${locale}/apps/ecommerce/products/category/sub-category`
    },
    {
      title: 'Admin Commission',
      stats: data?.totalAdminCommission || 0,
      avatarIcon: 'tabler-currency-dollar',
      avatarColor: 'warning',
      href: `/${locale}/apps/finance/admin-earning`
    }
  ]

  if (loading) {
    return null // Or a loader
  }

  return (
    <Grid container spacing={6}>
      {statsData.map((item, index) => (
        <Grid key={index} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <DashboardSummaryCard {...item} />
        </Grid>
      ))}
    </Grid>
  )
}

export default DashboardSummary
